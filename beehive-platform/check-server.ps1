# 检查并启动开发服务器

Write-Host "检查开发服务器状态..." -ForegroundColor Yellow

# 检查端口
$portCheck = netstat -ano | findstr :3000 | findstr LISTENING
if ($portCheck) {
    Write-Host "服务器正在运行!" -ForegroundColor Green
    Write-Host "访问: http://localhost:3000" -ForegroundColor Cyan
    exit 0
}

Write-Host "服务器未运行，正在启动..." -ForegroundColor Yellow

# 检查是否有Node进程
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "发现 $($nodeProcesses.Count) 个 Node 进程" -ForegroundColor Yellow
}

# 启动服务器（前台运行以便看到输出）
Write-Host "`n正在启动开发服务器..." -ForegroundColor Cyan
Write-Host "请在新窗口中查看启动日志" -ForegroundColor Yellow
Write-Host "启动完成后，访问: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`n按 Ctrl+C 停止服务器`n" -ForegroundColor Yellow

npm run dev

