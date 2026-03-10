#!/bin/bash
# 修复 /_next/static/ location 块缺少 proxy_set_header 的问题
# 用法: ssh root@120.79.173.147 'bash -s' < scripts/fix-nginx-headers.sh

set -e

CONF="/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"
cp "$CONF" "${CONF}.bak2.$(date +%s)"

# 用 sed 在 /_next/static/ 的 proxy_pass 行之后插入 proxy_set_header 行
sed -i '/location \/_next\/static\//,/}/ {
    /proxy_pass http:\/\/127.0.0.1:3001;/a\
        proxy_set_header Host $host:$server_port;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}' "$CONF"

echo "配置已更新，测试中..."
nginx -t

if [ $? -eq 0 ]; then
    nginx -s reload
    echo "✅ Nginx 已重载，/_next/static/ 现在包含正确的代理头"
else
    echo "❌ 配置测试失败，恢复备份..."
    LATEST=$(ls -t "${CONF}.bak2."* | head -1)
    cp "$LATEST" "$CONF"
    nginx -s reload
    echo "已恢复备份"
    exit 1
fi
