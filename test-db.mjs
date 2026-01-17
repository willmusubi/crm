import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== 数据库连接测试 ===\n")

  // 测试会员等级
  const levels = await prisma.memberLevel.findMany()
  console.log(`会员等级数量: ${levels.length}`)
  if (levels.length > 0) {
    console.log("会员等级列表:")
    levels.forEach(l => console.log(`  - ${l.name} (折扣: ${l.discount}, 积分倍率: ${l.pointsRate})`))
  }
  console.log()

  // 测试会员
  const members = await prisma.member.findMany({ take: 5 })
  console.log(`会员数量: ${await prisma.member.count()}`)
  if (members.length > 0) {
    console.log("前5个会员:")
    members.forEach(m => console.log(`  - ${m.name} (${m.memberNo}) 余额: ${m.balance}`))
  }
  console.log()

  // 测试产品分类
  const categories = await prisma.productCategory.findMany()
  console.log(`产品分类数量: ${categories.length}`)
  console.log()

  // 测试产品
  const products = await prisma.product.findMany({ take: 5 })
  console.log(`产品数量: ${await prisma.product.count()}`)
  if (products.length > 0) {
    console.log("前5个产品:")
    products.forEach(p => console.log(`  - ${p.name} (${p.sku}) 库存: ${p.stock}, 价格: ${p.price}`))
  }
  console.log()

  // 测试服务
  const services = await prisma.service.findMany({ take: 5 })
  console.log(`服务数量: ${await prisma.service.count()}`)
  if (services.length > 0) {
    console.log("前5个服务:")
    services.forEach(s => console.log(`  - ${s.name} 价格: ${s.price}, 时长: ${s.duration}分钟`))
  }
  console.log()

  // 测试员工
  const staff = await prisma.staff.findMany()
  console.log(`员工数量: ${staff.length}`)
  if (staff.length > 0) {
    console.log("员工列表:")
    staff.forEach(s => console.log(`  - ${s.name} (${s.role}) 状态: ${s.status}`))
  }
  console.log()

  // 测试预约
  const appointments = await prisma.appointment.count()
  console.log(`预约数量: ${appointments}`)

  // 测试充值记录
  const recharges = await prisma.rechargeRecord.count()
  console.log(`充值记录数量: ${recharges}`)

  // 测试消费记录
  const consumes = await prisma.consumeRecord.count()
  console.log(`消费记录数量: ${consumes}`)
}

main()
  .catch((e) => {
    console.error("错误:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
