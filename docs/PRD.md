# CRM 客户关系管理系统 - 产品需求文档 (PRD)

**文档版本**: V1.0  
**创建日期**: 2026年1月17日  
**文档状态**: 初稿

---

## 1. 产品概述

### 1.1 产品背景

本系统是一套面向中小型服务业（如美容院、健身房、培训机构等）的客户关系管理系统，旨在帮助商家高效管理会员、产品库存、预约服务，并通过数据驱动提升客户留存和复购率。

### 1.2 产品目标

- 实现会员储值、消费、等级的全流程管理
- 提供完整的产品库存管理能力
- 支持客户预约和服务提醒
- 生成可视化的业务数据报表

### 1.3 目标用户

- **商家管理员**: 负责系统配置、数据查看
- **店员/收银员**: 日常会员操作、收银
- **会员客户**: 查看余额、预约服务（可选小程序端）

---

## 2. 功能模块总览

| 模块名称 | 核心功能 | 优先级 |
|---------|---------|--------|
| 会员管理 | 会员CRUD、等级管理、标签分组 | P0 - 核心功能 |
| 储值系统 | 充值、消费、余额查询、充值活动 | P0 - 核心功能 |
| 消费记录 | 消费明细、提醒通知、积分计算 | P0 - 核心功能 |
| 库存管理 | 产品管理、入库出库、库存预警 | P1 - 重要功能 |
| 预约系统 | 在线预约、日程管理、预约提醒 | P1 - 重要功能 |
| 数据报表 | 销售报表、会员分析、库存报表 | P2 - 增强功能 |

---

## 3. 详细功能需求

### 3.1 会员管理模块

#### 3.1.1 会员信息管理

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 新增会员 | 录入会员基本信息：姓名、手机号、生日、性别、备注 | P0 |
| 2 | 编辑会员 | 修改会员信息，记录修改历史 | P0 |
| 3 | 删除会员 | 软删除会员，保留历史数据 | P1 |
| 4 | 会员搜索 | 按姓名、手机号、会员号快速搜索 | P0 |
| 5 | 会员列表 | 分页展示会员列表，支持筛选排序 | P0 |
| 6 | 会员详情 | 展示会员完整信息、消费记录、储值记录 | P0 |
| 7 | 会员导入 | 支持Excel批量导入会员数据 | P2 |
| 8 | 会员导出 | 导出会员数据为Excel文件 | P2 |

#### 3.1.2 会员等级管理

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 等级配置 | 创建和管理会员等级：普通、银卡、金卡、钻石等 | P0 |
| 2 | 升级规则 | 设置等级升级条件：累计消费金额/累计充值金额 | P0 |
| 3 | 等级权益 | 配置各等级折扣比例、积分倍数等权益 | P0 |
| 4 | 自动升级 | 达到条件自动升级并发送通知 | P1 |
| 5 | 手动调整 | 管理员可手动调整会员等级 | P1 |

#### 3.1.3 会员标签

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 标签管理 | 创建、编辑、删除会员标签 | P2 |
| 2 | 标签分配 | 为会员添加/移除标签 | P2 |
| 3 | 标签筛选 | 根据标签筛选会员进行营销 | P2 |

---

### 3.2 储值系统模块

#### 3.2.1 充值功能

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 会员充值 | 为会员账户充值，支持现金、微信、支付宝等 | P0 |
| 2 | 充值套餐 | 预设充值套餐（如充1000送100） | P0 |
| 3 | 充值赠送 | 自动计算并添加赠送金额 | P0 |
| 4 | 充值小票 | 生成并打印充值凭证 | P1 |
| 5 | 充值撤销 | 支持当日充值撤销（需权限） | P1 |

#### 3.2.2 余额管理

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 余额查询 | 查看会员当前余额（本金+赠送分开显示） | P0 |
| 2 | 余额调整 | 管理员手动调整余额（需审批+备注） | P1 |
| 3 | 余额冻结 | 冻结/解冻会员余额 | P2 |
| 4 | 余额预警 | 设置低余额提醒阈值 | P2 |

