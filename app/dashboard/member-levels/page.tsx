"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

interface MemberLevel {
  id: string
  name: string
  levelOrder: number
  upgradeAmount: number
  discount: number
  pointsRate: number
  description: string | null
  createdAt: string
}

export default function MemberLevelsPage() {
  const [levels, setLevels] = useState<MemberLevel[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLevels = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/member-levels")
      const data = await res.json()
      if (data.success) {
        setLevels(data.data)
      }
    } catch (error) {
      console.error("获取会员等级失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
  }, [])

  const getDiscountText = (discount: number) => {
    return `${(discount * 10).toFixed(1)}折`
  }

  const getPointsRateText = (rate: number) => {
    return `${rate}倍`
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">会员等级</h1>
        <p className="text-muted-foreground mt-2">配置会员等级和权益</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>等级列表</CardTitle>
              <CardDescription>共 {levels.length} 个等级</CardDescription>
            </div>
            <Button>新增等级</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : levels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无等级数据
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>等级名称</TableHead>
                  <TableHead>等级顺序</TableHead>
                  <TableHead>升级条件</TableHead>
                  <TableHead>折扣</TableHead>
                  <TableHead>积分倍率</TableHead>
                  <TableHead>说明</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {level.levelOrder}
                      </span>
                    </TableCell>
                    <TableCell>
                      {level.upgradeAmount === 0
                        ? "无需条件"
                        : `累计消费 ${formatCurrency(level.upgradeAmount)}`}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        {getDiscountText(level.discount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                        {getPointsRateText(level.pointsRate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {level.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">编辑</Button>
                      <Button variant="ghost" size="sm">删除</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>等级说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• 等级顺序：数字越大，等级越高</p>
              <p>• 升级条件：会员累计消费达到指定金额后自动升级</p>
              <p>• 折扣：会员消费时享受的折扣，如 0.9 表示 9 折</p>
              <p>• 积分倍率：会员消费获得积分的倍数，如 1.5 表示获得 1.5 倍积分</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
