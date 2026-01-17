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
    const { memberId, serviceId, staffId, appointmentDate, startTime, endTime, status, remark, cancelReason } = body

    if (!memberId || !serviceId || !appointmentDate || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "请填写必填字段" },
        { status: 400 }
      )
    }

    // 如果修改技师或时间，检查是否有冲突
    if (staffId && (status === "pending" || status === "confirmed")) {
      const conflictAppointment = await db.appointment.findFirst({
        where: {
          id: { not: id },
          staffId,
          appointmentDate: new Date(appointmentDate),
          status: {
            in: ["pending", "confirmed"],
          },
          OR: [
            {
              AND: [
                { startTime: { lte: new Date(`1970-01-01T${startTime}:00.000Z`) } },
                { endTime: { gt: new Date(`1970-01-01T${startTime}:00.000Z`) } },
              ],
            },
            {
              AND: [
                { startTime: { lt: new Date(`1970-01-01T${endTime}:00.000Z`) } },
                { endTime: { gte: new Date(`1970-01-01T${endTime}:00.000Z`) } },
              ],
            },
          ],
        },
      })

      if (conflictAppointment) {
        return NextResponse.json(
          { success: false, error: "该技师在该时段已有预约" },
          { status: 400 }
        )
      }
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: {
        memberId,
        serviceId,
        staffId,
        appointmentDate: new Date(appointmentDate),
        startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
        endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
        status,
        remark,
        cancelReason,
      },
      include: {
        member: true,
        service: true,
        staff: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    console.error("更新预约失败:", error)
    return NextResponse.json(
      { success: false, error: "更新预约失败" },
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

    const body = await request.json()
    const { cancelReason } = body

    // 取消预约
    const appointment = await db.appointment.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelReason: cancelReason || "取消预约",
      },
    })

    return NextResponse.json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    console.error("取消预约失败:", error)
    return NextResponse.json(
      { success: false, error: "取消预约失败" },
      { status: 500 }
    )
  }
}
