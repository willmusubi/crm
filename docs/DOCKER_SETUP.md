# Docker 安装和配置指南

## 问题描述
macOS 系统提示 Docker.app 包含恶意软件并被移到垃圾桶。这通常是因为：
1. Docker 的签名证书问题
2. macOS 的安全设置阻止了未签名的应用
3. Docker 文件可能被损坏

## 解决方案

### 方案 1：重新安装 Docker Desktop（推荐）

#### 步骤 1：清理旧的 Docker 文件
```bash
# 检查并清理 Docker 相关文件
rm -rf ~/Library/Containers/com.docker.docker
rm -rf ~/Library/Application\ Support/Docker\ Desktop
rm -rf ~/.docker
```

#### 步骤 2：从官网下载 Docker Desktop
1. 访问 Docker 官网：https://www.docker.com/products/docker-desktop/
2. 下载适用于 Mac 的 Docker Desktop（选择 Apple Silicon 或 Intel 版本）
3. 下载完成后，**不要直接打开**

#### 步骤 3：允许系统运行 Docker
```bash
# 方法 A：使用命令行移除隔离属性（推荐）
# 假设下载的文件在 ~/Downloads/Docker.dmg
xattr -d com.apple.quarantine ~/Downloads/Docker.dmg

# 或者如果已经解压到 Applications
xattr -d com.apple.quarantine /Applications/Docker.app
```

#### 步骤 4：在系统设置中允许
1. 打开 **系统设置** > **隐私与安全性**
2. 在底部找到被阻止的应用提示
3. 点击 **仍要打开** 或 **允许**

#### 步骤 5：启动 Docker Desktop
1. 打开 Docker Desktop 应用
2. 等待 Docker 完全启动（状态栏图标变为绿色）
3. 验证安装：
```bash
docker --version
docker-compose --version
```

---

### 方案 2：使用 Homebrew 安装（更简单）

```bash
# 安装 Docker Desktop
brew install --cask docker

# 启动 Docker Desktop
open /Applications/Docker.app

# 等待 Docker 启动后验证
docker --version
```

---

### 方案 3：使用本地 PostgreSQL（无需 Docker）

如果你不想使用 Docker，可以安装本地 PostgreSQL：

#### macOS 安装 PostgreSQL
```bash
# 使用 Homebrew 安装
brew install postgresql@16

# 启动 PostgreSQL 服务
brew services start postgresql@16

# 创建数据库和用户
psql postgres
```

在 psql 中执行：
```sql
CREATE USER crm_user WITH PASSWORD 'crm_password';
CREATE DATABASE crm_db OWNER crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
\q
```

然后更新 `.env` 文件：
```
DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_db?schema=public"
```

---

## 验证 Docker 配置

安装完成后，验证 Docker 是否正常工作：

```bash
# 检查 Docker 状态
docker ps

# 测试运行一个容器
docker run hello-world
```

---

## 启动项目数据库

Docker 安装成功后，执行以下命令：

```bash
# 1. 启动 PostgreSQL 容器
docker-compose up -d

# 2. 检查容器状态
docker-compose ps

# 3. 查看日志（如果需要）
docker-compose logs postgres

# 4. 初始化数据库
pnpm db:push
pnpm db:generate
```

---

## 常见问题

### Q: 仍然提示恶意软件？
A: 尝试在终端执行：
```bash
sudo spctl --master-disable  # 临时禁用 Gatekeeper（不推荐长期使用）
# 或者
sudo xattr -rd com.apple.quarantine /Applications/Docker.app
```

### Q: Docker Desktop 启动失败？
A: 检查系统要求：
- macOS 10.15 或更高版本
- 至少 4GB RAM
- 虚拟化支持已启用

### Q: 端口 5432 已被占用？
A: 修改 `docker-compose.yml` 中的端口映射，例如改为 `5433:5432`

---

## 下一步

Docker 配置成功后，继续执行：
1. ✅ 启动数据库：`docker-compose up -d`
2. ✅ 初始化数据库：`pnpm db:push && pnpm db:generate`
3. ✅ 配置 NextAuth.js 认证
4. ✅ 安装 shadcn/ui 组件
