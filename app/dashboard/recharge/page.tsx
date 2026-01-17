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
}

interface RechargePackage {
  id: string
  name: string
  amount: number
  giftAmount: number
}

interface RechargeRecord {
  id: string
  amount: number
  giftAmount: number
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
}

export default function RechargePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [packages, setPackages] = useState<RechargePackage[]>([])
  const [records, setRecords] = useState<RechargeRecord[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchPhone, setSearchPhone] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    giftAmount: "0",
    paymentMethod: "cash",
    packageId: "",
    remark: "",
  })

  useEffect(() => {
    fetchPackages()
    fetchRecords()
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [page])

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/recharge-packages")
      const data = await res.json()
      if (data.success) {
        setPackages(data.data)
      }
    } catch (error) {
      console.error("获取充值套餐失败:", error)
    }
  }

  const fetchRecords = async () => {
    try {
      const res = await fetch(`/api/recharge?page=${page}`)
      const data = await res.json()
      if (data.success) {
        setRecords(data.data.records)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      console.error("获取充值记录失败:", error)
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
        setFormData({ ...formData, memberId: data.data.members[0].id })
      } else {
        alert("未找到该会员")
        setSelectedMember(null)
      }
    } catch (error) {
      console.error("搜索会员失败:", error)
      alert("搜索失败")
    }
  }

  const handlePackageSelect = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId)
    if (pkg) {
      setFormData({
        ...formData,
        packageId,
        amount: pkg.amount.toString(),
        giftAmount: pkg.giftAmount.toString(),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        alert("充值成功")
        setDialogOpen(false)
        setSelectedMember(null)
        setSearchPhone("")
        setFormData({
          memberId: "",
          amount: "",
          giftAmount: "0",
          paymentMethod: "cash",
          packageId: "",
          remark: "",
        })
        fetchRecords()
      } else {
        alert(data.error || "充值失败")
      }
    } catch (error) {
      console.error("充值失败:", error)
      alert("充值失败")
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodText = (method: string) => {
    const map: Record<string, string> = {
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
        <h1 className="text-3xl font-bold">充值管理</h1>
        <p className="text-muted-foreground mt-2">会员充值和充值记录管理</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>快速充值</CardTitle>
            <CardDescription>为会员账户充值</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setDialogOpen(true)}>
              开始充值
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>充值套餐</CardTitle>
            <CardDescription>共 {packages.length} 个套餐</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packages.slice(0, 2).map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{pkg.name}</span>
                  <span className="text-muted-foreground">
                    +{formatCurrency(pkg.giftAmount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今日充值</CardTitle>
            <CardDescription>统计数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥0</div>
            <p className="text-xs text-muted-foreground mt-1">0 笔</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>充值记录</CardTitle>
          <CardDescription>共 {total} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>会员</TableHead>
                <TableHead>充值金额</TableHead>
                <TableHead>赠送金额</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>操作员</TableHead>
                <TableHead>充值时间</TableHead>
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
                    {formatCurrency(record.amount)}
                  </TableCell>
                  <TableCell className="text-green-600">
                    +{formatCurrency(record.giftAmount)}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodText(record.paymentMethod)}
                  </TableCell>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>会员充值</DialogTitle>
            <DialogDescription>为会员账户充值</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
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
                        <span className="text-muted-foreground">当前余额</span>
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

              <div className="grid gap-2">
                <Label>充值套餐（可选）</Label>
                <Select
                  value={formData.packageId}
                  onValueChange={handlePackageSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择充值套餐或自定义金额" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - 充{formatCurrency(pkg.amount)}送
                        {formatCurrency(pkg.giftAmount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">充值金额 *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="giftAmount">赠送金额</Label>
                  <Input
                    id="giftAmount"
                    type="number"
                    step="0.01"
                    value={formData.giftAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, giftAmount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>支付方式 *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">现金</SelectItem>
                    <SelectItem value="wechat">微信</SelectItem>
                    <SelectItem value="alipay">支付宝</SelectItem>
                    <SelectItem value="bank_card">银行卡</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="remark">备注</Label>
                <Input
                  id="remark"
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
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
              <Button type="submit" disabled={loading || !selectedMember}>
                {loading ? "充值中..." : "确认充值"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
