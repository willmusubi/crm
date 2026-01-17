"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDateTime } from "@/lib/utils"

interface Member {
  id: string
  name: string
  memberNo: string
}

interface Service {
  id: string
  name: string
  duration: number
}

interface Staff {
  id: string
  name: string
}

interface Appointment {
  id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  remark: string | null
  member: Member
  service: Service
  staff: Staff | null
}

export default function AppointmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const [formData, setFormData] = useState({
    memberId: "",
    serviceId: "",
    staffId: "",
    appointmentDate: "",
    startTime: "",
    endTime: "",
    status: "pending",
    remark: "",
  })

  useEffect(() => {
    fetchAppointments()
    fetchMembers()
    fetchServices()
    fetchStaff()
  }, [page, filterStatus])

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
      })

      if (filterStatus && filterStatus !== "all") {
        params.append("status", filterStatus)
      }

      const res = await fetch(`/api/appointments?${params}`)
      const data = await res.json()
      if (data.success) {
        setAppointments(data.data.appointments)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      console.error("获取预约列表失败:", error)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members?pageSize=100")
      const data = await res.json()
      if (data.success) {
        setMembers(data.data.members)
      }
    } catch (error) {
      console.error("获取会员列表失败:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services?includeAll=true")
      const data = await res.json()
      if (data.success) {
        setServices(data.data)
      }
    } catch (error) {
      console.error("获取服务列表失败:", error)
    }
  }

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff?includeAll=true&role=technician&status=active")
      const data = await res.json()
      if (data.success) {
        setStaffList(data.data)
      }
    } catch (error) {
      console.error("获取技师列表失败:", error)
    }
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    // 只在新建预约且有开始时间时自动计算结束时间，编辑时不自动改变
    if (service && formData.startTime && !editingAppointment) {
      // 根据服务时长自动计算结束时间
      const [hours, minutes] = formData.startTime.split(":")
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes)
      const endMinutes = startMinutes + service.duration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`

      setFormData({
        ...formData,
        serviceId,
        endTime,
      })
    } else {
      setFormData({ ...formData, serviceId })
    }
  }

  const handleStartTimeChange = (startTime: string) => {
    if (formData.serviceId && startTime) {
      const service = services.find((s) => s.id === formData.serviceId)
      if (service) {
        const [hours, minutes] = startTime.split(":")
        const startMinutes = parseInt(hours) * 60 + parseInt(minutes)
        const endMinutes = startMinutes + service.duration
        const endHours = Math.floor(endMinutes / 60)
        const endMins = endMinutes % 60
        const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`

        setFormData({ ...formData, startTime, endTime })
        return
      }
    }
    setFormData({ ...formData, startTime })
  }

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment)
      // 从ISO时间格式提取日期
      const date = appointment.appointmentDate.split("T")[0]
      // 从ISO时间格式提取时间 (UTC时间)
      const startTimeDate = new Date(appointment.startTime)
      const endTimeDate = new Date(appointment.endTime)
      const startTime = startTimeDate.toISOString().substring(11, 16)
      const endTime = endTimeDate.toISOString().substring(11, 16)

      setFormData({
        memberId: appointment.member.id,
        serviceId: appointment.service.id,
        staffId: appointment.staff?.id || "",
        appointmentDate: date,
        startTime,
        endTime,
        status: appointment.status,
        remark: appointment.remark || "",
      })
    } else {
      setEditingAppointment(null)
      setFormData({
        memberId: "",
        serviceId: "",
        staffId: "",
        appointmentDate: "",
        startTime: "",
        endTime: "",
        status: "pending",
        remark: "",
      })
    }
    setDialogOpen(true)
  }

  const handleOpenCancelDialog = (appointment: Appointment) => {
    setCancellingAppointment(appointment)
    setCancelReason("")
    setCancelDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment.id}`
        : "/api/appointments"

      const method = editingAppointment ? "PUT" : "POST"

      // 处理空字符串的 staffId
      const submitData = {
        ...formData,
        staffId: formData.staffId || undefined,
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await res.json()

      if (data.success) {
        alert(editingAppointment ? "更新成功" : "创建成功")
        setDialogOpen(false)
        fetchAppointments()
      } else {
        alert(data.error || "操作失败")
      }
    } catch (error) {
      console.error("操作失败:", error)
      alert("操作失败")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancellingAppointment) return

    setLoading(true)

    try {
      const res = await fetch(`/api/appointments/${cancellingAppointment.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason }),
      })

      const data = await res.json()

      if (data.success) {
        alert("取消成功")
        setCancelDialogOpen(false)
        fetchAppointments()
      } else {
        alert(data.error || "取消失败")
      }
    } catch (error) {
      console.error("取消失败:", error)
      alert("取消失败")
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: "待确认",
      confirmed: "已确认",
      completed: "已完成",
      cancelled: "已取消",
      no_show: "未到店",
    }
    return map[status] || status
  }

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "text-yellow-600",
      confirmed: "text-blue-600",
      completed: "text-green-600",
      cancelled: "text-gray-400",
      no_show: "text-red-600",
    }
    return map[status] || ""
  }

  const getStatusStats = () => {
    const stats = {
      pending: 0,
      confirmed: 0,
      completed: 0,
    }
    appointments.forEach((a) => {
      if (a.status in stats) {
        stats[a.status as keyof typeof stats]++
      }
    })
    return stats
  }

  const stats = getStatusStats()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">预约管理</h1>
        <p className="text-muted-foreground mt-2">管理会员预约和服务安排</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>待确认</CardTitle>
            <CardDescription>等待确认的预约</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>已确认</CardTitle>
            <CardDescription>已确认的预约</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>已完成</CardTitle>
            <CardDescription>完成的服务</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>预约列表</CardTitle>
              <CardDescription>共 {total} 条预约</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>新增预约</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待确认</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
                <SelectItem value="no_show">未到店</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>预约日期</TableHead>
                <TableHead>时间段</TableHead>
                <TableHead>会员</TableHead>
                <TableHead>服务</TableHead>
                <TableHead>技师</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {new Date(appointment.appointmentDate).toLocaleDateString("zh-CN")}
                  </TableCell>
                  <TableCell>
                    {new Date(appointment.startTime).toISOString().substring(11, 16)} -{" "}
                    {new Date(appointment.endTime).toISOString().substring(11, 16)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.member.memberNo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.service.name}</TableCell>
                  <TableCell>{appointment.staff?.name || "-"}</TableCell>
                  <TableCell>
                    <span className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(appointment)}
                      disabled={appointment.status === "cancelled"}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenCancelDialog(appointment)}
                      disabled={appointment.status === "cancelled" || appointment.status === "completed"}
                    >
                      取消
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {appointments.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                显示 {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} 条，共 {total} 条
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * 20 >= total}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 预约对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "编辑预约" : "新增预约"}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment ? "修改预约信息" : "创建新的预约"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>会员 *</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, memberId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择会员" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.memberNo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>服务项目 *</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={handleServiceChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择服务" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration}分钟)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>技师</Label>
                <Select
                  value={formData.staffId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, staffId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择技师（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无指定技师</SelectItem>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="appointmentDate">预约日期 *</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">开始时间 *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">结束时间 *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {editingAppointment && (
                <div className="grid gap-2">
                  <Label>预约状态</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">待确认</SelectItem>
                      <SelectItem value="confirmed">已确认</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="no_show">未到店</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="remark">备注</Label>
                <Input
                  id="remark"
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                  placeholder="选填"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 取消预约对话框 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>取消预约</DialogTitle>
            <DialogDescription>
              确定要取消这个预约吗？
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancelReason">取消原因</Label>
              <Input
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="请输入取消原因"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              返回
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? "取消中..." : "确认取消"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
