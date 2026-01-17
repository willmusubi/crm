#!/bin/bash

# 修复 Docker 权限和隔离属性
# 解决 macOS Gatekeeper 阻止 Docker 的问题

set -e

echo "🔓 修复 Docker 权限..."
echo "======================"
echo ""

DOCKER_APP="/Applications/Docker.app"
VMNETD_PATH="$DOCKER_APP/Contents/Library/LaunchServices/com.docker.vmnetd"

if [ ! -d "$DOCKER_APP" ]; then
    echo "❌ Docker.app 不存在于 $DOCKER_APP"
    exit 1
fi

echo "找到 Docker.app: $DOCKER_APP"
echo ""

# 检查隔离属性
echo "检查隔离属性..."
if xattr -l "$DOCKER_APP" | grep -q "com.apple.quarantine"; then
    echo "  ⚠️  发现隔离属性，需要移除"
else
    echo "  ✓ 未发现隔离属性"
fi

echo ""
echo "需要执行以下命令来移除隔离属性："
echo ""
echo "sudo xattr -rd com.apple.quarantine $DOCKER_APP"
echo "sudo xattr -rd com.apple.quarantine $VMNETD_PATH"
echo ""

# 如果传递了 --execute 参数，则执行
if [ "$1" == "--execute" ]; then
    echo "开始移除隔离属性..."
    echo ""
    
    # 移除 Docker.app 的隔离属性
    echo "移除 Docker.app 的隔离属性..."
    sudo xattr -rd com.apple.quarantine "$DOCKER_APP" 2>/dev/null || true
    
    # 移除 vmnetd 的隔离属性
    if [ -e "$VMNETD_PATH" ]; then
        echo "移除 vmnetd 的隔离属性..."
        sudo xattr -rd com.apple.quarantine "$VMNETD_PATH" 2>/dev/null || true
    fi
    
    # 移除所有 Docker 相关组件的隔离属性
    echo "移除所有 Docker 组件的隔离属性..."
    find "$DOCKER_APP" -type f -exec sudo xattr -rd com.apple.quarantine {} \; 2>/dev/null || true
    
    echo ""
    echo "✅ 隔离属性已移除！"
    echo ""
    echo "现在可以尝试启动 Docker："
    echo "  open /Applications/Docker.app"
    echo ""
    echo "如果仍然弹出警告，请在系统设置中允许："
    echo "  系统设置 > 隐私与安全性 > 找到被阻止的应用 > 点击'仍要打开'"
else
    echo "要执行修复，请运行："
    echo "  sudo bash $0 --execute"
fi
