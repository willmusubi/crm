"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

interface MemberLevel {
  id: string
  name: string
}

interface MemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: any
  onSuccess: () => void
}

export function MemberDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: MemberDialogProps) {
  const [loading, setLoading] = useState(false)
  const [levels, setLevels] = useState<MemberLevel[]>([])
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "unknown",
    birthday: "",
    levelId: "",
    remark: "",
  })

  useEffect(() => {
    fetchLevels()
  }, [])

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        phone: member.phone || "",
        gender: member.gender || "unknown",
        birthday: member.birthday
          ? new Date(member.birthday).toISOString().split("T")[0]
          : "",
        levelId: member.levelId || "",
        remark: member.remark || "",
      })
    } else {
      setFormData({
        name: "",
        phone: "",
        gender: "unknown",
        birthday: "",
        levelId: "",
        remark: "",
      })
    }
  }, [member, open])

  const fetchLevels = async () => {
    try {
      const res = await fetch("/api/member-levels")
      const data = await res.json()
      if (data.success) {
        setLevels(data.data)
        if (!formData.levelId && data.data.length > 0) {
          setFormData((prev) => ({ ...prev, levelId: data.data[0].id }))
        }
      }
    } catch (error) {
      console.error("获取会员等级失败:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = member ? `/api/members/${member.id}` : "/api/members"
      const method = member ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        onSuccess()
        onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{member ? "编辑会员" : "新增会员"}</DialogTitle>
          <DialogDescription>
            {member ? "修改会员基本信息" : "填写会员基本信息"}
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
              <Label htmlFor="phone">手机号 *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">性别</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="unknown">未知</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthday">生日</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="levelId">会员等级 *</Label>
              <Select
                value={formData.levelId}
                onValueChange={(value) =>
                  setFormData({ ...formData, levelId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择会员等级" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
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
              onClick={() => onOpenChange(false)}
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
  )
}
