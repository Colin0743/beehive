# Playwright 测试文档

## 测试概述

本项目使用 Playwright 进行端到端（E2E）测试，覆盖以下功能：

1. **首页功能测试** (`homepage.spec.ts`)
   - 页面标题显示
   - 主标题和副标题
   - 流程漫画轮播
   - 精选项目标题
   - 轮播切换功能

2. **用户认证测试** (`auth.spec.ts`)
   - 注册页面访问
   - 登录页面访问
   - 表单验证
   - 用户注册
   - 密码验证（正确/错误密码）

3. **项目功能测试** (`projects.spec.ts`)
   - 创建项目页面访问
   - 项目表单验证
   - 项目创建流程

4. **UI 组件测试** (`ui.spec.ts`)
   - 响应式布局
   - 导航链接
   - Toast 通知
   - 图片加载
   - 表单输入
   - 按钮交互

## 运行测试

### 运行所有测试
```bash
npx playwright test
```

### 运行特定测试文件
```bash
npx playwright test tests/homepage.spec.ts
```

### 运行测试并查看 UI
```bash
npx playwright test --ui
```

### 查看测试报告
```bash
npx playwright show-report
```

## 已知问题和修复

### 已修复的问题

1. **选择器问题**
   - 问题：使用 placeholder 选择器不够稳定
   - 修复：改用更通用的选择器（如 `input[type="email"]`）

2. **超时问题**
   - 问题：页面加载超时
   - 修复：增加 `waitForLoadState('networkidle')` 和超时时间

3. **异步操作**
   - 问题：密码加密是异步的，需要等待
   - 修复：添加适当的等待时间

### 待修复的问题

1. **注册后跳转**
   - 某些情况下注册成功后跳转可能较慢
   - 建议：增加等待时间或检查 toast 消息

2. **富文本编辑器**
   - 富文本编辑器加载需要时间
   - 建议：在相关测试中添加更长的等待时间

## 测试最佳实践

1. **使用稳定的选择器**
   - 优先使用 `data-testid` 属性
   - 避免使用文本内容选择器（除非必要）

2. **等待策略**
   - 使用 `waitForLoadState('networkidle')` 等待页面加载
   - 使用 `waitForURL()` 等待导航完成
   - 避免硬编码的 `waitForTimeout`

3. **错误处理**
   - 添加适当的超时时间
   - 使用截图功能调试失败

4. **测试隔离**
   - 每个测试前清除 localStorage
   - 使用唯一的测试数据（如时间戳）

## 持续集成

测试可以在 CI/CD 环境中运行：

```bash
# CI 模式运行测试
CI=true npx playwright test
```

