import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            CRM 客户关系管理系统
          </CardTitle>
          <CardDescription className="text-center">
            面向中小型服务业的客户关系管理解决方案
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Link href="/login">
              <Button className="w-full" size="lg">
                登录系统
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              测试账号：
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              管理员: admin / admin123
            </p>
            <p className="text-xs text-muted-foreground text-center">
              店员: staff / admin123
            </p>
          </div>

          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">
              系统功能：会员管理 · 储值消费 · 库存管理 · 预约系统
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
