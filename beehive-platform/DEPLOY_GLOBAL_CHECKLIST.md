# 海外版部署准备清单

## 概述
将蜂巢平台（beehive-platform）部署到海外，使用 Vercel + 独立 Supabase 实例。
国内版和海外版共用同一套代码，通过环境变量 `NEXT_PUBLIC_REGION` 区分。

---

## 任务清单

### 1. Supabase 海外实例搭建
- [ ] 1.1 在 [supabase.com](https://supabase.com) 创建新项目（选择海外区域，如 US East / EU West）
- [ ] 1.2 运行数据库迁移脚本（将 `supabase/migrations/` 下所有 SQL 按顺序执行）
- [ ] 1.3 记录以下信息：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 1.4 验证 RLS 策略生效（测试公开读取和权限控制）

### 2. Stripe 支付接入
- [ ] 2.1 注册 Stripe 账号（[stripe.com](https://stripe.com)）
- [ ] 2.2 获取测试模式 API 密钥：
  - `STRIPE_SECRET_KEY`（sk_test_xxx）
  - `STRIPE_PUBLISHABLE_KEY`（pk_test_xxx）
- [ ] 2.3 实现 Stripe Checkout 后端 API（替换当前 mock 模式）
- [ ] 2.4 测试 Stripe 支付流程（创建订单 → 跳转支付 → 回调确认）
- [ ] 2.5 切换到生产模式密钥

### 3. PayPal 支付接入（可选）
- [ ] 3.1 注册 PayPal Developer 账号
- [ ] 3.2 获取 Sandbox 凭证：
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
- [ ] 3.3 实现 PayPal 后端 API
- [ ] 3.4 测试 PayPal 支付流程

### 4. GitHub 仓库准备
- [ ] 4.1 创建 GitHub 仓库（如 `beehiveai/beehive-platform`）
- [ ] 4.2 推送代码到 GitHub
  ```bash
  git init
  git remote add origin https://github.com/beehiveai/beehive-platform.git
  git add .
  git commit -m "v1.2.4 with multi-region support"
  git push -u origin main
  ```
- [ ] 4.3 确保 `.env.local` 在 `.gitignore` 中（不要提交密钥）

### 5. Vercel 部署
- [ ] 5.1 在 [vercel.com](https://vercel.com) 导入 GitHub 仓库
- [ ] 5.2 配置环境变量（参考 `.env.global.example`）：
  ```
  NEXT_PUBLIC_REGION=global
  NEXT_PUBLIC_SUPABASE_URL=<海外Supabase地址>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<海外Supabase密钥>
  SUPABASE_SERVICE_ROLE_KEY=<海外Service Role Key>
  STRIPE_SECRET_KEY=<Stripe密钥>
  STRIPE_PUBLISHABLE_KEY=<Stripe公钥>
  USE_MOCK_PAYMENT=true  # 初期可先用 mock 模式
  ```
- [ ] 5.3 触发首次部署，验证构建成功
- [ ] 5.4 绑定自定义域名（如 beehiveai.com）
- [ ] 5.5 配置 SSL 证书（Vercel 自动处理）

### 6. 部署验证
- [ ] 6.1 访问海外版首页，确认显示英文界面
- [ ] 6.2 测试用户注册/登录流程
- [ ] 6.3 测试项目创建和浏览
- [ ] 6.4 测试充值页面显示 Stripe/PayPal 选项
- [ ] 6.5 测试 mock 支付流程（如果 USE_MOCK_PAYMENT=true）

### 7. 版本号管理
- [ ] 7.1 更新 `package.json` 中的 version 为 `1.2.4`
- [ ] 7.2 建立版本发布流程（Git tag + CHANGELOG）

---

## 架构说明

```
同一套代码
├── 国内版 (yangyangyunhe.cloud)
│   ├── NEXT_PUBLIC_REGION=cn
│   ├── 语言: 中文
│   ├── 支付: 支付宝 / 微信支付
│   └── 数据库: 国内 Supabase 实例
│
└── 海外版 (beehiveai.com / Vercel)
    ├── NEXT_PUBLIC_REGION=global
    ├── 语言: English
    ├── 支付: Stripe / PayPal
    └── 数据库: 海外 Supabase 实例
```

两个版本功能完全一致，仅支付方式和语言不同。
数据库完全独立，用户和项目数据不互通。
