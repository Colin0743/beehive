#!/bin/bash
# 捕获 Nginx 的详细错误日志
echo "" > /www/wwwlogs/泱泱云合AI制片厂.error.log
echo "" > /www/wwwlogs/泱泱云合AI制片厂.log

# 触发一次 400 请求
curl -s -k https://www.yangyangyunhe.cloud/_next/static/css/0bf6087f32595951.css > /dev/null

echo "=== error.log ==="
cat /www/wwwlogs/泱泱云合AI制片厂.error.log

echo "=== access.log ==="
tail -n 5 /www/wwwlogs/泱泱云合AI制片厂.log
