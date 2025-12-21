# ✅ 网站重新部署完成

## 部署步骤

1. ✅ 清理所有 Node.js 进程
2. ✅ 清理构建缓存 (.next 目录)
3. ✅ 重新构建项目
4. ✅ 启动开发服务器

## 🚀 访问网站

### 本地访问
- **首页**: http://localhost:3000
- **管理系统**: http://localhost:3000/admin/dashboard
- **项目管理**: http://localhost:3000/admin/projects
- **用户管理**: http://localhost:3000/admin/users
- **登录页面**: http://localhost:3000/auth/login
- **注册页面**: http://localhost:3000/auth/register

### 局域网访问
- **首页**: http://192.168.2.5:3000
- **管理系统**: http://192.168.2.5:3000/admin/dashboard

## 📋 在 Cursor 中预览

1. 按 `Ctrl+Shift+V` 打开 Live Preview
2. 在地址栏输入：`http://localhost:3000`
3. 或输入：`http://127.0.0.1:3000`（如果 localhost 有问题）

## ⚠️ 注意事项

- **保持服务器运行**：不要关闭 PowerShell 窗口
- **停止服务器**：在 PowerShell 窗口中按 `Ctrl+C`
- **查看日志**：服务器日志会显示在 PowerShell 窗口中

## 🔧 如果无法访问

1. **检查服务器状态**：
   ```powershell
   netstat -ano | findstr :3000 | findstr LISTENING
   ```

2. **尝试使用 127.0.0.1**：
   ```
   http://127.0.0.1:3000
   ```

3. **检查 PowerShell 窗口**：查看是否有错误信息

4. **重启服务器**：
   ```powershell
   npm run dev
   ```

## 📝 服务器管理

### 启动服务器
```powershell
npm run dev
```

### 停止服务器
在 PowerShell 窗口中按 `Ctrl+C`

### 重新部署
```powershell
# 清理并重新启动
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
npm run dev
```

