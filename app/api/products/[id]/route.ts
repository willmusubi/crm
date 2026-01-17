import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Decimal } from "decimal.js"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "产品不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("获取产品详情失败:", error)
    return NextResponse.json(
      { success: false, error: "获取产品详情失败" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const { sku, name, categoryId, price, cost, unit, minStock, status } = body

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { success: false, error: "请填写必填字段" },
        { status: 400 }
      )
    }

    // 如果修改SKU，检查是否重复
    if (sku) {
      const existingProduct = await db.product.findFirst({
        where: {
          sku,
          id: { not: params.id },
        },
      })
      if (existingProduct) {
        return NextResponse.json(
          { success: false, error: "产品SKU已存在" },
          { status: 400 }
        )
      }
    }

    const product = await db.product.update({
      where: { id: params.id },
      data: {
        sku,
        name,
        categoryId,
        price: new Decimal(price),
        cost: cost !== undefined ? new Decimal(cost) : undefined,
        unit,
        minStock,
        status,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("更新产品失败:", error)
    return NextResponse.json(
      { success: false, error: "更新产品失败" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 软删除：将状态设为 off_sale
    const product = await db.product.update({
      where: { id: params.id },
      data: {
        status: "off_sale",
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("删除产品失败:", error)
    return NextResponse.json(
      { success: false, error: "删除产品失败" },
      { status: 500 }
    )
  }
}