#### 3.2.3 充值活动

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 活动创建 | 创建限时充值活动，设置活动时间和规则 | P1 |
| 2 | 活动管理 | 启用/停用/编辑充值活动 | P1 |
| 3 | 活动统计 | 统计活动参与人数和充值总额 | P2 |

---

### 3.3 消费记录模块

#### 3.3.1 消费管理

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 快速消费 | 选择会员、商品/服务，完成扣款 | P0 |
| 2 | 消费明细 | 查看消费时间、项目、金额、操作员 | P0 |
| 3 | 消费撤销 | 撤销消费记录，退回余额（需权限） | P1 |
| 4 | 消费小票 | 生成并打印消费凭证 | P1 |
| 5 | 折扣应用 | 根据会员等级自动应用折扣 | P0 |
| 6 | 混合支付 | 支持余额+现金混合支付 | P1 |

#### 3.3.2 消费提醒

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 消费通知 | 消费后发送短信/微信通知会员 | P1 |
| 2 | 余额提醒 | 余额不足时提醒充值 | P2 |
| 3 | 消费报告 | 定期发送消费汇总（周/月报） | P2 |

#### 3.3.3 积分系统

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 积分获取 | 消费自动获得积分（可配置比例） | P1 |
| 2 | 积分查询 | 查看积分余额和积分明细 | P1 |
| 3 | 积分抵扣 | 消费时可使用积分抵扣 | P2 |
| 4 | 积分过期 | 设置积分有效期，过期自动清零 | P2 |

---

### 3.4 库存管理模块

#### 3.4.1 产品管理

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 产品录入 | 录入产品信息：名称、分类、规格、价格、成本 | P0 |
| 2 | 产品分类 | 管理产品分类（多级分类） | P0 |
| 3 | 产品编辑 | 修改产品信息 | P0 |
| 4 | 产品上下架 | 控制产品是否可售 | P1 |
| 5 | 产品图片 | 上传产品图片 | P2 |
| 6 | 条码管理 | 支持条码录入和扫码 | P2 |

#### 3.4.2 库存操作

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 入库登记 | 记录采购入库：数量、单价、供应商 | P0 |
| 2 | 出库登记 | 记录销售出库、损耗出库 | P0 |
| 3 | 库存盘点 | 定期盘点，记录盘盈盘亏 | P1 |
| 4 | 库存调整 | 管理员手动调整库存（需备注） | P1 |
| 5 | 库存流水 | 查看完整的库存变动记录 | P0 |

#### 3.4.3 库存预警

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 预警设置 | 为产品设置最低库存阈值 | P1 |
| 2 | 预警通知 | 库存不足时发送通知 | P1 |
| 3 | 预警报表 | 展示所有库存不足的产品 | P1 |

---

### 3.5 预约系统模块

#### 3.5.1 预约管理

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 创建预约 | 为会员创建服务预约：时间、项目、技师 | P0 |
| 2 | 预约日历 | 日历视图展示所有预约 | P0 |
| 3 | 预约列表 | 列表形式查看和管理预约 | P0 |
| 4 | 修改预约 | 变更预约时间或内容 | P1 |
| 5 | 取消预约 | 取消预约并记录原因 | P1 |
| 6 | 预约状态 | 待确认/已确认/已完成/已取消/爽约 | P0 |

#### 3.5.2 服务项目

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 项目管理 | 创建和管理服务项目 | P0 |
| 2 | 时长设置 | 设置服务预计时长 | P0 |
| 3 | 价格设置 | 设置服务价格 | P0 |
| 4 | 技师关联 | 设置可提供该服务的技师 | P1 |

#### 3.5.3 预约提醒

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 预约确认 | 预约成功后发送确认通知 | P1 |
| 2 | 提前提醒 | 预约前N小时发送提醒 | P1 |
| 3 | 员工提醒 | 通知相关技师/员工 | P2 |

#### 3.5.4 排班管理

| 序号 | 功能点 | 功能描述 | 优先级 |
|-----|-------|---------|--------|
| 1 | 员工排班 | 设置员工工作时间表 | P1 |
| 2 | 时段设置 | 设置可预约的时间段 | P1 |
| 3 | 容量限制 | 设置每时段最大预约数 | P1 |

---

## 4. 数据模型设计

