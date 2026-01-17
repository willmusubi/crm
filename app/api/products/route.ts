import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Decimal } from "decimal.js"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const includeAll = searchParams.get("includeAll") === "true"

    const skip = (page - 1) * pageSize

    const where: any = {}

    // 如果不是获取全部，则只返回在售状态
    if (!includeAll) {
      where.status = "on_sale"
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: includeAll ? undefined : skip,
        take: includeAll ? undefined : pageSize,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: includeAll ? products : {
        products,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取商品列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取商品列表失败" },
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
    const { sku, name, categoryId, price, cost, stock, unit, minStock } = body

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { success: false, error: "请填写必填字段" },
        { status: 400 }
      )
    }

    // 检查SKU是否重复
    if (sku) {
      const existingProduct = await db.product.findFirst({
        where: { sku },
      })
      if (existingProduct) {
        return NextResponse.json(
          { success: false, error: "产品SKU已存在" },
          { status: 400 }
        )
      }
    }

    const product = await db.product.create({
      data: {
        sku,
        name,
        categoryId,
        price: new Decimal(price),
        cost: cost !== undefined ? new Decimal(cost) : undefined,
        stock: stock || 0,
        unit: unit || "件",
        minStock: minStock || 0,
        status: "on_sale",
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
    console.error("创建产品失败:", error)
    return NextResponse.json(
      { success: false, error: "创建产品失败" },
      { status: 500 }
    )
  }
}
