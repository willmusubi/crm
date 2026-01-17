import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const packages = await db.rechargePackage.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        amount: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      data: packages,
    })
  } catch (error) {
    console.error("获取充值套餐失败:", error)
    return NextResponse.json(
      { success: false, error: "获取充值套餐失败" },
      { status: 500 }
    )
  }
}
