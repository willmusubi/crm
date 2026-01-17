#!/bin/bash

# Docker 安装和配置脚本
# 用于解决 macOS Docker 恶意软件警告问题

set -e

echo "🚀 Docker 安装和配置脚本"
echo "=========================="
echo ""

# 检查是否已安装 Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker 已安装"
    docker --version
    echo ""
    
    # 检查 Docker 是否运行
    if docker ps &> /dev/null; then
        echo "✅ Docker 正在运行"
    else
        echo "⚠️  Docker 未运行，请启动 Docker Desktop"
        echo "   打开 /Applications/Docker.app 或运行: open /Applications/Docker.app"
        exit 1
    fi
else
    echo "❌ Docker 未安装"
    echo ""
    echo "请选择安装方式："
    echo "1. 使用 Homebrew 安装（推荐）"
    echo "2. 手动从官网下载"
    echo ""
    read -p "请输入选项 (1/2): " choice
    
    case $choice in
        1)
            echo "📦 使用 Homebrew 安装 Docker Desktop..."
            if ! command -v brew &> /dev/null; then
                echo "❌ 未安装 Homebrew，请先安装: https://brew.sh"
                exit 1
            fi
            brew install --cask docker
            echo "✅ Docker Desktop 安装完成"
            echo "   请启动 Docker Desktop: open /Applications/Docker.app"
            echo "   等待 Docker 启动后，重新运行此脚本"
            exit 0
            ;;
        2)
            echo "📥 请访问 https://www.docker.com/products/docker-desktop/ 下载"
            echo "   下载后，在终端执行以下命令允许运行："
            echo "   xattr -d com.apple.quarantine ~/Downloads/Docker.dmg"
            echo "   或"
            echo "   xattr -d com.apple.quarantine /Applications/Docker.app"
            exit 0
            ;;
        *)
            echo "❌ 无效选项"
            exit 1
            ;;
    esac
fi

echo ""
echo "🔍 检查 Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

echo "✅ Docker Compose 已安装"
echo ""

# 检查端口是否被占用
echo "🔍 检查端口 5432..."
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 5432 已被占用"
    echo "   如果这是 Docker 容器，将尝试停止旧容器"
    docker-compose down 2>/dev/null || true
fi

echo ""
echo "🐘 启动 PostgreSQL 容器..."
docker-compose up -d

echo ""
echo "⏳ 等待数据库启动（最多 30 秒）..."
timeout=30
counter=0
while ! docker-compose exec -T postgres pg_isready -U crm_user -d crm_db > /dev/null 2>&1; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge $timeout ]; then
        echo "❌ 数据库启动超时"
        echo "   查看日志: docker-compose logs postgres"
        exit 1
    fi
    echo -n "."
done
echo ""
echo "✅ 数据库已启动"

echo ""
echo "📊 数据库连接信息："
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: crm_db"
echo "   User: crm_user"
echo "   Password: crm_password"

echo ""
echo "✅ Docker 配置完成！"
echo ""
echo "下一步："
echo "   1. 初始化数据库: pnpm db:push"
echo "   2. 生成 Prisma Client: pnpm db:generate"
echo "   3. 启动开发服务器: pnpm dev"
