# ✅ 开发服务器已启动

## 服务器信息

- **本地访问**: http://localhost:3000
- **局域网访问**: http://192.168.2.5:3000
- **状态**: ✓ Ready in 13.6s

## 🚀 在 Cursor 中打开预览

### 方法一：快捷键（最快）
1. 按 `Ctrl+Shift+V`
2. 预览窗口会在侧边打开
3. 在地址栏输入：`http://localhost:3000/admin/dashboard`
4. 回车即可看到管理界面

### 方法二：命令面板
1. 按 `Ctrl+Shift+P`
2. 输入：`Live Preview: Show Preview`
3. 回车
4. 在地址栏输入：`http://localhost:3000/admin/dashboard`

## 📋 常用页面URL

在预览窗口地址栏输入以下URL：

```
首页: http://localhost:3000
管理系统: http://localhost:3000/admin/dashboard
项目管理: http://localhost:3000/admin/projects
用户管理: http://localhost:3000/admin/users
登录页面: http://localhost:3000/auth/login
注册页面: http://localhost:3000/auth/register
```

## ⚠️ 访问管理系统需要管理员权限

如果访问管理系统时被重定向，需要先创建管理员账号：

1. 访问注册页面：`http://localhost:3000/auth/register`
2. 注册一个账号
3. 打开浏览器控制台（F12）
4. 执行以下代码：

```javascript
const usersStr = localStorage.getItem('registeredUsers');
const users = JSON.parse(usersStr);
const user = users[users.length - 1]; // 最后一个注册的用户
if (user) {
  user.role = 'admin';
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  const currentUserStr = localStorage.getItem('user');
  if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr);
    currentUser.role = 'admin';
    localStorage.setItem('user', JSON.stringify(currentUser));
  }
  location.reload();
}
```

5. 刷新页面后即可访问管理系统

## 💡 提示

- **实时更新**：修改代码后，预览会自动刷新
- **保持服务器运行**：不要关闭 PowerShell 窗口，保持服务器运行
- **停止服务器**：在 PowerShell 窗口中按 `Ctrl+C`

