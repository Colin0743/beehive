# Vercel 自动部署配置指南

## ✅ 自动部署已启用

当你的项目连接到 GitHub 后，Vercel 会自动监听以下事件：

### 默认自动部署触发条件

1. **推送到 main 分支** → 自动部署到生产环境
2. **推送到其他分支** → 自动创建预览部署
3. **创建 Pull Request** → 自动创建预览部署

## 🔍 验证自动部署配置

### 在 Vercel Dashboard 中检查

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Git**
4. 确认以下设置：

#### Production Branch（生产分支）
- ✅ 应该设置为：`main`（或 `master`）
- 这个分支的每次推送都会触发生产部署

#### Deploy Hooks（部署钩子）
- 可选：创建自定义部署钩子
- 用于从外部触发部署

## 📝 推荐的 Git 工作流

### 方式 1：直接推送到 main（简单项目）

```powershell
# 修改代码后
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

✅ Vercel 会自动检测并部署到生产环境

### 方式 2：使用分支和 PR（团队协作）

```powershell
# 创建功能分支
git checkout -b feature/new-feature

# 修改代码
git add .
git commit -m "feat: 添加新功能"
git push origin feature/new-feature
```

✅ Vercel 会自动创建预览部署
✅ 在 GitHub 创建 PR 后，可以在 PR 中看到预览链接
✅ 合并 PR 到 main 后，自动部署到生产环境

## 🎯 自动部署配置选项

### 在 Vercel Settings → Git 中可以配置：

#### 1. Production Branch（生产分支）
- **默认**：`main`
- **说明**：推送到这个分支会触发生产部署

#### 2. Ignored Build Step（忽略构建步骤）
- **用途**：设置条件来跳过某些提交的构建
- **示例**：跳过文档更新的构建

```bash
# 在 Vercel 设置中添加
git diff HEAD^ HEAD --quiet . ':(exclude)*.md'
```

#### 3. Auto-assign Custom Domains（自动分配自定义域名）
- **默认**：启用
- **说明**：生产部署自动使用自定义域名

#### 4. Deploy Previews（预览部署）
- **默认**：启用
- **说明**：为每个分支和 PR 创建预览部署

## 🚀 测试自动部署

### 快速测试

1. 修改一个文件（比如 README.md）

```powershell
cd E:\桌面\蜂巢

# 修改文件
echo "# 测试自动部署" >> beehive-platform/README.md

# 提交并推送
git add beehive-platform/README.md
git commit -m "test: 测试 Vercel 自动部署"
git push origin main
```

2. 查看 Vercel Dashboard
   - 进入 **Deployments** 标签
   - 应该会看到新的部署正在进行
   - 状态：Building → Ready

3. 部署完成后
   - 点击部署查看详情
   - 可以看到构建日志
   - 访问生产 URL 验证更新

## 📊 部署状态监控

### 在 Vercel Dashboard 中

1. **Deployments** 标签
   - 查看所有部署历史
   - 每个部署显示：
     - 提交信息
     - 分支名称
     - 部署状态
     - 部署时间
     - 预览 URL

2. **部署状态**
   - 🟡 **Building**：正在构建
   - 🟢 **Ready**：部署成功
   - 🔴 **Error**：部署失败
   - ⚪ **Canceled**：已取消

### GitHub 集成

在 GitHub 仓库中：
- 每次推送后，会看到 Vercel 的状态检查
- PR 中会显示预览部署链接
- 提交旁边会显示部署状态

## 🔔 部署通知

### 配置通知（可选）

1. 进入 **Settings** → **Notifications**
2. 可以配置：
   - Email 通知
   - Slack 通知
   - Discord 通知
   - Webhook 通知

### 推荐设置

- ✅ 生产部署失败时通知
- ✅ 生产部署成功时通知（可选）
- ❌ 预览部署通知（太频繁）

## 🛠️ 高级配置：vercel.json

如果需要更精细的控制，可以创建 `vercel.json` 配置文件：

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  },
  "github": {
    "enabled": true,
    "autoAlias": true,
    "silent": false,
    "autoJobCancelation": true
  }
}
```

**注意**：大多数情况下不需要这个文件，Vercel 的默认配置已经很好了。

## ✅ 确认自动部署工作正常

### 检查清单

- [ ] GitHub 仓库已连接到 Vercel
- [ ] Production Branch 设置为 `main`
- [ ] 推送代码后，Vercel Dashboard 显示新部署
- [ ] 部署成功后，生产 URL 显示最新内容
- [ ] GitHub 提交旁边显示 Vercel 状态

## 🎯 常见问题

### Q: 推送代码后没有自动部署？

**检查**：
1. Vercel Dashboard → Settings → Git
2. 确认 GitHub 连接状态
3. 确认 Production Branch 设置正确
4. 检查是否有构建错误

### Q: 想要禁用某个分支的自动部署？

**方法**：
1. Settings → Git → Ignored Build Step
2. 添加条件脚本来跳过特定分支

### Q: 如何回滚到之前的部署？

**方法**：
1. Deployments 标签
2. 找到之前成功的部署
3. 点击 "..." → "Promote to Production"

### Q: 预览部署太多，如何清理？

**方法**：
1. Settings → Deployments
2. 设置 "Deployment Retention"
3. 自动删除旧的预览部署

## 📚 相关资源

- [Vercel Git 集成文档](https://vercel.com/docs/deployments/git)
- [Vercel 部署钩子](https://vercel.com/docs/deployments/deploy-hooks)
- [GitHub 集成指南](https://vercel.com/docs/deployments/git/vercel-for-github)

## 🎉 总结

你的项目现在已经配置好自动部署了！

**工作流程**：
1. 本地修改代码
2. `git add .` → `git commit -m "..."` → `git push`
3. Vercel 自动检测并部署
4. 几分钟后，更新就上线了！

就是这么简单！🚀
