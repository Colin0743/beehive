#!/bin/bash
# 修复静态资源 400 错误的终极方案：恢复正确的 Upgrade 转发逻辑

CONF="/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"
cp "$CONF" "${CONF}.bak5.$(date +%s)"

# 在 proxy_http_version 1.1; 下面添加正确的头转发
# 注意不能写死 "Connection: upgrade"，而是应该使用 nginx 变量 $connection_upgrade
# 如果没定义这个变量，默认为 close 即可。

cat > /tmp/nginx_patch.txt << 'EOF'
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
EOF

# 使用 python 做精确替换
python3 << 'PYEOF'
import re

conf_file = "/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"
with open(conf_file, 'r') as f:
    content = f.read()

with open('/tmp/nginx_patch.txt', 'r') as f:
    patch = f.read()

# 替换 proxy_http_version 1.1; 这一行
content = re.sub(r'\s*proxy_http_version 1\.1;', '\n' + patch, content)

with open(conf_file, 'w') as f:
    f.write(content)
PYEOF

echo "测试配置..."
nginx -t

if [ $? -eq 0 ]; then
    nginx -s reload
    echo "✅ Nginx 已经重新加载。正确的 Upgrade 头转发已恢复！"
else
    echo "❌ 配置有误，恢复备份..."
    LATEST=$(ls -t "${CONF}.bak5."* | head -1)
    cp "$LATEST" "$CONF"
    nginx -s reload
    exit 1
fi
