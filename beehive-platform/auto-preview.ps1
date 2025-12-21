# 自动打开 Simple Browser 预览脚本
# 在 Cursor 启动时自动执行

Write-Host "正在检查开发服务器状态..." -ForegroundColor Yellow

# 等待服务器启动
$maxAttempts = 30
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    $portCheck = netstat -ano | findstr :3000 | findstr LISTENING
    if ($portCheck) {
        $serverReady = $true
        Write-Host "服务器已就绪!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
    $attempt++
    Write-Host "." -NoNewline -ForegroundColor Gray
}

Write-Host "`n"

if ($serverReady) {
    Write-Host "服务器运行在: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "`n请在 Cursor 中执行以下操作打开预览:" -ForegroundColor Yellow
    Write-Host "1. 按 Ctrl+Shift+P" -ForegroundColor White
    Write-Host "2. 输入: Simple Browser: Show" -ForegroundColor White
    Write-Host "3. 输入: http://localhost:3000" -ForegroundColor White
    Write-Host "`n或者直接访问: http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "服务器未启动，请先运行: npm run dev" -ForegroundColor Red
}

