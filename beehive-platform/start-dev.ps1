# 开发服务器启动脚本

Write-Host "正在检查端口 3000 占用情况..." -ForegroundColor Yellow

# 查找并关闭占用端口 3000 的进程
$portInfo = netstat -ano | findstr :3000 | findstr LISTENING
if ($portInfo) {
    $processId = ($portInfo -split '\s+')[-1]
    Write-Host "发现进程 $processId 占用端口 3000，正在关闭..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "已关闭进程 $processId" -ForegroundColor Green
}

Write-Host ""
Write-Host "正在启动开发服务器..." -ForegroundColor Cyan
Write-Host ""

# 切换到项目目录
Set-Location $PSScriptRoot

# 启动开发服务器
npm run dev

