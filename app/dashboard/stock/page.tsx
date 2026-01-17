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

interface Product {
  id: string
  name: string
  stock: number
  unit: string
  category: {
    name: string
  }
}

interface StockLog {
  id: string
  quantity: number
  type: string
  relatedType: string
  remark: string | null
  createdAt: string
  product: {
    name: string
    category: {
      name: string
    }
  }
  operator: {
    name: string
  }
}

export default function StockPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [logs, setLogs] = useState<StockLog[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterType, setFilterType] = useState("all")

  const [formData, setFormData] = useState({
    productId: "",
    type: "in",
    quantity: "",
    remark: "",
  })

  useEffect(() => {
    fetchProducts()
    fetchLogs()
  }, [page, filterType])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?includeAll=true")
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error("获取产品列表失败:", error)
    }
  }

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
      })

      if (filterType && filterType !== "all") {
        params.append("type", filterType)
      }

      const res = await fetch(`/api/stock-logs?${params}`)
      const data = await res.json()
      if (data.success) {
        setLogs(data.data.logs)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      console.error("获取库存流水失败:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/stock-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert("操作成功")
        setDialogOpen(false)
        setFormData({
          productId: "",
          type: "in",
          quantity: "",
          remark: "",
        })
        fetchProducts()
        fetchLogs()
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

  const getTypeText = (type: string) => {
    const map: Record<string, string> = {
      in: "入库",
      out: "出库",
    }
    return map[type] || type
  }

  const getRelatedTypeText = (type: string) => {
    const map: Record<string, string> = {
      purchase: "采购入库",
      adjustment: "库存调整",
      consume: "消费出库",
      return: "退货入库",
    }
    return map[type] || type
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">库存管理</h1>
        <p className="text-muted-foreground mt-2">管理产品库存和流水记录</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>库存操作</CardTitle>
            <CardDescription>入库/出库</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setDialogOpen(true)}>
              库存操作
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>产品总数</CardTitle>
            <CardDescription>库存管理中</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>操作记录</CardTitle>
            <CardDescription>流水总数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>库存流水</CardTitle>
              <CardDescription>共 {total} 条记录</CardDescription>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="in">入库</SelectItem>
                <SelectItem value="out">出库</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>业务类型</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>操作员</TableHead>
                <TableHead>备注</TableHead>
                <TableHead>操作时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.product.category.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        log.type === "in"
                          ? "text-green-600 font-semibold"
                          : "text-orange-600 font-semibold"
                      }
                    >
                      {getTypeText(log.type)}
                    </span>
                  </TableCell>
                  <TableCell>{getRelatedTypeText(log.relatedType)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        log.quantity > 0 ? "text-green-600" : "text-orange-600"
                      }
                    >
                      {log.quantity > 0 ? "+" : ""}
                      {log.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{log.operator.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.remark || "-"}
                  </TableCell>
                  <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {logs.length > 0 && (
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

      {/* 库存操作对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>库存操作</DialogTitle>
            <DialogDescription>入库或出库操作</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>产品 *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择产品" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - 当前库存: {product.stock}
                        {product.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>操作类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">入库</SelectItem>
                    <SelectItem value="out">出库</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">数量 *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>

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
                {loading ? "处理中..." : "确认"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
