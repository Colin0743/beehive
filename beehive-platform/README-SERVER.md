# 服务器运行指南

## 问题：服务器启动后1分钟内自动停止

### 原因分析

1. **Toast组件闭包问题** - 已修复
   - `showToast` 函数中调用了 `removeToast`，但依赖数组为空
   - 已修复：将 `removeToast` 定义移到 `showToast` 之前，并添加到依赖数组

2. **可能的其他原因**
   - 运行时错误导致服务器崩溃
   - 内存不足
   - 端口冲突

### 解决方案

#### 方案1：使用启动脚本（推荐）

```powershell
.\start-server.ps1
```

这个脚本会：
- 自动清理旧进程
- 检查端口占用
- 设置内存限制
- 在前台运行，可以看到所有输出

#### 方案2：使用保活监控脚本

如果服务器经常崩溃，可以使用保活脚本自动重启：

```powershell
.\keep-alive.ps1
```

这个脚本会：
- 每30秒检查一次服务器状态
- 如果服务器停止，自动重启
- 最多重启10次

#### 方案3：手动启动

```powershell
# 清理旧进程
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 启动服务器
npm run dev
```

### 验证服务器运行

```powershell
# 检查端口
netstat -ano | findstr :3000 | findstr LISTENING

# 测试访问
Invoke-WebRequest -Uri http://localhost:3000 -Method Head
```

### 查看服务器日志

服务器日志保存在 `server.log` 文件中：

```powershell
Get-Content server.log -Tail 50
```

### 常见问题

#### 1. 端口被占用
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 关闭进程（替换 PID）
Stop-Process -Id <PID> -Force
```

#### 2. 内存不足
设置环境变量：
```powershell
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run dev
```

#### 3. 依赖问题
```powershell
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 监控服务器

如果服务器持续崩溃，建议：

1. 查看浏览器控制台错误
2. 查看服务器日志文件
3. 检查是否有运行时错误
4. 使用保活脚本自动重启

### 生产环境建议

开发环境使用 `npm run dev`，生产环境使用：

```powershell
npm run build
npm start
```

这样可以避免开发模式的热重载问题。

