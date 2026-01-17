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
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const includeAll = searchParams.get("includeAll") === "true"

    const skip = (page - 1) * pageSize

    const where: any = {}

    // 如果指定了 status 参数，使用该参数；如果是 includeAll，不过滤；否则默认只显示在职
    if (status) {
      where.status = status
    } else if (!includeAll) {
      // 默认不过滤状态，显示所有员工（包括离职的）
    }

    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const [staff, total] = await Promise.all([
      db.staff.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: includeAll ? undefined : skip,
        take: includeAll ? undefined : pageSize,
      }),
      db.staff.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: includeAll ? staff : {
        staff,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取员工列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取员工列表失败" },
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
    const { name, phone, role } = body

    if (!name || !role) {
      return NextResponse.json(
        { success: false, error: "请填写必填字段" },
        { status: 400 }
      )
    }

    // 检查手机号是否重复
    if (phone) {
      const existingStaff = await db.staff.findFirst({
        where: { phone },
      })
      if (existingStaff) {
        return NextResponse.json(
          { success: false, error: "该手机号已存在" },
          { status: 400 }
        )
      }
    }

    const staff = await db.staff.create({
      data: {
        name,
        phone,
        role,
        status: "active",
      },
    })

    return NextResponse.json({
      success: true,
      data: staff,
    })
  } catch (error) {
    console.error("创建员工失败:", error)
    return NextResponse.json(
      { success: false, error: "创建员工失败" },
      { status: 500 }
    )
  }
}
