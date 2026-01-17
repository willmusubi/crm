"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { formatCurrency } from "@/lib/utils"

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
  status: string
}

export default function ServicesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
  })

  useEffect(() => {
    fetchServices()
  }, [page])

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
      })

      if (searchKeyword) {
        params.append("search", searchKeyword)
      }

      const res = await fetch(`/api/services?${params}`)
      const data = await res.json()
      if (data.success) {
        setServices(data.data.services)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      console.error("获取服务列表失败:", error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchServices()
  }

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        price: service.price.toString(),
        duration: service.duration.toString(),
        description: service.description || "",
      })
    } else {
      setEditingService(null)
      setFormData({
        name: "",
        price: "",
        duration: "",
        description: "",
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : "/api/services"

      const method = editingService ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        alert(editingService ? "更新成功" : "创建成功")
        setDialogOpen(false)
        fetchServices()
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

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个服务吗？")) {
      return
    }

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        alert("删除成功")
        fetchServices()
      } else {
        alert(data.error || "删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败")
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">服务项目管理</h1>
        <p className="text-muted-foreground mt-2">管理服务项目和价格</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>服务总数</CardTitle>
            <CardDescription>活跃服务</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>平均时长</CardTitle>
            <CardDescription>服务耗时</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.length > 0
                ? Math.round(
                    services.reduce((sum, s) => sum + s.duration, 0) /
                      services.length
                  )
                : 0}
              分钟
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>平均价格</CardTitle>
            <CardDescription>服务定价</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.length > 0
                ? formatCurrency(
                    services.reduce((sum, s) => sum + s.price, 0) /
                      services.length
                  )
                : "¥0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>服务列表</CardTitle>
              <CardDescription>共 {total} 个服务项目</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>新增服务</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="搜索服务名称"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>搜索</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服务名称</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>时长</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{formatCurrency(service.price)}</TableCell>
                  <TableCell>{service.duration} 分钟</TableCell>
                  <TableCell className="text-muted-foreground">
                    {service.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(service)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {services.length > 0 && (
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

      {/* 服务对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "编辑服务" : "新增服务"}
            </DialogTitle>
            <DialogDescription>
              {editingService ? "修改服务信息" : "添加新的服务项目"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">服务名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">价格 *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">时长（分钟）*</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
    </div>
  )
}
