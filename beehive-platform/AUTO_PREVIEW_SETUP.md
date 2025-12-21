# 自动打开预览配置指南

## 🎯 目标
每次打开 Cursor 时，如果没有预览窗口，自动使用 Simple Browser 打开预览。

## 📋 配置步骤

### 方法一：使用 Cursor 任务（推荐）

1. **打开任务配置**
   - 按 `Ctrl+Shift+P`
   - 输入：`Tasks: Configure Task`
   - 选择：`Create tasks.json file from template`

2. **任务已配置**
   - 我已经创建了 `.vscode/tasks.json`
   - 包含自动启动服务器的任务

3. **手动打开预览**
   - 服务器启动后，按 `Ctrl+Shift+P`
   - 输入：`Simple Browser: Show`
   - 输入：`http://localhost:3000`

### 方法二：使用启动脚本

1. **运行自动预览脚本**
   ```powershell
   .\auto-preview.ps1
   ```

2. **脚本会**：
   - 检查服务器是否运行
   - 等待服务器启动
   - 提示如何打开预览

### 方法三：配置 Cursor 启动时自动执行

由于 Cursor 的限制，无法完全自动化，但可以：

1. **创建启动脚本** `start-with-preview.ps1`：
   ```powershell
   # 启动开发服务器
   Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
   
   # 等待服务器启动
   Start-Sleep -Seconds 10
   
   # 提示打开预览
   Write-Host "服务器已启动，请在 Cursor 中按 Ctrl+Shift+P，输入 'Simple Browser: Show'，然后输入 http://localhost:3000"
   ```

2. **每次打开项目时运行**：
   ```powershell
   .\start-with-preview.ps1
   ```

## 🔧 快捷键设置（可选）

1. **打开快捷键设置**
   - 按 `Ctrl+K Ctrl+S`

2. **搜索并设置快捷键**
   - 搜索：`Simple Browser: Show`
   - 设置快捷键：如 `Ctrl+Alt+P`

3. **使用快捷键**
   - 按设置的快捷键
   - 输入：`http://localhost:3000`

## 💡 推荐工作流程

1. **打开 Cursor**
2. **运行开发服务器**（如果未运行）：
   - 按 `Ctrl+Shift+P`
   - 输入：`Tasks: Run Task`
   - 选择：`启动开发服务器`
3. **打开预览**：
   - 按 `Ctrl+Shift+P`
   - 输入：`Simple Browser: Show`
   - 输入：`http://localhost:3000`

## 📝 注意事项

- Simple Browser 是 Cursor/VS Code 的内置功能，不需要安装插件
- 服务器必须在预览之前启动
- 预览窗口会保持在 Cursor 中，方便同时查看代码和效果

## 🎨 新增功能

✅ **简洁的 Logo 设计**：使用六边形蜂巢图案，更简洁明了
✅ **页面加载动画**：跳转页面时显示 Logo 旋转动画
✅ **自动预览配置**：配置了任务和脚本，方便快速打开预览

