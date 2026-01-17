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
    const { memberId, amount, giftAmount, paymentMethod, packageId, remark } = body

    // 使用事务处理充值
    const result = await db.$transaction(async (tx) => {
      // 创建充值记录
      const rechargeRecord = await tx.rechargeRecord.create({
        data: {
          memberId,
          amount: new Decimal(amount),
          giftAmount: new Decimal(giftAmount || 0),
          paymentMethod,
          packageId,
          operatorId: (session.user as any).id,
          status: "success",
          remark,
        },
      })

      // 更新会员余额和累计充值
      const member = await tx.member.update({
        where: { id: memberId },
        data: {
          balance: {
            increment: new Decimal(amount),
          },
          giftBalance: {
            increment: new Decimal(giftAmount || 0),
          },
          totalRecharge: {
            increment: new Decimal(amount),
          },
        },
      })

      // 检查是否需要升级会员等级
      const levels = await tx.memberLevel.findMany({
        orderBy: { levelOrder: "desc" },
      })

      for (const level of levels) {
        if (
          new Decimal(member.totalRecharge).gte(level.upgradeAmount) &&
          level.id !== member.levelId
        ) {
          await tx.member.update({
            where: { id: memberId },
            data: { levelId: level.id },
          })
          break
        }
      }

      return { rechargeRecord, member }
    })

    return NextResponse.json({
      success: true,
      data: result.rechargeRecord,
    })
  } catch (error) {
    console.error("充值失败:", error)
    return NextResponse.json(
      { success: false, error: "充值失败" },
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

    const skip = (page - 1) * pageSize

    const [records, total] = await Promise.all([
      db.rechargeRecord.findMany({
        include: {
          member: true,
          operator: true,
          package: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      db.rechargeRecord.count(),
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
    console.error("获取充值记录失败:", error)
    return NextResponse.json(
      { success: false, error: "获取充值记录失败" },
      { status: 500 }
    )
  }
}
