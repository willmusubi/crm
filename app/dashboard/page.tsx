import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">控制台</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              会员总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              测试会员数据
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              今日充值
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥0</div>
            <p className="text-xs text-muted-foreground">
              暂无充值记录
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              今日消费
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥0</div>
            <p className="text-xs text-muted-foreground">
              暂无消费记录
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              库存预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              库存充足
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>欢迎使用 CRM 系统</CardTitle>
            <CardDescription>
              您已成功登录系统，可以开始使用各项功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">功能列表：</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>会员管理 - 新增、编辑、查询会员信息</li>
                <li>会员等级 - 配置会员等级和权益</li>
                <li>储值充值 - 会员充值和套餐管理</li>
                <li>消费记录 - 记录会员消费明细</li>
                <li>产品管理 - 管理产品和库存</li>
                <li>预约系统 - 服务预约和排班</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
