# 启动开发服务器脚本
# 确保服务器正常运行

Write-Host "正在检查开发服务器状态..." -ForegroundColor Yellow

# 检查端口3000是否被占用
$port3000 = netstat -ano | findstr :3000 | findstr LISTENING
if ($port3000) {
    Write-Host "开发服务器已在运行 (端口 3000)" -ForegroundColor Green
    Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "正在启动开发服务器..." -ForegroundColor Yellow
    
    # 停止可能存在的旧进程
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "发现 $($nodeProcesses.Count) 个 Node 进程，正在清理..." -ForegroundColor Yellow
    }
    
    # 启动新的开发服务器
    Write-Host "启动中，请稍候..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '正在启动开发服务器...' -ForegroundColor Yellow; npm run dev" -WindowStyle Normal
    
    Write-Host "等待服务器启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # 再次检查
    $port3000 = netstat -ano | findstr :3000 | findstr LISTENING
    if ($port3000) {
        Write-Host "`n开发服务器已成功启动!" -ForegroundColor Green
        Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "`n预览URL:" -ForegroundColor Cyan
        Write-Host "  首页: http://localhost:3000" -ForegroundColor White
        Write-Host "  管理系统: http://localhost:3000/admin/dashboard" -ForegroundColor White
        Write-Host "  项目管理: http://localhost:3000/admin/projects" -ForegroundColor White
        Write-Host "  用户管理: http://localhost:3000/admin/users" -ForegroundColor White
        
        Write-Host "`n在 Cursor 中打开预览:" -ForegroundColor Cyan
        Write-Host "  1. 按 Ctrl+Shift+V" -ForegroundColor White
        Write-Host "  2. 输入: http://localhost:3000/admin/dashboard" -ForegroundColor White
    } else {
        Write-Host "`n服务器启动可能遇到问题，请检查新打开的 PowerShell 窗口中的错误信息" -ForegroundColor Red
        Write-Host "或者手动运行: npm run dev" -ForegroundColor Yellow
    }
}

