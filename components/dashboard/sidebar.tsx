"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"

const menuItems = [
  {
    title: "控制台",
    href: "/dashboard",
    icon: "📊",
  },
  {
    title: "会员管理",
    href: "/dashboard/members",
    icon: "👥",
  },
  {
    title: "会员等级",
    href: "/dashboard/member-levels",
    icon: "⭐",
  },
  {
    title: "充值管理",
    href: "/dashboard/recharge",
    icon: "💰",
  },
  {
    title: "消费记录",
    href: "/dashboard/consume",
    icon: "🛒",
  },
  {
    title: "产品管理",
    href: "/dashboard/products",
    icon: "📦",
  },
  {
    title: "库存管理",
    href: "/dashboard/stock",
    icon: "📊",
  },
  {
    title: "服务项目",
    href: "/dashboard/services",
    icon: "✨",
  },
  {
    title: "员工管理",
    href: "/dashboard/staff",
    icon: "👥",
  },
  {
    title: "预约管理",
    href: "/dashboard/appointments",
    icon: "📅",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">CRM 系统</h1>
      </div>

      {/* User Info */}
      <div className="border-b border-gray-800 p-4">
        <div className="text-sm">
          <p className="font-medium">{session?.user?.name}</p>
          <p className="text-gray-400 text-xs mt-1">
            {(session?.user as any)?.role === "admin" ? "管理员" : "店员"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          退出登录
        </Button>
      </div>
    </div>
  )
}
