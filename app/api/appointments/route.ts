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
    const memberId = searchParams.get("memberId")
    const staffId = searchParams.get("staffId")
    const status = searchParams.get("status")
    const date = searchParams.get("date")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const skip = (page - 1) * pageSize

    const where: any = {}

    if (memberId) {
      where.memberId = memberId
    }

    if (staffId) {
      where.staffId = staffId
    }

    if (status) {
      where.status = status
    }

    if (date) {
      where.appointmentDate = new Date(date)
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          member: true,
          service: true,
          staff: true,
        },
        orderBy: [
          { appointmentDate: "desc" },
          { startTime: "desc" },
        ],
        skip,
        take: pageSize,
      }),
      db.appointment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取预约列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取预约列表失败" },
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
    const { memberId, serviceId, staffId, appointmentDate, startTime, endTime, remark } = body

    if (!memberId || !serviceId || !appointmentDate || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "请填写必填字段" },
        { status: 400 }
      )
    }

    // 检查技师在该时段是否有冲突
    if (staffId) {
      const conflictAppointment = await db.appointment.findFirst({
        where: {
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

    const appointment = await db.appointment.create({
      data: {
        memberId,
        serviceId,
        staffId,
        appointmentDate: new Date(appointmentDate),
        startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
        endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
        status: "pending",
        remark,
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
    console.error("创建预约失败:", error)
    return NextResponse.json(
      { success: false, error: "创建预约失败" },
      { status: 500 }
    )
  }
}