### 4.1 会员表 (members)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| member_no | VARCHAR(20) | 是 | 会员编号，唯一 |
| name | VARCHAR(50) | 是 | 会员姓名 |
| phone | VARCHAR(20) | 是 | 手机号，唯一 |
| gender | ENUM | 否 | 性别：male/female/unknown |
| birthday | DATE | 否 | 生日 |
| level_id | UUID | 是 | 关联会员等级 |
| balance | DECIMAL(10,2) | 是 | 账户余额（本金） |
| gift_balance | DECIMAL(10,2) | 是 | 赠送余额 |
| points | INT | 是 | 积分 |
| total_recharge | DECIMAL(10,2) | 是 | 累计充值 |
| total_consume | DECIMAL(10,2) | 是 | 累计消费 |
| remark | TEXT | 否 | 备注 |
| status | ENUM | 是 | 状态：active/frozen/deleted |
| created_at | TIMESTAMP | 是 | 创建时间 |
| updated_at | TIMESTAMP | 是 | 更新时间 |

### 4.2 会员等级表 (member_levels)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| name | VARCHAR(50) | 是 | 等级名称 |
| level_order | INT | 是 | 等级排序（越大越高） |
| upgrade_amount | DECIMAL(10,2) | 是 | 升级所需累计金额 |
| discount | DECIMAL(3,2) | 是 | 折扣比例（如0.9表示9折） |
| points_rate | DECIMAL(3,2) | 是 | 积分倍率 |
| description | TEXT | 否 | 等级描述 |
| created_at | TIMESTAMP | 是 | 创建时间 |

### 4.3 充值记录表 (recharge_records)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| member_id | UUID | 是 | 关联会员 |
| amount | DECIMAL(10,2) | 是 | 充值金额 |
| gift_amount | DECIMAL(10,2) | 是 | 赠送金额 |
| payment_method | ENUM | 是 | 支付方式：cash/wechat/alipay等 |
| package_id | UUID | 否 | 关联充值套餐 |
| operator_id | UUID | 是 | 操作员ID |
| status | ENUM | 是 | 状态：success/cancelled |
| remark | TEXT | 否 | 备注 |
| created_at | TIMESTAMP | 是 | 创建时间 |

### 4.4 消费记录表 (consume_records)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| member_id | UUID | 是 | 关联会员 |
| total_amount | DECIMAL(10,2) | 是 | 消费总额 |
| discount_amount | DECIMAL(10,2) | 是 | 折扣金额 |
| actual_amount | DECIMAL(10,2) | 是 | 实付金额 |
| balance_paid | DECIMAL(10,2) | 是 | 余额支付 |
| cash_paid | DECIMAL(10,2) | 是 | 现金支付 |
| points_earned | INT | 是 | 获得积分 |
| points_used | INT | 是 | 使用积分 |
| operator_id | UUID | 是 | 操作员ID |
| status | ENUM | 是 | 状态：success/cancelled |
| created_at | TIMESTAMP | 是 | 创建时间 |

### 4.5 消费明细表 (consume_items)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| consume_id | UUID | 是 | 关联消费记录 |
| item_type | ENUM | 是 | 类型：product/service |
| item_id | UUID | 是 | 产品或服务ID |
| item_name | VARCHAR(100) | 是 | 名称（冗余） |
| quantity | INT | 是 | 数量 |
| unit_price | DECIMAL(10,2) | 是 | 单价 |
| subtotal | DECIMAL(10,2) | 是 | 小计 |

### 4.6 产品表 (products)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| name | VARCHAR(100) | 是 | 产品名称 |
| category_id | UUID | 是 | 关联分类 |
| sku | VARCHAR(50) | 否 | 产品编码 |
| barcode | VARCHAR(50) | 否 | 条形码 |
| price | DECIMAL(10,2) | 是 | 销售价格 |
| cost | DECIMAL(10,2) | 否 | 成本价 |
| stock | INT | 是 | 当前库存 |
| min_stock | INT | 否 | 最低库存预警 |
| unit | VARCHAR(20) | 是 | 单位 |
| image_url | VARCHAR(255) | 否 | 产品图片 |
| status | ENUM | 是 | 状态：on_sale/off_sale |
| created_at | TIMESTAMP | 是 | 创建时间 |

