# 在 Cursor 编辑器中预览网页

## 🚀 快速打开预览（3种方法）

### 方法一：快捷键（最快）⭐
1. **按 `Ctrl+Shift+V`**（Windows）或 `Cmd+Shift+V`（Mac）
2. 预览窗口会在编辑器右侧打开
3. 在地址栏输入：`http://localhost:3000`
4. 回车即可看到网页

### 方法二：命令面板
1. **按 `Ctrl+Shift+P`**（Windows）或 `Cmd+Shift+P`（Mac）
2. 输入：`Live Preview: Show Preview`
3. 回车
4. 在地址栏输入：`http://localhost:3000`

### 方法三：右键菜单
1. **右键点击**任意文件（如 `src/app/page.tsx`）
2. 选择 **"Show Preview"** 或 **"Open Preview"**
3. 在地址栏输入：`http://localhost:3000`

## 📋 常用预览URL

在预览窗口的地址栏中输入：

```
首页: http://localhost:3000
管理系统: http://localhost:3000/admin/dashboard
项目管理: http://localhost:3000/admin/projects
用户管理: http://localhost:3000/admin/users
登录页面: http://localhost:3000/auth/login
注册页面: http://localhost:3000/auth/register
```

## 💡 预览功能说明

- **侧边预览**：预览窗口在编辑器右侧，可以同时查看代码和效果
- **实时更新**：修改代码后，预览会自动刷新（Hot Module Replacement）
- **全屏模式**：点击预览窗口右上角的图标可以全屏显示
- **开发者工具**：右键预览窗口可以打开开发者工具（F12）
- **地址栏导航**：可以在预览窗口中直接输入URL访问不同页面

## ⚙️ 预览窗口操作

- **刷新**：点击地址栏旁边的刷新按钮
- **前进/后退**：使用浏览器导航按钮
- **全屏**：点击右上角全屏图标
- **关闭**：点击预览窗口的 X 按钮

## 🎯 现在就开始预览

1. **确保服务器正在运行**（应该已经在运行了）
2. **按 `Ctrl+Shift+V`**
3. **输入**：`http://localhost:3000`
4. **回车**即可看到网站！

## 🔧 如果预览窗口没有打开

1. 确认 Live Preview 插件已安装
2. 检查服务器是否运行：`netstat -ano | findstr :3000 | findstr LISTENING`
3. 尝试使用 `http://127.0.0.1:3000` 代替 `localhost`
4. 重启 Cursor

