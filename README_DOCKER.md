# 🐳 Docker 问题快速解决指南

## 问题
macOS 提示 "Docker.app" 包含恶意软件并被移到垃圾桶。

## ✅ 快速解决方案（推荐）

### 方法 1：使用 Homebrew 安装（最简单）

```bash
# 1. 安装 Docker Desktop
brew install --cask docker

# 2. 启动 Docker Desktop
open /Applications/Docker.app

# 3. 等待 Docker 启动（状态栏图标变绿）

# 4. 验证安装
docker --version
docker-compose --version

# 5. 运行自动配置脚本
./scripts/setup-docker.sh
```

### 方法 2：手动下载安装

1. **下载 Docker Desktop**
   - 访问：https://www.docker.com/products/docker-desktop/
   - 选择 Mac 版本（Apple Silicon 或 Intel）

2. **允许系统运行 Docker**
   ```bash
   # 如果下载的是 .dmg 文件
   xattr -d com.apple.quarantine ~/Downloads/Docker.dmg
   
   # 如果已经安装到 Applications
   xattr -d com.apple.quarantine /Applications/Docker.app
   ```

3. **在系统设置中允许**
   - 打开 **系统设置** > **隐私与安全性**
   - 找到被阻止的应用，点击 **仍要打开**

4. **启动并验证**
   ```bash
   open /Applications/Docker.app
   docker --version
   ```

---

## 🚀 启动项目数据库

Docker 安装成功后：

```bash
# 方式 1：使用自动脚本（推荐）
./scripts/setup-docker.sh

# 方式 2：手动启动
docker-compose up -d
docker-compose ps  # 检查状态

# 初始化数据库
pnpm db:push
pnpm db:generate
```

---

## 🔍 验证数据库连接

```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs postgres

# 测试连接
docker-compose exec postgres psql -U crm_user -d crm_db -c "SELECT version();"
```

---

## ❌ 如果仍然无法运行

### 临时解决方案（不推荐长期使用）

```bash
# 临时禁用 macOS Gatekeeper（需要管理员权限）
sudo spctl --master-disable

# 安装 Docker 后，重新启用
sudo spctl --master-enable
```

### 替代方案：使用本地 PostgreSQL

如果 Docker 问题无法解决，可以使用本地 PostgreSQL：

```bash
# 安装 PostgreSQL
brew install postgresql@16

# 启动服务
brew services start postgresql@16

# 创建数据库
psql postgres << EOF
CREATE USER crm_user WITH PASSWORD 'crm_password';
CREATE DATABASE crm_db OWNER crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
EOF
```

然后确保 `.env.local` 文件中的 `DATABASE_URL` 指向本地数据库。

---

## 📝 下一步

Docker 配置成功后，继续开发：

1. ✅ 启动数据库：`docker-compose up -d`
2. ✅ 初始化数据库：`pnpm db:push && pnpm db:generate`
3. ✅ 配置 NextAuth.js 认证
4. ✅ 安装 shadcn/ui 组件
5. ✅ 创建基础布局和功能模块

---

## 💡 提示

- Docker Desktop 首次启动可能需要几分钟
- 确保 Docker Desktop 在后台运行（菜单栏有 Docker 图标）
- 如果端口 5432 被占用，修改 `docker-compose.yml` 中的端口映射
