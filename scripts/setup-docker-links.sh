#!/bin/bash

# 创建 Docker 命令行工具的符号链接
# 用于修复 Docker 命令找不到的问题

set -e

DOCKER_APP="/Applications/Docker.app"
DOCKER_BIN="$DOCKER_APP/Contents/Resources/bin"
DOCKER_CLI_PLUGINS="$DOCKER_APP/Contents/Resources/cli-plugins"

echo "🔗 设置 Docker 命令行工具链接..."
echo "================================"
echo ""

if [ ! -d "$DOCKER_APP" ]; then
    echo "❌ Docker.app 不存在于 $DOCKER_APP"
    exit 1
fi

echo "找到 Docker.app: $DOCKER_APP"
echo ""

# 需要创建链接的文件
LINKS=(
    "$DOCKER_BIN/docker:/usr/local/bin/docker"
    "$DOCKER_CLI_PLUGINS/docker-compose:/usr/local/bin/docker-compose"
    "$DOCKER_BIN/docker-credential-desktop:/usr/local/bin/docker-credential-desktop"
    "$DOCKER_BIN/docker-credential-osxkeychain:/usr/local/bin/docker-credential-osxkeychain"
    "$DOCKER_BIN/docker-index:/usr/local/bin/docker-index"
    "$DOCKER_BIN/hub-tool:/usr/local/bin/hub-tool"
    "$DOCKER_BIN/kubectl:/usr/local/bin/kubectl.docker"
)

echo "需要创建以下链接（需要管理员权限）："
for link in "${LINKS[@]}"; do
    src="${link%%:*}"
    dst="${link##*:}"
    if [ -e "$src" ]; then
        echo "  $src -> $dst"
    fi
done
echo ""

if [ "$1" == "--execute" ]; then
    echo "开始创建链接..."
    echo ""
    
    # 创建 CLI 插件目录
    sudo mkdir -p /usr/local/cli-plugins 2>/dev/null || true
    
    for link in "${LINKS[@]}"; do
        src="${link%%:*}"
        dst="${link##*:}"
        
        if [ -e "$src" ]; then
            # 如果目标已存在，先删除
            if [ -e "$dst" ] || [ -L "$dst" ]; then
                echo "删除旧链接: $dst"
                sudo rm -f "$dst"
            fi
            
            # 创建新链接
            echo "创建链接: $dst -> $src"
            sudo ln -s "$src" "$dst"
        fi
    done
    
    # 创建 docker-compose 插件链接
    if [ -e "$DOCKER_CLI_PLUGINS/docker-compose" ]; then
        sudo mkdir -p /usr/local/cli-plugins
        sudo ln -sf "$DOCKER_CLI_PLUGINS/docker-compose" /usr/local/cli-plugins/docker-compose 2>/dev/null || true
    fi
    
    echo ""
    echo "✅ 链接创建完成！"
    echo ""
    echo "验证："
    docker --version
    docker-compose --version 2>/dev/null || docker compose version
else
    echo "要执行链接创建，请运行："
    echo "  sudo bash $0 --execute"
    echo ""
    echo "或者，更简单的方法："
    echo "  1. 启动 Docker Desktop: open /Applications/Docker.app"
    echo "  2. 等待 Docker 完全启动（菜单栏图标变绿）"
    echo "  3. Docker Desktop 会自动创建这些链接"
fi
