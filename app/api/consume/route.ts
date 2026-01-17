import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Decimal } from "decimal.js"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const { memberId, items, paymentMethod, remark } = body

    // 验证数据
    if (!memberId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "请选择会员和消费项目" },
        { status: 400 }
      )
    }

    // 使用事务处理消费
    const result = await db.$transaction(async (tx) => {
      // 获取会员信息（包含等级折扣）
      const member = await tx.member.findUnique({
        where: { id: memberId },
        include: { level: true },
      })

      if (!member) {
        throw new Error("会员不存在")
      }

      // 计算总金额
      let totalAmount = new Decimal(0)
      const consumeItems = []

      for (const item of items) {
        const { type, itemId, quantity, price } = item

        // 验证商品/服务是否存在
        if (type === "product") {
          const product = await tx.product.findUnique({
            where: { id: itemId },
          })
          if (!product) {
            throw new Error(`商品不存在: ${itemId}`)
          }
          // 检查库存
          if (new Decimal(product.stock).lt(quantity)) {
            throw new Error(`${product.name} 库存不足`)
          }
        } else if (type === "service") {
          const service = await tx.service.findUnique({
            where: { id: itemId },
          })
          if (!service) {
            throw new Error(`服务不存在: ${itemId}`)
          }
        }

        // 应用会员折扣
        const discount = member.level?.discount || new Decimal(1)
        const itemPrice = new Decimal(price)
        const discountedPrice = itemPrice.mul(discount)
        const itemTotal = discountedPrice.mul(quantity)

        totalAmount = totalAmount.add(itemTotal)

        consumeItems.push({
          itemType: type,
          itemId,
          itemName: item.name,
          unitPrice: itemPrice,
          quantity,
          subtotal: itemTotal,
        })
      }

      // 如果使用储值支付，检查余额并扣除
      if (paymentMethod === "balance") {
        const memberBalance = new Decimal(member.balance)
        const memberGiftBalance = new Decimal(member.giftBalance)
        const totalBalance = memberBalance.add(memberGiftBalance)

        if (totalBalance.lt(totalAmount)) {
          throw new Error("余额不足")
        }

        // 优先使用赠送余额
        let remainingAmount = totalAmount
        let giftUsed = new Decimal(0)
        let balanceUsed = new Decimal(0)

        if (memberGiftBalance.gte(remainingAmount)) {
          // 赠送余额足够
          giftUsed = remainingAmount
        } else {
          // 需要使用本金余额
          giftUsed = memberGiftBalance
          balanceUsed = remainingAmount.sub(giftUsed)
        }

        // 更新会员余额
        await tx.member.update({
          where: { id: memberId },
          data: {
            balance: memberBalance.sub(balanceUsed),
            giftBalance: memberGiftBalance.sub(giftUsed),
            totalConsume: {
              increment: totalAmount,
            },
            points: {
              increment: totalAmount.mul(member.level?.pointsRate || 1).toNumber(),
            },
          },
        })
      } else {
        // 现金/微信/支付宝等支付方式，只更新累计消费和积分
        await tx.member.update({
          where: { id: memberId },
          data: {
            totalConsume: {
              increment: totalAmount,
            },
            points: {
              increment: totalAmount.mul(member.level?.pointsRate || 1).toNumber(),
            },
          },
        })
      }

      // 创建消费记录
      const consumeRecord = await tx.consumeRecord.create({
        data: {
          memberId,
          totalAmount,
          discountAmount: new Decimal(0),
          actualAmount: totalAmount,
          balancePaid: paymentMethod === "balance" ? totalAmount : new Decimal(0),
          cashPaid: paymentMethod === "balance" ? new Decimal(0) : totalAmount,
          operatorId: (session.user as any).id,
          status: "success",
          items: {
            create: consumeItems,
          },
        },
        include: {
          items: true,
        },
      })

      // 如果包含商品，减少库存
      for (const item of items) {
        if (item.type === "product") {
          await tx.product.update({
            where: { id: item.itemId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })

          // 获取产品当前库存
          const product = await tx.product.findUnique({
            where: { id: item.itemId },
            select: { stock: true },
          })

          // 记录库存流水
          await tx.stockLog.create({
            data: {
              productId: item.itemId,
              type: "out",
              quantity: item.quantity,
              beforeStock: product?.stock || 0,
              afterStock: (product?.stock || 0) - item.quantity,
              relatedId: consumeRecord.id,
              operatorId: (session.user as any).id,
              reason: "消费出库",
            },
          })
        }
      }

      return consumeRecord
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("消费失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "消费失败"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const memberId = searchParams.get("memberId")

    const skip = (page - 1) * pageSize

    const where = memberId ? { memberId } : {}

    const [records, total] = await Promise.all([
      db.consumeRecord.findMany({
        where,
        include: {
          member: {
            include: {
              level: true,
            },
          },
          operator: true,
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      db.consumeRecord.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        records,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取消费记录失败:", error)
    return NextResponse.json(
      { success: false, error: "获取消费记录失败" },
      { status: 500 }
    )
  }
}
