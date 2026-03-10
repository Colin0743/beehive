#!/bin/bash
# 在服务器上运行诊断并保存结果
ssh root@120.79.173.147 'bash -s' << 'REMOTEOF' > /tmp/diag_output.txt 2>&1
echo "=== 1. 当前 Nginx 站点配置 ==="
cat '/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf'

echo ""
echo "=== 2. Nginx 全局 proxy.conf ==="
cat /www/server/nginx/conf/proxy.conf

echo ""
echo "=== 3. 最近的 Nginx 错误日志 ==="
tail -20 '/www/wwwlogs/泱泱云合AI制片厂.error.log' 2>/dev/null || echo "无错误日志"

echo ""
echo "=== 4. 直接测试 ==="
curl -s -o /dev/null -w "Direct Status: %{http_code}\n" http://127.0.0.1:3001/_next/static/css/0bf6087f32595951.css

echo ""
echo "=== 5. 通过 Nginx 测试 ==="
curl -s -o /dev/null -w "Proxied Status: %{http_code}\n" -k https://www.yangyangyunhe.cloud/_next/static/css/0bf6087f32595951.css

echo ""
echo "=== 6. 完整 400 响应体 ==="
curl -s -k https://www.yangyangyunhe.cloud/_next/static/css/0bf6087f32595951.css | head -5

echo ""
echo "=== 7. PM2 状态 ==="
pm2 list
REMOTEOF
echo "诊断结果已保存到 /tmp/diag_output.txt"
