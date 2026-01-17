#!/bin/bash

# 清理 Docker 冲突文件的脚本
# 用于解决 Homebrew 安装 Docker 时的文件冲突问题

set -e

echo "🧹 清理 Docker 冲突文件..."
echo "=========================="
echo ""

# 需要清理的文件列表
FILES_TO_REMOVE=(
    "/usr/local/bin/docker"
    "/usr/local/bin/docker-compose"
    "/usr/local/bin/docker-credential-desktop"
    "/usr/local/bin/docker-credential-osxkeychain"
    "/usr/local/bin/docker-index"
    "/usr/local/bin/hub-tool"
    "/usr/local/bin/kubectl.docker"
)

echo "检查需要清理的文件："
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -e "$file" ] || [ -L "$file" ]; then
        echo "  ✓ 找到: $file"
        if [ -L "$file" ]; then
            echo "    -> $(readlink "$file")"
        fi
    fi
done

echo ""
echo "⚠️  需要管理员权限来删除这些文件"
echo ""
echo "请执行以下命令："
echo ""
echo "sudo rm -f \\"
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -e "$file" ] || [ -L "$file" ]; then
        echo "  $file \\"
    fi
done
echo "  /usr/local/cli-plugins/docker-compose 2>/dev/null || true"
echo ""
echo "或者直接运行："
echo ""
echo "sudo bash $0 --execute"
echo ""

# 如果传递了 --execute 参数，则执行清理
if [ "$1" == "--execute" ]; then
    echo "开始清理..."
    for file in "${FILES_TO_REMOVE[@]}"; do
        if [ -e "$file" ] || [ -L "$file" ]; then
            echo "删除: $file"
            sudo rm -f "$file"
        fi
    done
    # 清理 cli-plugins 目录
    sudo rm -f /usr/local/cli-plugins/docker-compose 2>/dev/null || true
    echo ""
    echo "✅ 清理完成！"
    echo ""
    echo "现在可以重新安装 Docker："
    echo "  brew install --cask docker"
fi
