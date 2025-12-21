# 服务器保活脚本 - 监控并自动重启服务器

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  蜂巢平台 - 服务器保活监控" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$checkInterval = 30  # 每30秒检查一次
$maxRestarts = 10   # 最大重启次数
$restartCount = 0

function Test-Server {
    try {
        $response = Invoke-WebRequest -Uri http://localhost:3000 -Method Head -TimeoutSec 3 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Start-DevServer {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 正在启动开发服务器..." -ForegroundColor Yellow
    
    # 清理旧进程
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    # 检查端口占用
    $portInfo = netstat -ano | findstr :3000 | findstr LISTENING
    if ($portInfo) {
        $processId = ($portInfo -split '\s+')[-1]
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    
    # 启动服务器
    Set-Location $PSScriptRoot
    $env:NODE_OPTIONS = "--max-old-space-size=4096"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; `$env:NODE_OPTIONS='--max-old-space-size=4096'; npm run dev" -WindowStyle Minimized
    
    Start-Sleep -Seconds 10
}

# 初始启动
Start-DevServer

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 开始监控服务器状态..." -ForegroundColor Green
Write-Host "检查间隔: $checkInterval 秒" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 停止监控" -ForegroundColor Yellow
Write-Host ""

while ($true) {
    Start-Sleep -Seconds $checkInterval
    
    if (-not (Test-Server)) {
        $restartCount++
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ⚠️  服务器无响应，正在重启... (第 $restartCount 次)" -ForegroundColor Red
        
        if ($restartCount -ge $maxRestarts) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ❌ 达到最大重启次数 ($maxRestarts)，停止监控" -ForegroundColor Red
            break
        }
        
        Start-DevServer
        
        # 等待服务器启动
        Start-Sleep -Seconds 15
        
        if (Test-Server) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ 服务器重启成功" -ForegroundColor Green
            $restartCount = 0  # 重置计数器
        } else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ❌ 服务器重启失败" -ForegroundColor Red
        }
    } else {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ 服务器运行正常" -ForegroundColor Green
    }
}

