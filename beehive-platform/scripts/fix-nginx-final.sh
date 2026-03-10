#!/bin/bash
# 修复方案：移除有问题的 /_next/static/ location 块，让所有请求走主 location /
# 用法: ssh root@120.79.173.147 'bash -s' < scripts/fix-nginx-final.sh

set -e

CONF="/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"
cp "$CONF" "${CONF}.bak3.$(date +%s)"

# 用 python3 来精确删除 /_next/static/ location 块
python3 << 'PYEOF'
import re

conf_file = "/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"
with open(conf_file, 'r') as f:
    content = f.read()

# 删除整个 /_next/static/ location 块（从 "location /_next/static/" 到对应的 "}"）
# 使用非贪婪匹配
content = re.sub(
    r'\s*location /_next/static/\s*\{[^}]*\}\s*',
    '\n',
    content
)

with open(conf_file, 'w') as f:
    f.write(content)

print("已移除 /_next/static/ location 块")
PYEOF

echo "测试 Nginx 配置..."
nginx -t

if [ $? -eq 0 ]; then
    # 清空缓存再重启
    rm -rf /www/server/nginx/proxy_cache_dir/*
    nginx -s stop
    sleep 1
    nginx
    echo "✅ Nginx 已完全重启，网站应该恢复正常了"
else
    echo "❌ 配置测试失败，恢复备份..."
    LATEST=$(ls -t "${CONF}.bak3."* | head -1)
    cp "$LATEST" "$CONF"
    nginx -s reload
    echo "已恢复备份"
    exit 1
fi
