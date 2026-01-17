import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

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
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: "分类名称不能为空" },
        { status: 400 }
      )
    }

    const category = await db.productCategory.update({
      where: { id: params.id },
      data: {
        name,
        description,
      },
    })

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error("更新产品分类失败:", error)
    return NextResponse.json(
      { success: false, error: "更新产品分类失败" },
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

    // 检查是否有产品关联到此分类
    const productsCount = await db.product.count({
      where: { categoryId: params.id },
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { success: false, error: `该分类下还有 ${productsCount} 个产品，无法删除` },
        { status: 400 }
      )
    }

    await db.productCategory.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "删除成功",
    })
  } catch (error) {
    console.error("删除产品分类失败:", error)
    return NextResponse.json(
      { success: false, error: "删除产品分类失败" },
      { status: 500 }
    )
  }
}
