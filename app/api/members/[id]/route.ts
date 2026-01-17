import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const member = await db.member.findUnique({
      where: { id: params.id },
      include: {
        level: true,
        rechargeRecords: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        consumeRecords: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { success: false, error: "会员不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: member,
    })
  } catch (error) {
    console.error("获取会员详情失败:", error)
    return NextResponse.json(
      { success: false, error: "获取会员详情失败" },
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
    const { name, phone, gender, birthday, levelId, remark } = body

    // 检查会员是否存在
    const existingMember = await db.member.findUnique({
      where: { id: params.id },
    })

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: "会员不存在" },
        { status: 404 }
      )
    }

    // 如果修改了手机号，检查新手机号是否已被使用
    if (phone !== existingMember.phone) {
      const phoneExists = await db.member.findUnique({
        where: { phone },
      })

      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: "该手机号已被使用" },
          { status: 400 }
        )
      }
    }

    // 更新会员信息
    const member = await db.member.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        gender: gender || "unknown",
        birthday: birthday ? new Date(birthday) : null,
        levelId,
        remark,
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
    console.error("更新会员失败:", error)
    return NextResponse.json(
      { success: false, error: "更新会员失败" },
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

    // 软删除：更新状态为 deleted
    const member = await db.member.update({
      where: { id: params.id },
      data: { status: "deleted" },
    })

    return NextResponse.json({
      success: true,
      data: member,
    })
  } catch (error) {
    console.error("删除会员失败:", error)
    return NextResponse.json(
      { success: false, error: "删除会员失败" },
      { status: 500 }
    )
  }
}
