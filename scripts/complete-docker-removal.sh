#!/bin/bash

# 完全删除 Docker 的最终步骤
# 需要管理员权限

echo "🔧 完成 Docker 删除（需要管理员权限）"
echo "======================================"
echo ""
echo "请执行以下命令来完全删除 Docker："
echo ""
echo "# 1. 删除 Docker.app（需要密码）"
echo "sudo rm -rf /Applications/Docker.app"
echo ""
echo "# 2. 删除命令行工具（需要密码）"
echo "sudo rm -f \\"
echo "  /usr/local/bin/docker \\"
echo "  /usr/local/bin/docker-compose \\"
echo "  /usr/local/bin/docker-credential-desktop \\"
echo "  /usr/local/bin/docker-credential-osxkeychain \\"
echo "  /usr/local/bin/docker-index \\"
echo "  /usr/local/bin/hub-tool \\"
echo "  /usr/local/bin/kubectl.docker"
echo ""
echo "# 3. 删除 CLI 插件目录（如果为空）"
echo "sudo rmdir /usr/local/cli-plugins 2>/dev/null || true"
echo ""
echo "# 4. 删除系统级 Docker 工具（需要密码）"
echo "sudo rm -f /Library/PrivilegedHelperTools/com.docker.*"
echo ""
echo "# 5. 清理临时文件"
echo "sudo rm -rf /tmp/docker-desktop-privileged*"
echo ""
echo "或者，如果要自动执行，运行："
echo "  sudo bash $0 --execute"

if [ "$1" == "--execute" ]; then
    echo ""
    echo "开始执行删除..."
    echo ""
    
    # 删除 Docker.app
    if [ -d "/Applications/Docker.app" ]; then
        echo "删除 Docker.app..."
        sudo rm -rf /Applications/Docker.app
        echo "  ✓ 完成"
    fi
    
    # 删除命令行工具
    echo "删除命令行工具..."
    sudo rm -f \
        /usr/local/bin/docker \
        /usr/local/bin/docker-compose \
        /usr/local/bin/docker-credential-desktop \
        /usr/local/bin/docker-credential-osxkeychain \
        /usr/local/bin/docker-index \
        /usr/local/bin/hub-tool \
        /usr/local/bin/kubectl.docker 2>/dev/null || true
    echo "  ✓ 完成"
    
    # 删除 CLI 插件目录
    sudo rmdir /usr/local/cli-plugins 2>/dev/null || true
    
    # 删除系统工具
    echo "删除系统工具..."
    sudo rm -f /Library/PrivilegedHelperTools/com.docker.* 2>/dev/null || true
    echo "  ✓ 完成"
    
    # 清理临时文件
    echo "清理临时文件..."
    sudo rm -rf /tmp/docker-desktop-privileged* 2>/dev/null || true
    echo "  ✓ 完成"
    
    echo ""
    echo "✅ Docker 已完全删除！"
fi
