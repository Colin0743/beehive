# Cursor 网页预览指南

## 方法一：使用 Live Preview 插件（推荐）

### 安装步骤

1. **打开扩展面板**
   - 按 `Ctrl+Shift+X` (Windows/Linux) 或 `Cmd+Shift+X` (Mac)
   - 或点击左侧边栏的扩展图标

2. **搜索并安装插件**
   - 搜索：`Live Preview`
   - 选择 Microsoft 官方的 `Live Preview` 插件
   - 点击"安装"

### 使用方法

1. **启动开发服务器**
   ```bash
   npm run dev
   ```
   服务器会在 `http://localhost:3000` 启动

2. **在 Cursor 中预览**
   - 右键点击任意 HTML/TSX 文件
   - 选择 "Show Preview" 或 "Open Preview"
   - 或者按 `Ctrl+Shift+V` (Windows/Linux) 或 `Cmd+Shift+V` (Mac)

3. **侧边预览**
   - 预览窗口会在侧边打开
   - 可以实时看到页面变化

## 方法二：使用 Live Server 插件

### 安装步骤

1. **搜索并安装**
   - 搜索：`Live Server`
   - 选择 Ritwick Dey 的 `Live Server` 插件
   - 点击"安装"

### 使用方法

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **在浏览器中打开**
   - 右键点击项目根目录
   - 选择 "Open with Live Server"
   - 或者点击状态栏的 "Go Live" 按钮

## 方法三：使用内置浏览器预览（最简单）

### 对于 Next.js 项目

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **在 Cursor 中打开浏览器**
   - 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac)
   - 输入：`Simple Browser: Show`
   - 输入 URL：`http://localhost:3000`
   - 回车即可在 Cursor 内置浏览器中预览

## 方法四：使用终端命令打开浏览器

### Windows PowerShell
```powershell
Start-Process "http://localhost:3000"
```

### Mac/Linux
```bash
open http://localhost:3000  # Mac
xdg-open http://localhost:3000  # Linux
```

## 推荐配置

### 1. 安装 Live Preview 插件
这是最推荐的方式，因为：
- 官方支持
- 集成在 Cursor 中
- 支持实时预览
- 不需要额外浏览器窗口

### 2. 配置快捷键

在 Cursor 中设置快捷键：
1. 按 `Ctrl+K Ctrl+S` 打开快捷键设置
2. 搜索 "Live Preview"
3. 设置快捷键（如 `Ctrl+Shift+P`）

### 3. 自动启动开发服务器

创建任务配置（`.vscode/tasks.json`）：
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "启动开发服务器",
      "type": "shell",
      "command": "npm run dev",
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": "^$",
          "file": 1,
          "location": 2,
          "message": 3
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": ".*",
          "endsPattern": ".*ready.*"
        }
      }
    }
  ]
}
```

## 快速预览步骤

1. **安装 Live Preview 插件**
   - `Ctrl+Shift+X` → 搜索 "Live Preview" → 安装

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **打开预览**
   - 右键点击 `src/app/page.tsx`
   - 选择 "Show Preview"
   - 或按 `Ctrl+Shift+V`

4. **访问管理系统**
   - 在预览窗口地址栏输入：`http://localhost:3000/admin/dashboard`

## 注意事项

- **Next.js 项目**：必须使用 `npm run dev` 启动开发服务器，不能直接用静态文件预览
- **端口冲突**：如果 3000 端口被占用，Next.js 会自动使用下一个可用端口（3001, 3002...）
- **实时更新**：修改代码后，页面会自动刷新（Hot Module Replacement）

## 故障排除

### 预览不显示
1. 确保开发服务器正在运行
2. 检查端口是否正确（查看终端输出）
3. 尝试刷新预览窗口

### 插件无法安装
1. 检查 Cursor 版本是否最新
2. 尝试重启 Cursor
3. 检查网络连接

### 预览显示空白
1. 检查浏览器控制台错误
2. 确保所有依赖已安装：`npm install`
3. 检查 Next.js 是否正常启动

## 最佳实践

1. **使用 Live Preview**：最适合 Next.js 项目
2. **保持开发服务器运行**：在终端中保持 `npm run dev` 运行
3. **使用多个预览窗口**：可以同时预览不同页面
4. **快捷键操作**：设置快捷键提高效率

