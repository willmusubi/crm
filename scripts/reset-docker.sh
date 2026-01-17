#!/bin/bash

# 重置 Docker Desktop - 解决无响应问题
# 清理卡住的进程、临时文件和配置

set -e

echo "🔄 重置 Docker Desktop..."
echo "========================"
echo ""

# 1. 停止所有 Docker 进程
echo "1. 停止所有 Docker 进程..."
killall -9 Docker 2>/dev/null || true
killall -9 com.docker.backend 2>/dev/null || true
killall -9 com.docker.vmnetd 2>/dev/null || true
killall -9 osascript 2>/dev/null || true
pkill -f docker-desktop 2>/dev/null || true
sleep 2
echo "   ✓ 进程已停止"
echo ""

# 2. 清理临时文件
echo "2. 清理临时文件..."
echo "   需要管理员权限来清理系统临时文件"
echo ""
echo "   请执行："
echo "   sudo rm -rf /tmp/docker-desktop-privileged*"
echo ""

if [ "$1" == "--execute" ]; then
    echo "开始清理临时文件..."
    sudo rm -rf /tmp/docker-desktop-privileged* 2>/dev/null || true
    echo "   ✓ 临时文件已清理"
    echo ""
fi

# 3. 清理 Docker 配置（可选，会删除所有 Docker 数据）
echo "3. 清理 Docker 配置和数据..."
echo ""
echo "   选项："
echo "   - 保留数据：只清理锁文件和缓存"
echo "   - 完全重置：删除所有 Docker 数据（包括容器、镜像等）"
echo ""

if [ "$2" == "--full-reset" ]; then
    echo "执行完全重置（删除所有 Docker 数据）..."
    rm -rf ~/Library/Containers/com.docker.docker 2>/dev/null || true
    rm -rf ~/Library/Application\ Support/Docker\ Desktop 2>/dev/null || true
    rm -rf ~/Library/Group\ Containers/group.com.docker 2>/dev/null || true
    rm -rf ~/Library/Preferences/com.docker.docker.plist 2>/dev/null || true
    rm -rf ~/.docker 2>/dev/null || true
    echo "   ✓ 所有数据已删除"
else
    echo "只清理锁文件和缓存..."
    rm -f ~/Library/Containers/com.docker.docker/.docker_desktop_lock 2>/dev/null || true
    rm -rf ~/Library/Containers/com.docker.docker/Data/*.lock 2>/dev/null || true
    rm -rf ~/Library/Application\ Support/Docker\ Desktop/*.lock 2>/dev/null || true
    echo "   ✓ 锁文件已清理"
fi
echo ""

# 4. 清理系统工具
echo "4. 清理系统工具..."
if [ "$1" == "--execute" ]; then
    sudo rm -f /Library/PrivilegedHelperTools/com.docker.* 2>/dev/null || true
    echo "   ✓ 系统工具已清理"
else
    echo "   需要管理员权限："
    echo "   sudo rm -f /Library/PrivilegedHelperTools/com.docker.*"
fi
echo ""

echo "✅ 重置完成！"
echo ""
echo "现在可以重新启动 Docker："
echo "  open /Applications/Docker.app"
echo ""
echo "如果仍然有问题，尝试完全重置："
echo "  sudo bash $0 --execute --full-reset"
