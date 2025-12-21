# Vercel 部署指南

## 问题诊断

你遇到的 Vercel 部署错误是因为：
1. **根目录配置错误**：项目在 `beehive-platform` 子目录中，但 Vercel 默认在根目录查找
2. **依赖版本冲突**：React 19 与某些依赖不兼容
3. **Next.js 安全漏洞**：版本 16.0.6 存在 CVE-2025-66478

## 解决方案

### 步骤 1：本地清理和重新安装依赖

在项目根目录执行以下命令：

```powershell
# 进入 beehive-platform 目录
cd beehive-platform

# 删除旧的依赖
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 重新安装依赖（使用 legacy-peer-deps）
npm install

# 本地测试
npm run dev
```

### 步骤 2：验证本地运行

打开浏览器访问 `http://localhost:3000`，确保：
- ✅ 应用正常启动
- ✅ 页面可以正常访问
- ✅ 语言切换功能正常（默认英文）
- ✅ 登录/注册功能正常

### 步骤 3：提交更改到 Git

```powershell
# 返回项目根目录
cd ..

# 添加更改
git add beehive-platform/package.json
git add beehive-platform/.npmrc
git add beehive-platform/package-lock.json

# 提交
git commit -m "fix: 降级 Next.js 到 15.1.3 和 React 到 18.3.1 以解决部署问题"

# 推送到 GitHub
git push
```

### 步骤 4：配置 Vercel 项目设置

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 **Settings** → **General**
4. 找到 **Root Directory** 设置
5. 点击 **Edit**，输入：`beehive-platform`
6. 点击 **Save**

### 步骤 5：重新部署

有两种方式触发重新部署：

**方式 A：自动部署**
- 推送代码到 GitHub 后，Vercel 会自动检测并部署

**方式 B：手动部署**
1. 在 Vercel Dashboard 中
2. 进入 **Deployments** 标签
3. 点击右上角的 **Redeploy** 按钮

## 预期结果

部署成功后，你应该看到：
- ✅ Build 成功完成
- ✅ 没有安全漏洞警告
- ✅ 应用可以正常访问
- ✅ 默认语言为英文
- ✅ 语言切换功能正常

## 常见问题

### Q: 如果本地测试失败怎么办？
A: 检查以下内容：
- 确保 Node.js 版本 >= 18
- 确保 `.npmrc` 文件存在
- 尝试清除 Next.js 缓存：`Remove-Item -Recurse -Force .next`

### Q: Vercel 部署仍然失败？
A: 检查 Vercel 构建日志：
- 确认 Root Directory 设置为 `beehive-platform`
- 确认使用的 Node.js 版本（推荐 18.x 或 20.x）
- 查看具体的错误信息

### Q: 为什么要降级 Next.js 和 React？
A: 
- Next.js 16.0.6 存在安全漏洞 CVE-2025-66478
- React 19 与 react-quill 和 semantic-ui-react 不兼容
- Next.js 15.1.3 + React 18.3.1 是当前最稳定的组合

## 版本信息

当前使用的版本：
- Next.js: 15.1.3
- React: 18.3.1
- React DOM: 18.3.1
- Node.js: >= 18.x（推荐）

## 需要帮助？

如果遇到其他问题，请检查：
1. Vercel 构建日志中的具体错误信息
2. 本地 `npm run build` 是否成功
3. `.npmrc` 文件是否正确配置
