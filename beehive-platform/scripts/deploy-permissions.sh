#!/bin/bash
# 生产环境文件权限设置
# 在服务器上执行: bash scripts/deploy-permissions.sh
# 或: chmod +x scripts/deploy-permissions.sh && ./scripts/deploy-permissions.sh

set -e

PROJECT_DIR="/www/wwwroot/beehive-platform"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "错误: 项目目录不存在 $PROJECT_DIR"
  exit 1
fi

echo "设置 $PROJECT_DIR 所有者为 www:www ..."
chown -R www:www "$PROJECT_DIR"

echo "设置目录权限 755 ..."
chmod -R 755 "$PROJECT_DIR"

if [ -d "$PROJECT_DIR/public" ]; then
  echo "设置 public 目录可写 (775) ..."
  chmod -R 775 "$PROJECT_DIR/public"
fi

echo "权限设置完成。"
