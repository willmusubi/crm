import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const levels = await db.memberLevel.findMany({
      orderBy: {
        levelOrder: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      data: levels,
    })
  } catch (error) {
    console.error("获取会员等级失败:", error)
    return NextResponse.json(
      { success: false, error: "获取会员等级失败" },
      { status: 500 }
    )
  }
}
