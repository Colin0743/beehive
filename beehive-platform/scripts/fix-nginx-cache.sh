#!/bin/bash
# 修复 Nginx 缓存问题 - 在服务器上直接执行
# 用法: ssh root@120.79.173.147 'bash -s' < scripts/fix-nginx-cache.sh

set -e

echo "========================================="
echo "   🔧 Nginx 缓存修复脚本"
echo "========================================="

# 1. 查找所有 Nginx 缓存目录并清空
echo ""
echo "1. 查找并清空所有 Nginx 缓存目录..."
# 常见宝塔面板缓存路径
CACHE_DIRS=(
    "/www/server/nginx/proxy_cache_dir"
    "/www/server/panel/vhost/nginx/cache"
    "/tmp/nginx_cache"
    "/var/cache/nginx"
)

for dir in "${CACHE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "   清空缓存目录: $dir"
        rm -rf "$dir"/*
    fi
done

# 搜索 Nginx 配置中的 proxy_cache_path
echo ""
echo "2. 搜索 Nginx 配置中的缓存路径..."
NGINX_CACHE_PATHS=$(grep -r "proxy_cache_path" /www/server/nginx/conf/ 2>/dev/null | grep -oP '/[^\s]+' | head -5 || true)
if [ -n "$NGINX_CACHE_PATHS" ]; then
    for p in $NGINX_CACHE_PATHS; do
        if [ -d "$p" ]; then
            echo "   清空配置中的缓存路径: $p"
            rm -rf "$p"/*
        fi
    done
fi

# 3. 查找包含 yangyangyunhe 的 Nginx 站点配置
echo ""
echo "3. 查找站点 Nginx 配置文件..."
SITE_CONF=$(grep -rl "yangyangyunhe" /www/server/panel/vhost/nginx/ 2>/dev/null || grep -rl "yangyangyunhe" /www/server/nginx/conf/vhost/ 2>/dev/null || echo "")
if [ -n "$SITE_CONF" ]; then
    echo "   找到站点配置: $SITE_CONF"
    echo "   当前配置内容:"
    echo "   ---"
    cat $SITE_CONF
    echo ""
    echo "   ---"
else
    echo "   未找到站点配置，尝试其他路径..."
    find /www/server/ -name "*.conf" -exec grep -l "yangyangyunhe" {} \; 2>/dev/null || echo "   未找到"
fi

# 4. 显示 proxy_cache 相关配置
echo ""
echo "4. 检查 Nginx 全局配置中的 proxy_cache 设置..."
grep -rn "proxy_cache" /www/server/nginx/conf/ 2>/dev/null | head -20 || echo "   未找到 proxy_cache 配置"

# 5. 重载 Nginx
echo ""
echo "5. 重载 Nginx..."
nginx -s reload

echo ""
echo "========================================="
echo "✅ 缓存清理完成！"
echo "========================================="
