"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { MemberDialog } from "@/components/members/member-dialog"

interface Member {
  id: string
  memberNo: string
  name: string
  phone: string
  gender: string
  balance: number
  giftBalance: number
  points: number
  status: string
  createdAt: string
  level: {
    name: string
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | undefined>()

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/members?page=${page}&search=${search}`)
      const data = await res.json()
      if (data.success) {
        setMembers(data.data.members)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      console.error("获取会员列表失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [page, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedMember(undefined)
    setDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    fetchMembers()
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case "male":
        return "男"
      case "female":
        return "女"
      default:
        return "未知"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">正常</span>
      case "frozen":
        return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">冻结</span>
      case "deleted":
        return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">已删除</span>
      default:
        return status
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">会员管理</h1>
        <p className="text-muted-foreground mt-2">管理系统中的所有会员信息</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>会员列表</CardTitle>
              <CardDescription>共 {total} 个会员</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="搜索会员姓名、手机号、会员号"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-80"
              />
              <Button onClick={handleAdd}>新增会员</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无会员数据
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>会员号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>性别</TableHead>
                  <TableHead>等级</TableHead>
                  <TableHead>余额</TableHead>
                  <TableHead>赠送余额</TableHead>
                  <TableHead>积分</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.memberNo}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{getGenderText(member.gender)}</TableCell>
                    <TableCell>{member.level.name}</TableCell>
                    <TableCell>{formatCurrency(member.balance)}</TableCell>
                    <TableCell>{formatCurrency(member.giftBalance)}</TableCell>
                    <TableCell>{member.points}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>{formatDate(member.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">查看</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>编辑</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && members.length > 0 && (
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

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={selectedMember}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
