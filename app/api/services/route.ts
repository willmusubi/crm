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
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const includeAll = searchParams.get("includeAll") === "true"

    const skip = (page - 1) * pageSize

    const where: any = {}

    if (!includeAll) {
      where.status = "active"
    }

    if (search) {
      where.name = { contains: search }
    }

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: includeAll ? undefined : skip,
        take: includeAll ? undefined : pageSize,
      }),
      db.service.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: includeAll ? services : {
        services,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取服务列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取服务列表失败" },
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
    const { name, price, duration, description } = body

    if (!name || price === undefined || duration === undefined) {
      return NextResponse.json(
        { success: false, error: "请填写必填字段" },
        { status: 400 }
      )
    }

    const service = await db.service.create({
      data: {
        name,
        price: new Decimal(price),
        duration,
        description,
        status: "active",
      },
    })

    return NextResponse.json({
      success: true,
      data: service,
    })
  } catch (error) {
    console.error("创建服务失败:", error)
    return NextResponse.json(
      { success: false, error: "创建服务失败" },
      { status: 500 }
    )
  }
}
