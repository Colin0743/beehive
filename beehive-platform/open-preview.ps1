# 打开预览脚本
# 此脚本会启动开发服务器并在浏览器中打开预览

Write-Host "正在检查开发服务器状态..." -ForegroundColor Yellow

# 检查端口3000是否被占用
$port3000 = netstat -ano | findstr :3000 | findstr LISTENING
if ($port3000) {
    Write-Host "✓ 开发服务器已在运行" -ForegroundColor Green
} else {
    Write-Host "正在启动开发服务器..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 5
    Write-Host "✓ 开发服务器已启动" -ForegroundColor Green
}

Write-Host "`n预览URL列表：" -ForegroundColor Cyan
Write-Host "  首页: http://localhost:3000" -ForegroundColor White
Write-Host "  管理系统: http://localhost:3000/admin/dashboard" -ForegroundColor White
Write-Host "  项目管理: http://localhost:3000/admin/projects" -ForegroundColor White
Write-Host "  用户管理: http://localhost:3000/admin/users" -ForegroundColor White
Write-Host "  登录页面: http://localhost:3000/auth/login" -ForegroundColor White
Write-Host "  注册页面: http://localhost:3000/auth/register" -ForegroundColor White

Write-Host "`n在 Cursor 中打开预览：" -ForegroundColor Cyan
Write-Host "  1. 按 Ctrl+Shift+V 打开 Live Preview" -ForegroundColor White
Write-Host "  2. 在地址栏输入上述URL" -ForegroundColor White
Write-Host "`n或者：" -ForegroundColor Cyan
Write-Host "  1. 按 Ctrl+Shift+P" -ForegroundColor White
Write-Host "  2. 输入: Live Preview: Show Preview" -ForegroundColor White
Write-Host "  3. 输入URL: http://localhost:3000/admin/dashboard" -ForegroundColor White

# 尝试在默认浏览器中打开（可选）
$openBrowser = Read-Host "`n是否在浏览器中打开管理界面? (y/n)"
if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
    Start-Process "http://localhost:3000/admin/dashboard"
    Write-Host "已在浏览器中打开管理界面" -ForegroundColor Green
}

