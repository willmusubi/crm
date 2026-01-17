import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Decimal } from "decimal.js"

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
    const { name, price, duration, description, status } = body

    if (!name || price === undefined || duration === undefined) {
      return NextResponse.json(
        { success: false, error: "请填写必填字段" },
        { status: 400 }
      )
    }

    const service = await db.service.update({
      where: { id: params.id },
      data: {
        name,
        price: new Decimal(price),
        duration,
        description,
        status,
      },
    })

    return NextResponse.json({
      success: true,
      data: service,
    })
  } catch (error) {
    console.error("更新服务失败:", error)
    return NextResponse.json(
      { success: false, error: "更新服务失败" },
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

    // 软删除：将状态设为 inactive
    const service = await db.service.update({
      where: { id: params.id },
      data: {
        status: "inactive",
      },
    })

    return NextResponse.json({
      success: true,
      data: service,
    })
  } catch (error) {
    console.error("删除服务失败:", error)
    return NextResponse.json(
      { success: false, error: "删除服务失败" },
      { status: 500 }
    )
  }
}
