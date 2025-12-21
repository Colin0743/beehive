# 服务器调试指南

## 问题：localhost:3000 无法访问

### 可能的原因

1. **服务器没有真正启动**
   - 虽然看到 "Ready" 消息，但可能立即崩溃了
   - 检查 PowerShell 窗口是否有错误信息

2. **端口被占用**
   - 3000端口被其他程序占用
   - Next.js 可能使用了其他端口

3. **防火墙阻止**
   - Windows 防火墙可能阻止了 Node.js

4. **IPv6/IPv4 问题**
   - 某些情况下 localhost 解析有问题
   - 尝试使用 127.0.0.1 代替 localhost

## 解决步骤

### 1. 检查服务器是否真的在运行

在 PowerShell 中运行：
```powershell
netstat -ano | findstr :3000 | findstr LISTENING
```

如果没有任何输出，说明服务器没有在监听3000端口。

### 2. 查看服务器启动日志

检查 PowerShell 窗口中是否有错误信息，特别是：
- 编译错误
- 端口占用错误
- 模块加载错误

### 3. 尝试使用 127.0.0.1

在浏览器或预览窗口中尝试：
```
http://127.0.0.1:3000
```
而不是 `http://localhost:3000`

### 4. 检查防火墙

1. 打开 Windows 防火墙设置
2. 检查是否阻止了 Node.js
3. 如果阻止了，添加例外规则

### 5. 使用其他端口

如果3000端口有问题，尝试使用其他端口：
```bash
npm run dev -- -p 3001
```

然后访问：`http://localhost:3001`

### 6. 检查 Node.js 版本

确保 Node.js 版本兼容：
```bash
node --version
```

Next.js 16 需要 Node.js 18.17 或更高版本。

### 7. 清理并重新安装

如果以上都不行，尝试清理：
```bash
# 删除 node_modules 和缓存
rm -rf node_modules .next
npm cache clean --force
npm install
npm run dev
```

## 快速测试

运行以下命令测试服务器：
```powershell
# 测试端口是否开放
Test-NetConnection -ComputerName localhost -Port 3000

# 测试HTTP连接
curl http://127.0.0.1:3000
```

## 如果仍然无法访问

请提供以下信息：
1. PowerShell 窗口中的完整错误信息
2. `netstat -ano | findstr :3000` 的输出
3. `node --version` 的输出
4. 浏览器控制台中的错误信息（F12）

