import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get("productId")
    const type = searchParams.get("type")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const skip = (page - 1) * pageSize

    const where: any = {}

    if (productId) {
      where.productId = productId
    }

    if (type) {
      where.type = type
    }

    const [logs, total] = await Promise.all([
      db.stockLog.findMany({
        where,
        include: {
          product: {
            include: {
              category: true,
            },
          },
          operator: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      db.stockLog.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取库存流水失败:", error)
    return NextResponse.json(
      { success: false, error: "获取库存流水失败" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, type, quantity, remark } = body

    if (!productId || !type || !quantity) {
      return NextResponse.json(
        { success: false, error: "请填写必填字段" },
        { status: 400 }
      )
    }

    if (quantity === 0) {
      return NextResponse.json(
        { success: false, error: "数量不能为0" },
        { status: 400 }
      )
    }

    // 使用事务处理库存变动
    const result = await db.$transaction(async (tx) => {
      // 获取当前库存
      const currentProduct = await tx.product.findUnique({
        where: { id: productId },
        select: { stock: true },
      })

      if (!currentProduct) {
        throw new Error("产品不存在")
      }

      const beforeStock = currentProduct.stock
      const afterStock = type === "in"
        ? beforeStock + quantity
        : beforeStock - quantity

      // 创建库存流水
      const stockLog = await tx.stockLog.create({
        data: {
          productId,
          type,
          quantity,
          beforeStock,
          afterStock,
          operatorId: (session.user as any).id,
          reason: remark,
        },
      })

      // 更新产品库存
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          stock: afterStock,
        },
      })

      // 检查库存是否为负
      if (product.stock < 0) {
        throw new Error("库存不足")
      }

      return { stockLog, product }
    })

    return NextResponse.json({
      success: true,
      data: result.stockLog,
    })
  } catch (error) {
    console.error("库存操作失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "库存操作失败"
      },
      { status: 500 }
    )
  }
}
