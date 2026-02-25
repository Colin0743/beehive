#!/bin/bash
set -e

echo "========================================"
echo "   🐝 Beehive Platform 测试环境配置"
echo "========================================"

# 1. 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未找到 npm，请先安装 Node.js 和 npm"
    exit 1
fi

# 2. 安装依赖
echo "📦 正在安装依赖..."
npm install

# 3. 安装 Playwright 浏览器
echo "🎭 正在安装 Playwright 浏览器..."
npx playwright install --with-deps

echo "========================================"
echo "✅ 环境配置完成！"
echo "----------------------------------------"
echo "运行单元测试: npm run test:unit"
echo "运行 E2E 测试: npx playwright test"
echo "查看测试覆盖率: npm run test:coverage"
echo "========================================"