### 4.7 库存流水表 (stock_logs)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| product_id | UUID | 是 | 关联产品 |
| type | ENUM | 是 | 类型：in/out/adjust/check |
| quantity | INT | 是 | 变动数量（正负） |
| before_stock | INT | 是 | 变动前库存 |
| after_stock | INT | 是 | 变动后库存 |
| reason | VARCHAR(100) | 否 | 变动原因 |
| related_id | UUID | 否 | 关联单据ID |
| operator_id | UUID | 是 | 操作员ID |
| created_at | TIMESTAMP | 是 | 创建时间 |

### 4.8 预约表 (appointments)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| member_id | UUID | 是 | 关联会员 |
| service_id | UUID | 是 | 关联服务项目 |
| staff_id | UUID | 否 | 关联服务人员 |
| appointment_date | DATE | 是 | 预约日期 |
| start_time | TIME | 是 | 开始时间 |
| end_time | TIME | 是 | 结束时间 |
| status | ENUM | 是 | pending/confirmed/completed/cancelled/no_show |
| remark | TEXT | 否 | 备注 |
| cancel_reason | VARCHAR(200) | 否 | 取消原因 |
| created_at | TIMESTAMP | 是 | 创建时间 |
| updated_at | TIMESTAMP | 是 | 更新时间 |

### 4.9 服务项目表 (services)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| name | VARCHAR(100) | 是 | 服务名称 |
| category_id | UUID | 否 | 服务分类 |
| price | DECIMAL(10,2) | 是 | 服务价格 |
| duration | INT | 是 | 服务时长（分钟） |
| description | TEXT | 否 | 服务描述 |
| status | ENUM | 是 | 状态：active/inactive |
| created_at | TIMESTAMP | 是 | 创建时间 |

### 4.10 员工表 (staff)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| name | VARCHAR(50) | 是 | 员工姓名 |
| phone | VARCHAR(20) | 否 | 联系电话 |
| role | ENUM | 是 | 角色：technician/cashier/manager |
| status | ENUM | 是 | 状态：active/inactive |
| created_at | TIMESTAMP | 是 | 创建时间 |

### 4.11 系统用户表 (users)

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| id | UUID | 是 | 主键 |
| username | VARCHAR(50) | 是 | 用户名 |
| password_hash | VARCHAR(255) | 是 | 密码哈希 |
| name | VARCHAR(50) | 是 | 显示名称 |
| role | ENUM | 是 | 角色：admin/staff |
| staff_id | UUID | 否 | 关联员工 |
| status | ENUM | 是 | 状态：active/inactive |
| last_login_at | TIMESTAMP | 否 | 最后登录时间 |
| created_at | TIMESTAMP | 是 | 创建时间 |

---

## 5. 接口设计

采用 RESTful API 设计规范。

### 5.1 会员接口

| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | /api/members | 获取会员列表（支持分页、搜索、筛选） |
| GET | /api/members/:id | 获取会员详情 |
| POST | /api/members | 创建会员 |
| PUT | /api/members/:id | 更新会员信息 |
| DELETE | /api/members/:id | 删除会员（软删除） |
| POST | /api/members/:id/recharge | 会员充值 |
| POST | /api/members/:id/consume | 会员消费 |
| GET | /api/members/:id/records | 获取会员消费/充值记录 |

### 5.2 会员等级接口

| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | /api/member-levels | 获取等级列表 |
| POST | /api/member-levels | 创建等级 |
| PUT | /api/member-levels/:id | 更新等级 |
| DELETE | /api/member-levels/:id | 删除等级 |

### 5.3 产品/库存接口

| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | /api/products | 获取产品列表 |
| GET | /api/products/:id | 获取产品详情 |
| POST | /api/products | 创建产品 |
| PUT | /api/products/:id | 更新产品 |
| DELETE | /api/products/:id | 删除产品 |
| POST | /api/products/:id/stock-in | 产品入库 |
| POST | /api/products/:id/stock-out | 产品出库 |
| GET | /api/products/:id/stock-logs | 获取库存流水 |
| GET | /api/products/low-stock | 获取低库存预警 |

### 5.4 产品分类接口

| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | /api/categories | 获取分类列表（树形） |
| POST | /api/categories | 创建分类 |
| PUT | /api/categories/:id | 更新分类 |
| DELETE | /api/categories/:id | 删除分类 |

### 5.5 预约接口

| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | /api/appointments | 获取预约列表（支持日期范围筛选） |
| GET | /api/appointments/:id | 获取预约详情 |
| POST | /api/appointments | 创建预约 |
| PUT | /api/appointments/:id | 更新预约 |
| PUT | /api/appointments/:id/status | 更新预约状态 |
| DELETE | /api/appointments/:id | 取消预约 |
| GET | /api/appointments/calendar | 获取日历视图数据 |
| GET | /api/appointments/available-slots | 获取可预约时段 |

### 5.6 服务项目接口

| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | /api/services | 获取服务列表 |
| POST | /api/services | 创建服务 |
| PUT | /api/services/:id | 更新服务 |
| DELETE | /api/services/:id | 删除服务 |

### 5.7 充值套餐接口

| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | /api/recharge-packages | 获取充值套餐列表 |
| POST | /api/recharge-packages | 创建套餐 |
| PUT | /api/recharge-packages/:id | 更新套餐 |
| DELETE | /api/recharge-packages/:id | 删除套餐 |

### 5.8 报表接口

| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | /api/reports/sales | 销售报表 |
| GET | /api/reports/members | 会员分析报表 |
| GET | /api/reports/inventory | 库存报表 |
| GET | /api/reports/appointments | 预约统计报表 |

---

## 6. 非功能性需求

### 6.1 性能要求

- 页面加载时间 < 2秒
- API响应时间 < 500ms（95%请求）
- 支持100+并发用户
- 数据库查询优化，大表需建立索引

### 6.2 安全要求

- 用户密码加密存储（bcrypt）
- API接口JWT认证
- 敏感操作需权限验证
- SQL注入防护
- XSS攻击防护
- 操作日志记录

### 6.3 可用性要求

- 系统可用性 > 99.9%
- 数据每日自动备份
- 支持数据恢复

### 6.4 兼容性要求

- 浏览器：Chrome、Edge、Safari最新两个版本
- 响应式设计，支持PC和平板
- 移动端可考虑开发小程序（二期）

---

## 7. 技术选型建议

### 7.1 前端技术栈

| 类别 | 推荐 | 说明 |
|-----|------|------|
| 框架 | Next.js 14+ | React全栈框架，支持SSR |
| UI组件库 | shadcn/ui | 高质量可定制组件 |
| 样式 | Tailwind CSS | 原子化CSS |
| 状态管理 | Zustand / Jotai | 轻量级状态管理 |
| 表单 | React Hook Form + Zod | 表单处理与验证 |
| 请求 | TanStack Query | 数据请求与缓存 |
| 日历组件 | FullCalendar | 预约日历展示 |

### 7.2 后端技术栈

| 类别 | 推荐 | 说明 |
|-----|------|------|
| 运行时 | Node.js | 与前端统一语言 |
| API | Next.js API Routes | 或独立 Express/Fastify |
| 数据库 | PostgreSQL | 关系型数据库 |
| ORM | Prisma | 类型安全的数据库操作 |
| 认证 | NextAuth.js / Auth.js | 身份认证方案 |
| 缓存 | Redis（可选） | 会话和数据缓存 |

### 7.3 部署方案

- 推荐：Vercel（前端）+ Railway/Supabase（数据库）
- 备选：Docker + 云服务器自部署
- 本地开发：Docker Compose 一键启动

---

## 8. 开发优先级规划

### 第一阶段 (MVP) - 2-3周

1. 项目初始化和基础配置
2. 数据库 Schema 设计和迁移
3. 用户认证系统
4. 会员管理模块（CRUD）
5. 会员等级配置
6. 储值充值功能
7. 基础消费流程

### 第二阶段 - 2-3周

1. 预约系统核心功能
2. 产品和库存管理
3. 库存入库出库
4. 消费提醒通知
5. 会员等级自动升级

### 第三阶段 - 2-3周

1. 积分系统
2. 库存预警
3. 数据报表
4. 导入导出功能
5. 充值活动

---

*— 文档结束 —*
