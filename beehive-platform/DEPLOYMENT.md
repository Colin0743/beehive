# 部署指南

## 1. 自动化部署 (推荐)

本项目提供了一键部署脚本，位于 `scripts/deploy.sh`。该脚本会自动打包本地代码、上传到服务器、解压、安装依赖、构建并重启服务。

### 前置条件
*   本地已安装 `ssh` 和 `scp` 工具。
*   建议配置 SSH 免密登录（见下文），否则每次需手动输入密码。

### 使用方法

在项目根目录下运行：

```bash
# 替换为你的服务器信息
SERVER_IP=120.79.173.147 SERVER_USER=root bash scripts/deploy.sh
```

如果配置了 SSH 密钥（推荐）：
```bash
SERVER_IP=120.79.173.147 SERVER_USER=root SSH_KEY=~/.ssh/id_rsa bash scripts/deploy.sh
```

### 脚本流程
1.  **打包**: 自动排除 `node_modules`、`.next` 等无关文件，生成 `deploy_package.tar.gz`。
2.  **上传**: 使用 `scp` 将压缩包上传至服务器 `/www/wwwroot/beehive-platform`。
3.  **远程执行**:
    *   解压文件。
    *   安装依赖 (`npm install`)。
    *   构建项目 (`npm run build`)。
    *   重启 PM2 服务 (`pm2 restart start`)。
    *   清理 Nginx 缓存。

---

## 2. 手动部署流程（备用）

### 服务器信息

- **SSH**: `ssh root@120.79.173.147`
- **路径**: `/www/wwwroot/beehive-platform/`
- **运行方式**: PM2 (进程名 `start`)
- **反向代理**: Nginx -> 3001 端口

### 手动步骤

#### 1. 上传文件
使用 SCP 或 FTP 工具上传代码到服务器。

#### 2. SSH 登录后执行更新
```bash
cd /www/wwwroot/beehive-platform

# 1. 安装新依赖 (如果有)
npm install

# 2. 清理旧构建缓存
rm -rf .next

# 3. 构建项目
npm run build

# 4. 重启服务
pm2 restart start

# 5. 清理 Nginx 缓存 (重要)
rm -rf /www/server/nginx/proxy_cache_dir/*
nginx -s reload
```

### 排查问题常用命令
```bash
# 查看 PM2 日志
pm2 logs start --lines 50

# 检查端口占用
netstat -tulpn | grep 3001

# 验证本地服务响应
curl http://localhost:3001
```

---

## 3. SSH 密钥认证配置（免密登录）

为了方便部署，建议配置 SSH 密钥认证。

#### 1. 本地生成密钥
```bash
ssh-keygen -t rsa -b 4096 -C "beehive-deploy"
# 一路回车，默认生成在 ~/.ssh/id_rsa
```

#### 2. 将公钥上传到服务器
```bash
ssh-copy-id root@120.79.173.147
# 输入一次密码即可
```

#### 3. 验证
```bash
ssh root@120.79.173.147
# 此时应直接登录，无需密码
```
