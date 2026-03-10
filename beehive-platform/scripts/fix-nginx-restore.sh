#!/bin/bash
# 恢复原始 Nginx 配置，只添加最小改动（禁用 HTML 代理缓存）

CONF="/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf"

# 找到最早的备份（原始配置）
FIRST_BAK=$(ls -t "${CONF}.bak."* "${CONF}.bak2."* "${CONF}.bak3."* 2>/dev/null | tail -1)

if [ -z "$FIRST_BAK" ]; then
    echo "❌ 找不到备份文件"
    exit 1
fi

echo "恢复原始配置: $FIRST_BAK"
cp "$FIRST_BAK" "$CONF"

# 只做一个最小改动：在 location / 的 proxy_set_header Connection "upgrade"; 后面
# 加入 proxy_no_cache 和 proxy_cache_bypass
sed -i '/proxy_set_header Connection "upgrade";/a\
\
        # 禁用HTML代理缓存\
        proxy_no_cache 1;\
        proxy_cache_bypass 1;' "$CONF"

echo ""
echo "验证修改后的 location / 块:"
grep -A 3 'proxy_set_header Connection' "$CONF"

echo ""
echo "测试 Nginx 配置..."
nginx -t

if [ $? -eq 0 ]; then
    rm -rf /www/server/nginx/proxy_cache_dir/*
    nginx -s stop
    sleep 1
    nginx
    echo ""
    echo "✅ 已恢复原始配置 + 最小修改，网站应该正常了"
else
    echo "❌ 配置有误，直接恢复纯原始配置..."
    cp "$FIRST_BAK" "$CONF"
    nginx -s reload
    echo "已恢复纯原始配置"
fi
