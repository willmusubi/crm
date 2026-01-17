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
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * pageSize

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { memberNo: { contains: search } },
          ],
        }
      : {}

    const [members, total] = await Promise.all([
      db.member.findMany({
        where,
        include: {
          level: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      db.member.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        members,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取会员列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取会员列表失败" },
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
    const { name, phone, gender, birthday, levelId, remark } = body

    // 检查手机号是否已存在
    const existingMember = await db.member.findUnique({
      where: { phone },
    })

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "该手机号已被使用" },
        { status: 400 }
      )
    }

    // 生成会员编号
    const count = await db.member.count()
    const memberNo = `M${String(count + 1).padStart(6, "0")}`

    // 创建会员
    const member = await db.member.create({
      data: {
        memberNo,
        name,
        phone,
        gender: gender || "unknown",
        birthday: birthday ? new Date(birthday) : null,
        levelId,
        remark,
        status: "active",
      },
      include: {
        level: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: member,
    })
  } catch (error) {
    console.error("创建会员失败:", error)
    return NextResponse.json(
      { success: false, error: "创建会员失败" },
      { status: 500 }
    )
  }
}
