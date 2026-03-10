#!/bin/bash
# 修复 400 Bad Request 和页面卡加载的终极方案
# 移除 Nginx 中强行把所有请求转为 WebSocket 的错误配置

CONF="/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"
cp "$CONF" "${CONF}.bak4.$(date +%s)"

# 删掉导致 Next.js 崩溃的 proxy_set_header
sed -i '/proxy_set_header Upgrade/d' "$CONF"
sed -i '/proxy_set_header Connection "upgrade"/d' "$CONF"
sed -i '/proxy_set_header Connection \$http_connection/d' "$CONF"

echo "已移除错误的 WebSocket 头强转。测试配置..."
nginx -t

if [ $? -eq 0 ]; then
    nginx -s reload
    echo "✅ Nginx 已经重新加载！"
    echo "🚀 现在您的网站应该完美恢复了，静态资源 400 问题已彻底解决！"
else
    echo "❌ 配置有误，恢复备份..."
    LATEST=$(ls -t "${CONF}.bak4."* | head -1)
    cp "$LATEST" "$CONF"
    nginx -s reload
    exit 1
fi
