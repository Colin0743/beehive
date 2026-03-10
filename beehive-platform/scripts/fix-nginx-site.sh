#!/bin/bash
# 修复 Nginx 站点配置：禁止代理缓存 HTML 页面
# 用法: ssh root@120.79.173.147 'bash -s' < scripts/fix-nginx-site.sh

set -e

CONF_FILE="/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"

if [ ! -f "$CONF_FILE" ]; then
    echo "❌ 配置文件不存在: $CONF_FILE"
    exit 1
fi

echo "备份原始配置..."
cp "$CONF_FILE" "${CONF_FILE}.bak.$(date +%s)"

echo "修改 Nginx 站点配置..."

# 使用 sed 替换 location / 块：
# 1. 为 /_next/static/ 添加单独的 location，允许缓存（文件名含 hash，安全）
# 2. 在主 location / 中禁用 proxy_cache
cat > /tmp/nginx_location_patch.conf << 'NGINX_EOF'
    # 静态资源 - 允许缓存（文件名包含 content hash）
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_cache cache_one;
        proxy_cache_valid 200 30d;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header X-Cache $upstream_cache_status;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host:$server_port;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header REMOTE-HOST $remote_addr;
        proxy_set_header X-Host $host:$server_port;
        proxy_set_header X-Scheme $scheme;
        proxy_connect_timeout 30s;
        proxy_read_timeout 86400s;
        proxy_send_timeout 30s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 禁用代理缓存 - 防止 HTML 页面被缓存导致部署后 ChunkLoadError
        proxy_no_cache 1;
        proxy_cache_bypass 1;
        add_header X-Cache $upstream_cache_status;
    }
NGINX_EOF

# 使用 Python 来做精确替换（比 sed 更可靠处理多行）
python3 << 'PYEOF'
import re

conf_file = "/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"

with open(conf_file, 'r') as f:
    content = f.read()

# 读取补丁内容
with open('/tmp/nginx_location_patch.conf', 'r') as f:
    patch = f.read()

# 匹配从 "location ~ /purge" 到 "# HTTP反向代理相关配置结束" 之间的所有内容
pattern = r'location ~ /purge\(/\.\*\).*?# HTTP反向代理相关配置结束 <<<'
replacement = patch + '\n    # HTTP反向代理相关配置结束 <<<'

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

if new_content == content:
    print("⚠️  未能匹配到要替换的内容，尝试备用方案...")
    # 备用方案：直接在 location / 块中插入 proxy_no_cache
    new_content = content.replace(
        'proxy_set_header Connection "upgrade";',
        'proxy_set_header Connection "upgrade";\n\n        # 禁用代理缓存 - 防止 HTML 页面被缓存导致部署后 ChunkLoadError\n        proxy_no_cache 1;\n        proxy_cache_bypass 1;'
    )

with open(conf_file, 'w') as f:
    f.write(new_content)

print("✅ 配置文件已更新")
PYEOF

# 清理
rm -f /tmp/nginx_location_patch.conf

# 清空代理缓存
echo "清空代理缓存..."
rm -rf /www/server/nginx/proxy_cache_dir/*

# 测试配置
echo "测试 Nginx 配置..."
nginx -t

if [ $? -eq 0 ]; then
    echo "重载 Nginx..."
    nginx -s reload
    echo ""
    echo "========================================="
    echo "✅ Nginx 站点配置已修复！"
    echo "  - HTML 页面不再被 Nginx 代理缓存"
    echo "  - 静态资源 (/_next/static/) 仍然被缓存"
    echo "========================================="
else
    echo "❌ Nginx 配置测试失败，恢复备份..."
    LATEST_BAK=$(ls -t "${CONF_FILE}.bak."* | head -1)
    cp "$LATEST_BAK" "$CONF_FILE"
    nginx -s reload
    echo "已恢复到备份配置"
    exit 1
fi
