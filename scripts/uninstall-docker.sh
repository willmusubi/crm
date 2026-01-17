#!/bin/bash

# 完全卸载 Docker Desktop
# 包括停止进程、删除应用、清理配置和缓存

set -e

echo "🗑️  卸载 Docker Desktop..."
echo "========================"
echo ""

# 1. 停止 Docker 进程
echo "1. 停止 Docker 进程..."
killall Docker 2>/dev/null || true
killall com.docker.backend 2>/dev/null || true
killall com.docker.driver.amd64-linux 2>/dev/null || true
killall com.docker.vmnetd 2>/dev/null || true
sleep 2
echo "   ✓ Docker 进程已停止"
echo ""

# 2. 卸载 Homebrew Cask（如果通过 Homebrew 安装）
echo "2. 检查 Homebrew 安装..."
if brew list --cask docker 2>/dev/null | grep -q docker; then
    echo "   发现 Homebrew 安装，正在卸载..."
    brew uninstall --cask docker 2>/dev/null || true
    echo "   ✓ Homebrew 卸载完成"
else
    echo "   ✓ 未通过 Homebrew 安装"
fi
echo ""

# 3. 删除 Docker.app
echo "3. 删除 Docker.app..."
if [ -d "/Applications/Docker.app" ]; then
    sudo rm -rf /Applications/Docker.app
    echo "   ✓ Docker.app 已删除"
else
    echo "   ✓ Docker.app 不存在"
fi
echo ""

# 4. 清理 Docker 配置文件和数据
echo "4. 清理 Docker 配置和数据..."
rm -rf ~/Library/Containers/com.docker.docker 2>/dev/null || true
rm -rf ~/Library/Application\ Support/Docker\ Desktop 2>/dev/null || true
rm -rf ~/Library/Group\ Containers/group.com.docker 2>/dev/null || true
rm -rf ~/Library/Preferences/com.docker.docker.plist 2>/dev/null || true
rm -rf ~/.docker 2>/dev/null || true
echo "   ✓ 配置和数据已清理"
echo ""

# 5. 清理命令行工具（需要管理员权限）
echo "5. 清理命令行工具..."
echo "   需要管理员权限来删除系统文件"
echo ""
echo "   请执行以下命令："
echo ""
echo "sudo rm -f \\"
echo "  /usr/local/bin/docker \\"
echo "  /usr/local/bin/docker-compose \\"
echo "  /usr/local/bin/docker-credential-desktop \\"
echo "  /usr/local/bin/docker-credential-osxkeychain \\"
echo "  /usr/local/bin/docker-index \\"
echo "  /usr/local/bin/hub-tool \\"
echo "  /usr/local/bin/kubectl.docker \\"
echo "  /usr/local/cli-plugins/docker-compose"
echo ""

# 如果传递了 --execute 参数，则执行清理
if [ "$1" == "--execute" ]; then
    echo "开始清理命令行工具..."
    sudo rm -f \
        /usr/local/bin/docker \
        /usr/local/bin/docker-compose \
        /usr/local/bin/docker-credential-desktop \
        /usr/local/bin/docker-credential-osxkeychain \
        /usr/local/bin/docker-index \
        /usr/local/bin/hub-tool \
        /usr/local/bin/kubectl.docker \
        /usr/local/cli-plugins/docker-compose 2>/dev/null || true
    echo "   ✓ 命令行工具已清理"
    echo ""
fi

# 6. 清理 LaunchAgents 和 LaunchDaemons
echo "6. 清理启动项..."
rm -f ~/Library/LaunchAgents/com.docker.vmnetd.plist 2>/dev/null || true
sudo rm -f /Library/LaunchDaemons/com.docker.vmnetd.plist 2>/dev/null || true
echo "   ✓ 启动项已清理"
echo ""

echo "✅ Docker 卸载完成！"
echo ""
echo "已清理的内容："
echo "  ✓ Docker.app"
echo "  ✓ 用户配置和数据"
echo "  ✓ 缓存文件"
echo ""
if [ "$1" != "--execute" ]; then
    echo "⚠️  命令行工具需要手动清理，请执行："
    echo "   sudo bash $0 --execute"
    echo ""
fi
echo "提示：如果以后需要重新安装 Docker，可以："
echo "  1. 使用 Homebrew: brew install --cask docker"
echo "  2. 或从官网下载: https://www.docker.com/products/docker-desktop/"
