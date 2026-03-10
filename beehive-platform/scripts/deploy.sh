#!/bin/bash

SERVER_IP="${SERVER_IP:-120.79.173.147}"
SERVER_USER="${SERVER_USER:-root}"
REMOTE_PATH="${REMOTE_PATH:-/www/wwwroot/beehive-platform}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-}"
PACKAGE_MANAGER="${PACKAGE_MANAGER:-npm}"
INSTALL_CMD="${INSTALL_CMD:-$PACKAGE_MANAGER install}"
BUILD_CMD="${BUILD_CMD:-$PACKAGE_MANAGER run build}"
START_CMD="${START_CMD:-pm2 restart beehive-cn || pm2 start npm --name 'beehive-cn' --max-memory-restart 500M -- run start}"

set -euo pipefail

SSH_OPTIONS="-p $SSH_PORT"
SCP_OPTIONS="-P $SSH_PORT"
if [ -n "$SSH_KEY" ]; then
  SSH_OPTIONS="$SSH_OPTIONS -i $SSH_KEY"
  SCP_OPTIONS="$SCP_OPTIONS -i $SSH_KEY"
fi

echo "========================================"
echo "   🐝 Beehive Platform 部署脚本 (SCP版)"
echo "========================================"
echo "目标服务器: $SERVER_USER@$SERVER_IP"
echo "远程路径: $REMOTE_PATH"
echo "SSH 端口: $SSH_PORT"
echo "----------------------------------------"

# 1. 确认
read -p "是否确认开始部署? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "已取消部署"
    exit 1
fi

# 2. 打包与上传 (替代 rsync)
echo "正在打包本地文件..."
# 创建临时压缩包，排除不需要的文件
# tar在遇到文件变化时会返回1，这在开发环境中很常见，我们忽略它(返回>=2才视为失败)
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.env.local' \
    --exclude='.vscode' \
    --exclude='deploy_package.tar.gz' \
    -czf deploy_package.tar.gz . || [ $? -eq 1 ]

if [ $? -ge 2 ]; then
    echo "❌ 打包失败"
    exit 1
fi

echo "正在上传文件 (需输入服务器密码)..."
scp $SCP_OPTIONS deploy_package.tar.gz "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/"

if [ $? -ne 0 ]; then
    echo "❌ 文件上传失败"
    rm deploy_package.tar.gz
    exit 1
fi

echo "清理本地临时包..."
rm deploy_package.tar.gz

# 3. 远程解压、构建与重启
echo "正在远程解压、构建与重启服务 (需再次输入服务器密码)..."
ssh $SSH_OPTIONS "$SERVER_USER@$SERVER_IP" "set -euo pipefail; mkdir -p $REMOTE_PATH; cd $REMOTE_PATH && \
    echo '1. 解压文件...' && \
    tar -xzf deploy_package.tar.gz && \
    rm deploy_package.tar.gz && \
    echo '2. 设置脚本权限...' && \
    chmod +x scripts/*.sh && \
    echo '3. 安装依赖...' && \
    $INSTALL_CMD && \
    echo '4. 清理旧构建...' && \
    rm -rf .next && \
    echo '5. 开始构建...' && \
    $BUILD_CMD && \
    echo '6. 重启 PM2 服务...' && \
    $START_CMD && \
    echo '7. 修复文件权限...' && \
    bash scripts/deploy-permissions.sh && \
    echo '9. 修复 WebSocket 导致的 400 错误...' && \
    bash scripts/fix-nginx-upgrade.sh && \
    echo '10. 清理 Nginx 缓存...' && \
    rm -rf /www/server/nginx/proxy_cache_dir/* && \
    find /www/server/nginx/ -type d -name '*cache*' -exec rm -rf {}/* \; 2>/dev/null; \
    rm -rf /www/server/panel/vhost/nginx/cache/* 2>/dev/null; \
    nginx -s reload"

echo "========================================"
echo "✅ 部署完成！"
echo "访问: https://yangyangyunhe.cloud"
echo "========================================"
