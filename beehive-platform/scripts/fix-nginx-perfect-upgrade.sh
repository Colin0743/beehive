#!/bin/bash
# 终极修复：完美支持 HTTP/2 请求和 WebSocket，解决 400 错误
set -e

SITE_CONF="/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"
NGINX_CONF="/www/server/nginx/conf/nginx.conf"

cp "$SITE_CONF" "${SITE_CONF}.bak6.$(date +%s)"

# 确保 nginx.conf 中有 map $http_upgrade $connection_upgrade 
if ! grep -q "connection_upgrade" "$NGINX_CONF"; then
    echo "在 nginx.conf 中添加 connection_upgrade map..."
    sed -i '/http {/a\
    map $http_upgrade $connection_upgrade {\n        default upgrade;\n        ""      close;\n    }' "$NGINX_CONF"
fi

cat > /tmp/nginx_patch.txt << 'EOF'
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
EOF

# Python 替换
python3 << 'PYEOF'
import re

conf_file = "/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"
with open(conf_file, 'r') as f:
    content = f.read()

with open('/tmp/nginx_patch.txt', 'r') as f:
    patch = f.read()

# 把之前恢复的错误的 proxy_set_header Connection 替换掉
# (可能是 proxy_set_header Connection $http_connection; 或缺失)
# 我们统一找到 proxy_http_version 1.1; 后面的所有 Upgrade/Connection，并替换为标准版
content = re.sub(
    r'\s*proxy_http_version 1\.1;.*?(?=proxy_no_cache|# 禁用|access_log|})', 
    '\n' + patch + '\n\n        ', 
    content, 
    flags=re.DOTALL
)

with open(conf_file, 'w') as f:
    f.write(content)
PYEOF

echo "测试完美配置..."
nginx -t

if [ $? -eq 0 ]; then
    nginx -s reload
    echo ""
    echo "================================================="
    echo "✅ 完美修复！"
    echo "  - 现在常规 HTTP/2 请求会收到 Connection: close (不再是空头报错 400)"
    echo "  - WebSocket 握手会收到 Connection: upgrade (完美支持热更新)"
    echo "================================================="
else
    echo "❌ 配置有误，恢复备份..."
    LATEST=$(ls -t "${SITE_CONF}.bak6."* | head -1)
    cp "$LATEST" "$SITE_CONF"
    nginx -s reload
    exit 1
fi
