# 在 Cursor 中使用 Live Preview 预览网页

## 步骤 1：确保开发服务器运行

开发服务器应该已经在后台启动。如果看到终端显示：
```
✓ Ready in X.Xs
- Local: http://localhost:3000
```

说明服务器已启动。

## 步骤 2：打开预览窗口

### 方法一：使用快捷键（最快）
1. 按 `Ctrl+Shift+V` (Windows) 或 `Cmd+Shift+V` (Mac)
2. 预览窗口会在侧边打开

### 方法二：使用命令面板
1. 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
2. 输入：`Live Preview: Show Preview`
3. 回车

### 方法三：右键菜单
1. 右键点击任意文件（如 `src/app/page.tsx`）
2. 选择 "Show Preview" 或 "Open Preview"

## 步骤 3：输入 URL

在预览窗口的地址栏中输入：

### 首页
```
http://localhost:3000
```

### 管理系统（需要管理员账号）
```
http://localhost:3000/admin/dashboard
```

### 其他页面
- 登录页面：`http://localhost:3000/auth/login`
- 注册页面：`http://localhost:3000/auth/register`
- 项目管理：`http://localhost:3000/admin/projects`
- 用户管理：`http://localhost:3000/admin/users`

## 步骤 4：创建管理员账号（用于访问管理系统）

1. 先访问注册页面：`http://localhost:3000/auth/register`
2. 注册一个账号
3. 打开浏览器控制台（F12）
4. 执行以下代码设置管理员角色：
```javascript
const usersStr = localStorage.getItem('registeredUsers');
const users = JSON.parse(usersStr);
const user = users.find(u => u.email === '你的邮箱@example.com');
if (user) {
  user.role = 'admin';
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  const currentUserStr = localStorage.getItem('user');
  if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr);
    if (currentUser.email === user.email) {
      currentUser.role = 'admin';
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }
  location.reload();
}
```

## 预览功能说明

- **实时更新**：修改代码后，页面会自动刷新
- **侧边预览**：预览窗口在编辑器侧边，可以同时查看代码和预览
- **全屏预览**：点击预览窗口右上角的图标可以全屏显示
- **开发者工具**：右键预览窗口可以打开开发者工具

## 常见问题

### 预览显示空白
- 检查开发服务器是否运行
- 确认 URL 是否正确（应该是 `http://localhost:3000`）
- 查看终端是否有错误信息

### 无法连接
- 确认端口 3000 没有被其他程序占用
- 尝试刷新预览窗口
- 重启开发服务器

### 预览窗口没有打开
- 确认 Live Preview 插件已正确安装
- 尝试使用命令面板方法打开
- 重启 Cursor

## 快捷键参考

- `Ctrl+Shift+V` / `Cmd+Shift+V` - 显示预览
- `Ctrl+Shift+P` / `Cmd+Shift+P` - 打开命令面板
- `F5` - 刷新预览（某些配置下）

