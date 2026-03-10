#!/bin/bash
# 诊断 400 Bad Request 问题
echo "=== 1. 当前 Nginx 站点配置 ==="
cat '/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf'

echo ""
echo "=== 2. Nginx 全局 proxy.conf ==="
cat /www/server/nginx/conf/proxy.conf

echo ""
echo "=== 3. 最近的 Nginx 错误日志 ==="
tail -20 '/www/wwwlogs/泱泱云合AI制片厂.error.log' 2>/dev/null || echo "无错误日志"

echo ""
echo "=== 4. 直接测试带完整头 ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" -H "Host: www.yangyangyunhe.cloud" -H "X-Real-IP: 1.2.3.4" http://127.0.0.1:3001/_next/static/css/0bf6087f32595951.css

echo ""
echo "=== 5. 通过 Nginx 测试 ==="
curl -s -o /dev/null -w "Status: %{http_code}\n" https://www.yangyangyunhe.cloud/_next/static/css/0bf6087f32595951.css -k

echo ""
echo "=== 6. PM2 状态 ==="
pm2 list
