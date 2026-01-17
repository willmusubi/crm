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
import { formatCurrency } from "@/lib/utils"

interface ProductCategory {
  id: string
  name: string
  _count?: {
    products: number
  }
}

interface Product {
  id: string
  sku: string | null
  name: string
  category: {
    id: string
    name: string
  }
  price: number
  cost: number
  stock: number
  minStock: number
  unit: string
  status: string
}

export default function ProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    categoryId: "",
    price: "",
    cost: "",
    stock: "0",
    unit: "件",
    minStock: "0",
  })

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [page, selectedCategory])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/product-categories")
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("获取分类失败:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
      })

      if (selectedCategory && selectedCategory !== "all") {
        params.append("categoryId", selectedCategory)
      }

      if (searchKeyword) {
        params.append("search", searchKeyword)
      }

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data.products)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      console.error("获取产品列表失败:", error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchProducts()
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        sku: product.sku || "",
        name: product.name,
        categoryId: product.category.id,
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock: product.stock.toString(),
        unit: product.unit,
        minStock: product.minStock.toString(),
      })
    } else {
      setEditingProduct(null)
      setFormData({
        sku: "",
        name: "",
        categoryId: "",
        price: "",
        cost: "",
        stock: "0",
        unit: "件",
        minStock: "0",
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products"

      const method = editingProduct ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        alert(editingProduct ? "更新成功" : "创建成功")
        setDialogOpen(false)
        fetchProducts()
        fetchCategories()
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
    if (!confirm("确定要删除这个产品吗？")) {
      return
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        alert("删除成功")
        fetchProducts()
      } else {
        alert(data.error || "删除失败")
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败")
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryFormData),
      })

      const data = await res.json()

      if (data.success) {
        alert("分类创建成功")
        setCategoryDialogOpen(false)
        setCategoryFormData({ name: "", description: "" })
        fetchCategories()
      } else {
        alert(data.error || "创建失败")
      }
    } catch (error) {
      console.error("创建失败:", error)
      alert("创建失败")
    } finally {
      setLoading(false)
    }
  }

  const getLowStockProducts = () => {
    return products.filter((p) => p.stock <= p.minStock)
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">产品管理</h1>
        <p className="text-muted-foreground mt-2">管理商品信息和库存</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>产品总数</CardTitle>
            <CardDescription>活跃产品</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>产品分类</CardTitle>
            <CardDescription>共 {categories.length} 个分类</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryDialogOpen(true)}
            >
              新增分类
            </Button>
          </CardContent>
        </Card>

        <Card className={getLowStockProducts().length > 0 ? "border-orange-500" : ""}>
          <CardHeader>
            <CardTitle>库存预警</CardTitle>
            <CardDescription>低于最小库存</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {getLowStockProducts().length}
            </div>
            {getLowStockProducts().length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {getLowStockProducts().map(p => p.name).join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>产品列表</CardTitle>
              <CardDescription>共 {total} 个产品</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>新增产品</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 flex-1">
              <Input
                placeholder="搜索产品名称或SKU"
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
                <TableHead>SKU</TableHead>
                <TableHead>产品名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>售价</TableHead>
                <TableHead>成本</TableHead>
                <TableHead>库存</TableHead>
                <TableHead>单位</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">
                    {product.sku || "-"}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(product.cost)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        product.stock <= product.minStock
                          ? "text-orange-600 font-semibold"
                          : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(product)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {products.length > 0 && (
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

      {/* 产品对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "编辑产品" : "新增产品"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "修改产品信息" : "添加新的产品"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">产品SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="选填"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">产品名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>分类 *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">售价 *</Label>
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
                  <Label htmlFor="cost">成本</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">初始库存</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    disabled={!!editingProduct}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">单位</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minStock">最小库存</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: e.target.value })
                    }
                  />
                </div>
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

      {/* 分类对话框 */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增产品分类</DialogTitle>
            <DialogDescription>创建新的产品分类</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryName">分类名称 *</Label>
                <Input
                  id="categoryName"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryDescription">描述</Label>
                <Input
                  id="categoryDescription"
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
