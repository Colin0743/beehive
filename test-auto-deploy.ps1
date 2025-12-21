# Vercel 自动部署测试脚本

Write-Host "🚀 测试 Vercel 自动部署功能" -ForegroundColor Green
Write-Host ""

# 1. 修改测试文件
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$testContent = @"
# 🚀 自动部署测试

## 最后更新时间
$timestamp

## 测试状态
✅ 自动部署功能正常工作！

## 说明
每次推送代码到 GitHub 的 main 分支，Vercel 都会自动检测并部署。

---

**测试编号**: $(Get-Random -Minimum 1000 -Maximum 9999)
"@

Set-Content -Path "beehive-platform/AUTO_DEPLOY_TEST.md" -Value $testContent -Encoding UTF8

Write-Host "✅ 已更新测试文件" -ForegroundColor Green
Write-Host ""

# 2. Git 操作
Write-Host "📝 提交更改到 Git..." -ForegroundColor Yellow

git add beehive-platform/AUTO_DEPLOY_TEST.md
git commit -m "test: 测试 Vercel 自动部署 - $timestamp"

Write-Host ""
Write-Host "🔄 推送到 GitHub..." -ForegroundColor Yellow

git push origin main

Write-Host ""
Write-Host "✅ 推送完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📊 接下来的步骤：" -ForegroundColor Cyan
Write-Host "1. 打开 Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. 进入你的项目" -ForegroundColor White
Write-Host "3. 查看 'Deployments' 标签" -ForegroundColor White
Write-Host "4. 应该会看到新的部署正在进行" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  通常需要 1-3 分钟完成部署" -ForegroundColor Yellow
Write-Host ""
