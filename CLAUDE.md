# CRM 客户关系管理系统

## 项目概述

这是一套面向中小型服务业（美容院、健身房、培训机构等）的 CRM 系统，包含会员管理、储值消费、库存管理、预约系统等核心功能。

**重要：开始开发前，请先阅读 `docs/PRD.md` 了解完整的产品需求。**

## 技术栈

- **前端框架**: Next.js 14+ (App Router)
- **UI 组件**: shadcn/ui + Tailwind CSS
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js
- **状态管理**: Zustand
- **表单处理**: React Hook Form + Zod
- **数据请求**: TanStack Query

## 项目结构

```
crm-system/
├── CLAUDE.md              # 本文件
├── docs/
│   └── PRD.md             # 产品需求文档（必读）
├── prisma/
│   └── schema.prisma      # 数据库模型
├── src/
│   ├── app/               # Next.js App Router 页面
│   │   ├── (auth)/        # 认证相关页面
│   │   ├── (dashboard)/   # 主控台页面
│   │   │   ├── members/   # 会员管理
│   │   │   ├── recharge/  # 储值管理
│   │   │   ├── consume/   # 消费管理
│   │   │   ├── products/  # 产品库存
│   │   │   ├── appointments/ # 预约管理
│   │   │   └── reports/   # 数据报表
│   │   └── api/           # API 路由
│   ├── components/        # React 组件
│   │   ├── ui/            # shadcn/ui 基础组件
│   │   └── features/      # 业务功能组件
│   ├── lib/               # 工具函数和配置
│   │   ├── db.ts          # Prisma 客户端
│   │   ├── auth.ts        # NextAuth 配置
│   │   └── utils.ts       # 通用工具
│   ├── hooks/             # 自定义 React Hooks
│   ├── stores/            # Zustand 状态
│   └── types/             # TypeScript 类型定义
├── public/                # 静态资源
└── package.json
```

## 开发规范

### 代码风格

- 使用 TypeScript，严格类型检查
- 组件使用函数式组件 + Hooks
- 文件命名：组件用 PascalCase，其他用 kebab-case
- 每个组件/函数需要有清晰的注释说明用途

### 数据库操作

- 所有数据库操作通过 Prisma 进行
- 使用事务处理涉及多表的操作（如充值、消费）
- 软删除使用 `status` 字段或 `deleted_at` 时间戳
- 金额字段使用 Decimal 类型，精度为 (10,2)

### API 设计

- RESTful 风格：GET/POST/PUT/DELETE
- 统一响应格式：`{ success: boolean, data?: any, error?: string }`
- 分页参数：`page`, `pageSize`，默认 pageSize=20
- 使用 Zod 进行请求参数验证

### 状态管理

- 服务端数据使用 TanStack Query 管理
- 客户端 UI 状态使用 Zustand
- 避免 prop drilling，合理使用 Context

## 核心功能模块

### 1. 会员管理 (P0)
- 会员 CRUD、搜索、列表
- 会员等级配置和自动升级
- 会员详情页（含消费/充值记录）

### 2. 储值系统 (P0)
- 充值操作（支持套餐和赠送）
- 余额查询（本金/赠送分开）
- 充值记录和撤销

### 3. 消费记录 (P0)
- 快速消费（选会员→选商品/服务→结算）
- 自动应用会员折扣
- 消费记录查询

### 4. 库存管理 (P1)
- 产品 CRUD 和分类
- 入库/出库登记
- 库存预警

### 5. 预约系统 (P1)
- 创建/修改/取消预约
- 日历视图展示
- 预约状态管理

## 数据库模型要点

详细字段定义见 `docs/PRD.md`，以下是核心表：

| 表名 | 说明 |
|------|------|
| members | 会员信息，含余额和积分 |
| member_levels | 会员等级配置 |
| recharge_records | 充值记录 |
| consume_records | 消费记录主表 |
| consume_items | 消费明细 |
| products | 产品信息 |
| product_categories | 产品分类 |
| stock_logs | 库存流水 |
| appointments | 预约记录 |
| services | 服务项目 |
| staff | 员工/技师 |
| users | 系统用户（管理员/店员） |

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 数据库迁移
pnpm prisma migrate dev

# 生成 Prisma Client
pnpm prisma generate

# 打开数据库管理界面
pnpm prisma studio

# 构建生产版本
pnpm build

# 代码检查
pnpm lint
```

## 开发优先级

按以下顺序开发：

### 第一阶段 (MVP)
1. 项目初始化和基础配置
2. 数据库 Schema 设计
3. 用户认证系统
4. 会员管理模块
5. 会员等级配置
6. 储值充值功能
7. 基础消费流程

### 第二阶段
1. 预约系统
2. 产品和库存管理
3. 消费提醒通知

### 第三阶段
1. 积分系统
2. 数据报表
3. 导入导出

## 注意事项

- 涉及金额计算时，务必使用 Decimal.js 避免浮点数精度问题
- 充值和消费操作必须使用数据库事务
- 所有删除操作默认为软删除
- 敏感操作（余额调整、撤销等）需要记录操作日志
- 预约时间需要考虑时区处理

## 环境变量

```env
DATABASE_URL="postgresql://user:password@localhost:5432/crm"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

如有疑问，请参考 `docs/PRD.md` 中的详细需求说明。
