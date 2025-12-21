# 启动开发服务器并提示打开预览

Write-Host "=== 蜂巢平台启动脚本 ===" -ForegroundColor Cyan
Write-Host ""

# 检查服务器是否已运行
$portCheck = netstat -ano | findstr :3000 | findstr LISTENING
if ($portCheck) {
    Write-Host "✓ 开发服务器已在运行" -ForegroundColor Green
} else {
    Write-Host "正在启动开发服务器..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '=== 开发服务器 ===' -ForegroundColor Green; npm run dev" -WindowStyle Normal
    Write-Host "等待服务器启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 12
}

Write-Host ""
Write-Host "=== 在 Cursor 中打开预览 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "方法1：使用命令面板（推荐）" -ForegroundColor Yellow
Write-Host "  1. 按 Ctrl+Shift+P" -ForegroundColor White
Write-Host "  2. 输入: Simple Browser: Show" -ForegroundColor White
Write-Host "  3. 输入: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "方法2：设置快捷键" -ForegroundColor Yellow
Write-Host "  1. 按 Ctrl+K Ctrl+S 打开快捷键设置" -ForegroundColor White
Write-Host "  2. 搜索: Simple Browser: Show" -ForegroundColor White
Write-Host "  3. 设置快捷键（如 Ctrl+Alt+P）" -ForegroundColor White
Write-Host ""
Write-Host "访问地址:" -ForegroundColor Cyan
Write-Host "  首页: http://localhost:3000" -ForegroundColor White
Write-Host "  管理系统: http://localhost:3000/admin/dashboard" -ForegroundColor White
Write-Host ""

