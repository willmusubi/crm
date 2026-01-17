import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const { name, phone, role, status } = body

    if (!name || !role) {
      return NextResponse.json(
        { success: false, error: "请填写必填字段" },
        { status: 400 }
      )
    }

    // 如果修改手机号，检查是否重复
    if (phone) {
      const existingStaff = await db.staff.findFirst({
        where: {
          phone,
          id: { not: id },
        },
      })
      if (existingStaff) {
        return NextResponse.json(
          { success: false, error: "该手机号已存在" },
          { status: 400 }
        )
      }
    }

    const staff = await db.staff.update({
      where: { id },
      data: {
        name,
        phone,
        role,
        status,
      },
    })

    return NextResponse.json({
      success: true,
      data: staff,
    })
  } catch (error) {
    console.error("更新员工失败:", error)
    return NextResponse.json(
      { success: false, error: "更新员工失败" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { id } = await params

    // 软删除：将状态设为 inactive
    const staff = await db.staff.update({
      where: { id },
      data: {
        status: "inactive",
      },
    })

    return NextResponse.json({
      success: true,
      data: staff,
    })
  } catch (error) {
    console.error("删除员工失败:", error)
    return NextResponse.json(
      { success: false, error: "删除员工失败" },
      { status: 500 }
    )
  }
}
