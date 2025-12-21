# 快速预览指南

## 🚀 一键打开管理界面预览

### 在 Cursor 中打开预览（推荐）

1. **按快捷键**：`Ctrl+Shift+V`
2. **在地址栏输入**：`http://localhost:3000/admin/dashboard`
3. **回车**即可看到管理界面

### 使用命令面板

1. **按** `Ctrl+Shift+P`
2. **输入**：`Live Preview: Show Preview`
3. **输入URL**：`http://localhost:3000/admin/dashboard`

## 📋 常用预览URL

复制以下URL到预览窗口地址栏：

```
首页: http://localhost:3000
管理系统: http://localhost:3000/admin/dashboard
项目管理: http://localhost:3000/admin/projects
用户管理: http://localhost:3000/admin/users
登录页面: http://localhost:3000/auth/login
注册页面: http://localhost:3000/auth/register
```

## 🔧 快速脚本

运行以下命令获取所有预览URL：

```powershell
.\open-preview.ps1
```

## 💡 提示

- **实时更新**：修改代码后，预览会自动刷新
- **侧边预览**：预览窗口在编辑器侧边，方便同时查看代码和效果
- **全屏模式**：点击预览窗口右上角图标可全屏显示
- **开发者工具**：右键预览窗口可打开开发者工具（F12）

## ⚠️ 注意事项

1. **确保服务器运行**：预览前确保 `npm run dev` 正在运行
2. **管理员权限**：访问管理系统需要管理员账号
3. **端口检查**：如果3000端口被占用，Next.js会自动使用3001、3002等

## 🎯 创建管理员账号

访问管理系统需要管理员权限，创建方法：

1. 先注册一个普通账号
2. 打开浏览器控制台（F12）
3. 执行以下代码：

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

