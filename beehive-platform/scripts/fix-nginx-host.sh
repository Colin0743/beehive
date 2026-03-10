#!/bin/bash
# 修复 proxy_set_header Host 导致 400 Bad Request
sed -i 's/proxy_set_header Host $host:$server_port;/proxy_set_header Host $host;/g' '/www/server/panel/vhost/nginx/node_泱泱云合AI制片厂.conf'
nginx -t && nginx -s reload && echo "✅ Host 头已修复，网站应该正常了"
