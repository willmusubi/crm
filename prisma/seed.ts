import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据...')

  // 创建会员等级
  console.log('创建会员等级...')
  const levels = await Promise.all([
    prisma.memberLevel.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: '普通会员',
        levelOrder: 1,
        upgradeAmount: 0,
        discount: 1.0,
        pointsRate: 1.0,
        description: '默认等级',
      },
    }),
    prisma.memberLevel.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        name: '银卡会员',
        levelOrder: 2,
        upgradeAmount: 1000,
        discount: 0.95,
        pointsRate: 1.2,
        description: '累计消费满1000元',
      },
    }),
    prisma.memberLevel.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        name: '金卡会员',
        levelOrder: 3,
        upgradeAmount: 5000,
        discount: 0.9,
        pointsRate: 1.5,
        description: '累计消费满5000元',
      },
    }),
    prisma.memberLevel.upsert({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000004',
        name: '钻石会员',
        levelOrder: 4,
        upgradeAmount: 10000,
        discount: 0.85,
        pointsRate: 2.0,
        description: '累计消费满10000元',
      },
    }),
  ])
  console.log(`✓ 创建了 ${levels.length} 个会员等级`)

  // 创建员工
  console.log('创建员工...')
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { id: '00000000-0000-0000-0000-000000000011' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000011',
        name: '李技师',
        phone: '13800138001',
        role: 'technician',
        status: 'active',
      },
    }),
    prisma.staff.upsert({
      where: { id: '00000000-0000-0000-0000-000000000012' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000012',
        name: '王收银',
        phone: '13800138002',
        role: 'cashier',
        status: 'active',
      },
    }),
  ])
  console.log(`✓ 创建了 ${staff.length} 个员工`)

  // 创建系统用户
  console.log('创建系统用户...')
  const passwordHash = await bcrypt.hash('admin123', 10)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        passwordHash,
        name: '系统管理员',
        role: 'admin',
        status: 'active',
      },
    }),
    prisma.user.upsert({
      where: { username: 'staff' },
      update: {},
      create: {
        username: 'staff',
        passwordHash,
        name: '店员',
        role: 'staff',
        staffId: staff[1].id,
        status: 'active',
      },
    }),
  ])
  console.log(`✓ 创建了 ${users.length} 个系统用户`)
  console.log('  - 用户名: admin, 密码: admin123')
  console.log('  - 用户名: staff, 密码: admin123')

  // 创建产品分类
  console.log('创建产品分类...')
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { id: '00000000-0000-0000-0000-000000000021' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000021',
        name: '护肤产品',
        sortOrder: 1,
      },
    }),
    prisma.productCategory.upsert({
      where: { id: '00000000-0000-0000-0000-000000000022' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000022',
        name: '美发产品',
        sortOrder: 2,
      },
    }),
  ])
  console.log(`✓ 创建了 ${categories.length} 个产品分类`)

  // 创建产品
  console.log('创建产品...')
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: '00000000-0000-0000-0000-000000000031' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000031',
        name: '玻尿酸面膜',
        categoryId: categories[0].id,
        sku: 'PROD-001',
        price: 98,
        cost: 45,
        stock: 100,
        minStock: 20,
        unit: '盒',
        status: 'on_sale',
      },
    }),
    prisma.product.upsert({
      where: { id: '00000000-0000-0000-0000-000000000032' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000032',
        name: '维C精华液',
        categoryId: categories[0].id,
        sku: 'PROD-002',
        price: 268,
        cost: 120,
        stock: 50,
        minStock: 10,
        unit: '瓶',
        status: 'on_sale',
      },
    }),
    prisma.product.upsert({
      where: { id: '00000000-0000-0000-0000-000000000033' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000033',
        name: '修复洗发水',
        categoryId: categories[1].id,
        sku: 'PROD-003',
        price: 88,
        cost: 35,
        stock: 80,
        minStock: 15,
        unit: '瓶',
        status: 'on_sale',
      },
    }),
  ])
  console.log(`✓ 创建了 ${products.length} 个产品`)

  // 创建服务项目
  console.log('创建服务项目...')
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: '00000000-0000-0000-0000-000000000041' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000041',
        name: '基础护理',
        price: 158,
        duration: 60,
        description: '深层清洁 + 基础护理',
        status: 'active',
      },
    }),
    prisma.service.upsert({
      where: { id: '00000000-0000-0000-0000-000000000042' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000042',
        name: '水光针护理',
        price: 580,
        duration: 90,
        description: '补水保湿 + 水光焕肤',
        status: 'active',
      },
    }),
    prisma.service.upsert({
      where: { id: '00000000-0000-0000-0000-000000000043' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000043',
        name: '洗剪吹套餐',
        price: 88,
        duration: 45,
        description: '专业洗剪吹服务',
        status: 'active',
      },
    }),
  ])
  console.log(`✓ 创建了 ${services.length} 个服务项目`)

  // 创建充值套餐
  console.log('创建充值套餐...')
  const packages = await Promise.all([
    prisma.rechargePackage.upsert({
      where: { id: '00000000-0000-0000-0000-000000000051' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000051',
        name: '充500送50',
        amount: 500,
        giftAmount: 50,
        isActive: true,
        description: '充值500元，赠送50元',
      },
    }),
    prisma.rechargePackage.upsert({
      where: { id: '00000000-0000-0000-0000-000000000052' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000052',
        name: '充1000送150',
        amount: 1000,
        giftAmount: 150,
        isActive: true,
        description: '充值1000元，赠送150元',
      },
    }),
    prisma.rechargePackage.upsert({
      where: { id: '00000000-0000-0000-0000-000000000053' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000053',
        name: '充3000送500',
        amount: 3000,
        giftAmount: 500,
        isActive: true,
        description: '充值3000元，赠送500元',
      },
    }),
  ])
  console.log(`✓ 创建了 ${packages.length} 个充值套餐`)

  // 创建测试会员
  console.log('创建测试会员...')
  const members = await Promise.all([
    prisma.member.upsert({
      where: { phone: '13912345678' },
      update: {},
      create: {
        memberNo: 'M000001',
        name: '张三',
        phone: '13912345678',
        gender: 'male',
        birthday: new Date('1990-05-15'),
        levelId: levels[0].id,
        balance: 500,
        giftBalance: 50,
        points: 0,
        status: 'active',
      },
    }),
    prisma.member.upsert({
      where: { phone: '13912345679' },
      update: {},
      create: {
        memberNo: 'M000002',
        name: '李四',
        phone: '13912345679',
        gender: 'female',
        birthday: new Date('1985-08-20'),
        levelId: levels[1].id,
        balance: 1200,
        giftBalance: 150,
        points: 1500,
        totalRecharge: 1500,
        totalConsume: 800,
        status: 'active',
      },
    }),
    prisma.member.upsert({
      where: { phone: '13912345680' },
      update: {},
      create: {
        memberNo: 'M000003',
        name: '王五',
        phone: '13912345680',
        gender: 'male',
        birthday: new Date('1992-03-10'),
        levelId: levels[2].id,
        balance: 3200,
        giftBalance: 500,
        points: 5800,
        totalRecharge: 6000,
        totalConsume: 3500,
        status: 'active',
      },
    }),
  ])
  console.log(`✓ 创建了 ${members.length} 个测试会员`)

  console.log('\n✅ 数据初始化完成！')
  console.log('\n可用的登录账号：')
  console.log('  管理员: admin / admin123')
  console.log('  店员: staff / admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('初始化失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
