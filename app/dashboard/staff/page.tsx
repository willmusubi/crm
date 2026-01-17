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

interface Staff {
  id: string
  name: string
  phone: string | null
  role: string
  status: string
  createdAt: string
}

export default function StaffPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [staff, setStaff] = useState<Staff[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "technician",
  })

  useEffect(() => {
    fetchStaff()
  }, [page, filterRole, filterStatus])

  const fetchStaff = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
      })

      if (filterRole && filterRole !== "all") {
        params.append("role", filterRole)
      }

      if (filterStatus && filterStatus !== "all") {
        params.append("status", filterStatus)
      }

      if (searchKeyword) {
        params.append("search", searchKeyword)
      }

      const res = await fetch(`/api/staff?${params}`)
      const data = await res.json()
      if (data.success) {
        setStaff(data.data.staff)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      console.error("获取员工列表失败:", error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchStaff()
  }

  const handleOpenDialog = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff(staffMember)
      setFormData({
        name: staffMember.name,
        phone: staffMember.phone || "",
        role: staffMember.role,
      })
    } else {
      setEditingStaff(null)
      setFormData({
        name: "",
        phone: "",
        role: "technician",
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingStaff
        ? `/api/staff/${editingStaff.id}`
        : "/api/staff"

      const method = editingStaff ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        alert(editingStaff ? "更新成功" : "创建成功")
        setDialogOpen(false)
        fetchStaff()
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

  const handleResign = async (id: string) => {
    if (!confirm("确定要将该员工设为离职状态吗？")) {
      return
    }

    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        alert("操作成功")
        fetchStaff()
      } else {
        alert(data.error || "操作失败")
      }
    } catch (error) {
      console.error("操作失败:", error)
      alert("操作失败")
    }
  }

  const getRoleText = (role: string) => {
    const map: Record<string, string> = {
      technician: "技师",
      cashier: "收银员",
      manager: "经理",
    }
    return map[role] || role
  }

  const getStatusText = (status: string) => {
    return status === "active" ? "在职" : "离职"
  }

  const getRoleStats = () => {
    const stats = {
      technician: 0,
      cashier: 0,
      manager: 0,
    }
    // 只统计在职员工
    staff.filter(s => s.status === "active").forEach((s) => {
      if (s.role in stats) {
        stats[s.role as keyof typeof stats]++
      }
    })
    return stats
  }

  const getActiveCount = () => {
    return staff.filter(s => s.status === "active").length
  }

  const getInactiveCount = () => {
    return staff.filter(s => s.status === "inactive").length
  }

  const stats = getRoleStats()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">员工管理</h1>
        <p className="text-muted-foreground mt-2">管理员工和技师信息</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>在职员工</CardTitle>
            <CardDescription>当前在职</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getActiveCount()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>技师</CardTitle>
            <CardDescription>在职技师</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.technician}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>收银员</CardTitle>
            <CardDescription>在职收银</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cashier}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>离职员工</CardTitle>
            <CardDescription>历史记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{getInactiveCount()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>员工列表</CardTitle>
              <CardDescription>共 {total} 名员工</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>新增员工</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="筛选角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem value="technician">技师</SelectItem>
                <SelectItem value="cashier">收银员</SelectItem>
                <SelectItem value="manager">经理</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">在职</SelectItem>
                <SelectItem value="inactive">离职</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 flex-1">
              <Input
                placeholder="搜索员工姓名或手机号"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>搜索</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>入职时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell className="font-medium">
                    {staffMember.name}
                  </TableCell>
                  <TableCell>{staffMember.phone || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {getRoleText(staffMember.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        staffMember.status === "active"
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {getStatusText(staffMember.status)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDateTime(staffMember.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(staffMember)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResign(staffMember.id)}
                      disabled={staffMember.status === "inactive"}
                    >
                      离职
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {staff.length > 0 && (
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

      {/* 员工对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "编辑员工" : "新增员工"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff ? "修改员工信息" : "添加新的员工"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="选填"
                />
              </div>

              <div className="grid gap-2">
                <Label>角色 *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technician">技师</SelectItem>
                    <SelectItem value="cashier">收银员</SelectItem>
                    <SelectItem value="manager">经理</SelectItem>
                  </SelectContent>
                </Select>
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
    </div>
  )
}
