# 稳定的开发服务器启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  蜂巢平台 - 开发服务器启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 清理旧的进程
Write-Host "正在清理旧的进程..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 检查端口占用
Write-Host "正在检查端口 3000..." -ForegroundColor Yellow
$portInfo = netstat -ano | findstr :3000 | findstr LISTENING
if ($portInfo) {
    $processId = ($portInfo -split '\s+')[-1]
    Write-Host "发现进程 $processId 占用端口 3000，正在关闭..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "正在启动开发服务器..." -ForegroundColor Green
Write-Host "服务器地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

# 切换到项目目录
Set-Location $PSScriptRoot

# 设置环境变量，禁用某些可能导致问题的功能
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# 启动开发服务器（前台运行，可以看到所有输出）
try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "服务器启动失败！" -ForegroundColor Red
    Write-Host "错误信息: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查：" -ForegroundColor Yellow
    Write-Host "1. Node.js 版本是否正确（需要 16+）" -ForegroundColor Yellow
    Write-Host "2. 依赖是否已安装（运行 npm install）" -ForegroundColor Yellow
    Write-Host "3. 端口 3000 是否被占用" -ForegroundColor Yellow
    exit 1
}

