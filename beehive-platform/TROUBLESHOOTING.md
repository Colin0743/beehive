# 故障排除指南

## 开发服务器无法访问问题

### 1. 检查服务器是否正在运行

在 PowerShell 中运行：
```powershell
netstat -ano | findstr :3000
```

如果看到 `LISTENING` 状态，说明服务器正在运行。

### 2. 手动启动开发服务器

```bash
cd beehive-platform
npm run dev
```

应该看到类似输出：
```
✓ Next.js 16.0.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.2.5:3000

✓ Ready in X.Xs
```

### 3. 常见问题解决

#### 问题1: 端口被占用
如果端口 3000 被占用，可以：
- 关闭占用端口的程序
- 或使用其他端口：`npm run dev -- -p 3001`

#### 问题2: 防火墙阻止
检查 Windows 防火墙是否阻止了 Node.js 的网络访问。

#### 问题3: 浏览器缓存
尝试：
- 清除浏览器缓存
- 使用无痕模式访问
- 尝试访问 `http://127.0.0.1:3000` 而不是 `localhost`

#### 问题4: 依赖问题
如果服务器无法启动，尝试：
```bash
# 删除 node_modules 和重新安装
rm -rf node_modules package-lock.json
npm install

# 然后重新启动
npm run dev
```

### 4. 验证服务器运行

在浏览器中访问：
- http://localhost:3000
- http://127.0.0.1:3000
- http://192.168.2.5:3000 (局域网访问)

### 5. 查看服务器日志

如果服务器启动但无法访问，查看终端输出的错误信息。

### 6. 检查 Next.js 配置

确认 `next.config.ts` 文件没有特殊配置阻止访问。

## 如果问题仍然存在

1. 检查是否有其他 Next.js 进程在运行
2. 尝试重启计算机
3. 检查 Node.js 版本是否兼容（需要 Node.js 16+）
4. 查看完整的错误日志

