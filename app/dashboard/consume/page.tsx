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
import { formatCurrency, formatDateTime } from "@/lib/utils"

interface Member {
  id: string
  memberNo: string
  name: string
  phone: string
  balance: number
  giftBalance: number
  level: {
    name: string
    discount: number
    pointsRate: number
  }
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: {
    name: string
  }
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface CartItem {
  type: "product" | "service"
  itemId: string
  name: string
  price: number
  quantity: number
  stock?: number
}

interface ConsumeRecord {
  id: string
  totalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
  member: {
    name: string
    memberNo: string
  }
  operator: {
    name: string
  }
  items: {
    itemName: string
    quantity: number
    price: number
    subtotal: number
  }[]
}

export default function ConsumePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchPhone, setSearchPhone] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [records, setRecords] = useState<ConsumeRecord[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("balance")
  const [remark, setRemark] = useState("")

  useEffect(() => {
    fetchRecords()
  }, [page])

  const fetchRecords = async () => {
    try {
      const res = await fetch(`/api/consume?page=${page}`)
      const data = await res.json()
      if (data.success) {
        setRecords(data.data.records)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      console.error("获取消费记录失败:", error)
    }
  }

  const searchMember = async () => {
    if (!searchPhone) {
      alert("请输入手机号")
      return
    }

    try {
      const res = await fetch(`/api/members?search=${searchPhone}`)
      const data = await res.json()
      if (data.success && data.data.members.length > 0) {
        setSelectedMember(data.data.members[0])
      } else {
        alert("未找到该会员")
        setSelectedMember(null)
      }
    } catch (error) {
      console.error("搜索会员失败:", error)
      alert("搜索失败")
    }
  }

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error("获取商品列表失败:", error)
    }
  }

  const loadServices = async () => {
    try {
      const res = await fetch("/api/services")
      const data = await res.json()
      if (data.success) {
        setServices(data.data)
      }
    } catch (error) {
      console.error("获取服务列表失败:", error)
    }
  }

  const handleOpenItemDialog = () => {
    loadProducts()
    loadServices()
    setItemDialogOpen(true)
  }

  const addToCart = (type: "product" | "service", item: Product | Service) => {
    const existingItem = cart.find((c) => c.type === type && c.itemId === item.id)

    if (existingItem) {
      // 增加数量
      setCart(
        cart.map((c) =>
          c.type === type && c.itemId === item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      )
    } else {
      // 添加新项目
      setCart([
        ...cart,
        {
          type,
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          stock: type === "product" ? (item as Product).stock : undefined,
        },
      ])
    }
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }

    const item = cart[index]
    if (item.stock !== undefined && quantity > item.stock) {
      alert(`库存不足，当前库存：${item.stock}`)
      return
    }

    setCart(
      cart.map((c, i) => (i === index ? { ...c, quantity } : c))
    )
  }

  const calculateTotal = () => {
    if (!selectedMember) return 0

    const discount = selectedMember.level.discount
    const total = cart.reduce((sum, item) => {
      return sum + item.price * item.quantity * discount
    }, 0)

    return total
  }

  const handleSubmit = async () => {
    if (!selectedMember) {
      alert("请选择会员")
      return
    }

    if (cart.length === 0) {
      alert("请添加消费项目")
      return
    }

    setLoading(true)

    try {
      const items = cart.map((item) => ({
        type: item.type,
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))

      const res = await fetch("/api/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember.id,
          items,
          paymentMethod,
          remark,
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert("消费成功")
        setDialogOpen(false)
        setSelectedMember(null)
        setSearchPhone("")
        setCart([])
        setPaymentMethod("balance")
        setRemark("")
        fetchRecords()
      } else {
        alert(data.error || "消费失败")
      }
    } catch (error) {
      console.error("消费失败:", error)
      alert("消费失败")
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodText = (method: string) => {
    const map: Record<string, string> = {
      balance: "储值余额",
      cash: "现金",
      wechat: "微信",
      alipay: "支付宝",
      bank_card: "银行卡",
    }
    return map[method] || method
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">消费管理</h1>
        <p className="text-muted-foreground mt-2">会员消费和消费记录管理</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>快速消费</CardTitle>
            <CardDescription>为会员结账</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setDialogOpen(true)}>
              开始消费
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今日消费</CardTitle>
            <CardDescription>统计数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥0</div>
            <p className="text-xs text-muted-foreground mt-1">0 笔</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>商品服务</CardTitle>
            <CardDescription>可用项目</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length + services.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {products.length} 商品 / {services.length} 服务
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>消费记录</CardTitle>
          <CardDescription>共 {total} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>会员</TableHead>
                <TableHead>消费金额</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>项目数</TableHead>
                <TableHead>操作员</TableHead>
                <TableHead>消费时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.member.memberNo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(record.totalAmount)}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodText(record.paymentMethod)}
                  </TableCell>
                  <TableCell>{record.items.length} 项</TableCell>
                  <TableCell>{record.operator.name}</TableCell>
                  <TableCell>{formatDateTime(record.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {records.length > 0 && (
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

      {/* 消费对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>会员消费</DialogTitle>
            <DialogDescription>为会员结账</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 搜索会员 */}
            <div className="grid gap-2">
              <Label>搜索会员</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="请输入会员手机号"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                />
                <Button type="button" onClick={searchMember}>
                  搜索
                </Button>
              </div>
            </div>

            {/* 会员信息 */}
            {selectedMember && (
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">会员</span>
                      <span className="font-medium">
                        {selectedMember.name} ({selectedMember.memberNo})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">等级</span>
                      <span className="font-medium">{selectedMember.level.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">折扣</span>
                      <span className="font-medium text-green-600">
                        {(selectedMember.level.discount * 10).toFixed(1)}折
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">余额</span>
                      <span className="font-medium">
                        {formatCurrency(selectedMember.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">赠送余额</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(selectedMember.giftBalance)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 消费项目 */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>消费项目</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenItemDialog}
                  disabled={!selectedMember}
                >
                  添加项目
                </Button>
              </div>

              {cart.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        <TableHead>单价</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>小计</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.type === "product" ? "商品" : "服务"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateCartQuantity(index, parseInt(e.target.value))
                              }
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(
                              item.price *
                                item.quantity *
                                (selectedMember?.level.discount || 1)
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(index)}
                            >
                              删除
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* 支付方式 */}
            <div className="grid gap-2">
              <Label>支付方式</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance">储值余额</SelectItem>
                  <SelectItem value="cash">现金</SelectItem>
                  <SelectItem value="wechat">微信</SelectItem>
                  <SelectItem value="alipay">支付宝</SelectItem>
                  <SelectItem value="bank_card">银行卡</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 备注 */}
            <div className="grid gap-2">
              <Label>备注</Label>
              <Input
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="选填"
              />
            </div>

            {/* 合计 */}
            {cart.length > 0 && selectedMember && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>应付金额</span>
                    <span className="text-2xl text-primary">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                  {selectedMember.level.discount < 1 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      已应用 {(selectedMember.level.discount * 10).toFixed(1)}折 会员折扣
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !selectedMember || cart.length === 0}
            >
              {loading ? "处理中..." : "确认结账"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加项目对话框 */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>选择商品/服务</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 商品列表 */}
            <div>
              <h3 className="font-medium mb-2">商品</h3>
              <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                {products.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    暂无商品
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品名称</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>库存</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {product.category.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                addToCart("product", product)
                                setItemDialogOpen(false)
                              }}
                              disabled={product.stock <= 0}
                            >
                              添加
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            {/* 服务列表 */}
            <div>
              <h3 className="font-medium mb-2">服务</h3>
              <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                {services.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    暂无服务
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>服务名称</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>时长</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">
                            {service.name}
                          </TableCell>
                          <TableCell>{formatCurrency(service.price)}</TableCell>
                          <TableCell>{service.duration}分钟</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                addToCart("service", service)
                                setItemDialogOpen(false)
                              }}
                            >
                              添加
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
