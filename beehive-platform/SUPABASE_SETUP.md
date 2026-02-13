# Supabase 后端部署指南

## 第一步：创建 Supabase 项目

1. 打开 [https://supabase.com](https://supabase.com)，注册/登录账号
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `beehive-platform`（或你喜欢的名字）
   - Database Password: 设置一个强密码（记下来，后面可能用到）
   - Region: 选择离你最近的区域（推荐 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`）
4. 点击 "Create new project"，等待 1-2 分钟项目初始化完成

## 第二步：获取 API 密钥

项目创建完成后：

1. 在左侧菜单点击 ⚙️ **Settings**
2. 点击 **API**（在 Configuration 下面）
3. 你会看到以下信息：
   - **Project URL** — 类似 `https://xxxxx.supabase.co`
   - **anon public** — 一长串 `eyJhbGci...` 开头的字符串
   - **service_role secret** — 另一串密钥（点击眼睛图标显示）

## 第三步：配置环境变量

在项目根目录 `beehive-platform/` 下创建 `.env.local` 文件：

```bash
# 在 beehive-platform 目录下执行
copy .env.local.example .env.local
```

然后用编辑器打开 `.env.local`，把第二步获取的值填进去：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...你的anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...你的service role key
```

> ⚠️ `.env.local` 已在 `.gitignore` 中，不会被提交到 Git。

## 第四步：执行数据库迁移脚本

需要按顺序执行 3 个 SQL 文件。

1. 在 Supabase Dashboard 左侧菜单点击 **SQL Editor**
2. 点击 "New query"

### 4.1 执行第一个脚本：创建数据表

把 `supabase/migrations/001_initial_schema.sql` 的全部内容复制粘贴到 SQL Editor 中，点击 **Run**。

这个脚本会创建 10 张表：
- profiles（用户信息）
- projects（项目）
- project_logs（项目日志）
- tasks（任务）
- task_acceptances（任务接受记录）
- notifications（通知）
- achievements（成就）
- project_follows（项目关注）
- project_participations（项目参与）
- click_events（点击事件）

执行成功后你会看到 "Success. No rows returned"。

### 4.2 执行第二个脚本：RLS 安全策略

新建一个 query，把 `supabase/migrations/002_rls_policies.sql` 的全部内容复制粘贴进去，点击 **Run**。

这个脚本会：
- 对所有表启用行级安全（RLS）
- 创建 `is_admin()` 函数
- 为每张表设置读写权限策略

### 4.3 执行第三个脚本：自动创建用户 Profile

新建一个 query，把 `supabase/migrations/003_auto_profile.sql` 的全部内容复制粘贴进去，点击 **Run**。

这个脚本会创建一个触发器：当新用户注册时，自动在 profiles 表中创建一条记录。

### 4.4 执行第四个脚本：Storage 存储桶（如有 004_storage_bucket.sql）

若存在 `supabase/migrations/004_storage_bucket.sql`，按需执行以创建文件存储桶。

### 4.5 执行第五个脚本：支付余额表（如有 005_payment_balance.sql）

若存在 `supabase/migrations/005_payment_balance.sql`，执行以启用任务发布支付功能：
- 创建 `user_balances`、`balance_transactions`、`recharge_orders` 表
- 发布任务需先充值余额（默认 1 元/任务，可通过环境变量 `TASK_PUBLISH_FEE_CENTS` 配置）

### 4.6 执行第六个脚本：支付扩展（如有 006_pingpp_charge.sql）

若存在 `supabase/migrations/006_pingpp_charge.sql`，执行以支持真实支付：
- 新增 `pingpp_charge_id` 列（存储支付宝 trade_no 等外部交易号）
- 扩展 `payment_channel` 支持 `alipay_pc`、`alipay_wap` 等

### 自建支付宝配置（可选）

直接对接支付宝开放平台，无需第三方聚合，在 `.env.local` 中配置：

```env
# 模拟支付模式（不配置支付宝时默认启用）
USE_MOCK_PAYMENT=true

# 支付宝开放平台配置（USE_MOCK_PAYMENT=false 时生效）
ALIPAY_APP_ID=你的应用ID
ALIPAY_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
ALIPAY_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
# 或使用文件路径：ALIPAY_PRIVATE_KEY_PATH、ALIPAY_PUBLIC_KEY_PATH

# 前端基础 URL（用于支付完成跳回）
NEXT_PUBLIC_APP_URL=https://你的域名
```

在[支付宝开放平台](https://open.alipay.com)创建应用、配置密钥、添加「电脑网站支付」「手机网站支付」功能后，异步通知地址填写：`https://你的域名/api/recharge/callback/alipay`。

### 自建微信支付配置（可选）

```env
WXPAY_APP_ID=公众号/应用AppID
WXPAY_MCHID=商户号
WXPAY_API_KEY=APIv3密钥（32位，用于回调解密）
WXPAY_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
# 或 WXPAY_PRIVATE_KEY_PATH=/path/to/apiclient_key.pem
```

在[微信支付商户平台](https://pay.weixin.qq.com)开通 Native 支付后，回调地址填写：`https://你的域名/api/recharge/callback/wechat`。

### 验证数据库

执行完成后，点击左侧 **Table Editor**，你应该能看到创建的表。

## 第五步：启用邮箱 OTP 登录

1. 在左侧菜单点击 **Authentication**
2. 点击 **Providers**（在 Configuration 下面）
3. 找到 **Email**，确保它是启用状态
4. 点击展开 Email 配置，确认以下设置：
   - ✅ Enable Email provider — 开启
   - ✅ Confirm email — 建议开启（生产环境）
   - 你可以根据需要调整 OTP 过期时间（默认 3600 秒 = 1 小时）

### 关于邮件发送

Supabase 免费版自带内置邮件服务，开发测试够用了。但有以下限制：
- 每小时最多发 4 封邮件
- 邮件可能进垃圾箱

如果需要更高的发送量或自定义邮件模板，可以在 **Authentication → SMTP Settings** 中配置自己的 SMTP 服务（比如 Resend、SendGrid 等）。

## 第六步：更新依赖并启动

```bash
# 在 beehive-platform 目录下执行
npm install
npm run dev
```

打开 http://localhost:3000，尝试用邮箱登录。

## 第七步：设置管理员账号

首次登录后，你的账号默认是普通用户（role = 'user'）。要设置管理员：

1. 先用邮箱 OTP 登录一次（这会自动创建你的 profile）
2. 打开 Supabase Dashboard → **Table Editor** → **profiles**
3. 找到你的记录，把 `role` 字段从 `user` 改为 `super_admin`
4. 刷新页面，你就有管理员权限了

## 常见问题

### Q: 登录时收不到验证码邮件？
- 检查垃圾邮件文件夹
- Supabase 免费版每小时限 4 封，等一会再试
- 确认 Authentication → Providers → Email 已启用

### Q: 页面报 "网络请求失败"？
- 检查 `.env.local` 中的 URL 和 Key 是否正确
- 确认 Supabase 项目状态是 Active（免费项目 7 天不活跃会暂停）

### Q: API 返回 401？
- Session 可能过期了，重新登录
- 检查 middleware.ts 是否正常工作

### Q: RLS 报权限错误？
- 确认 SQL 脚本按顺序执行（001 → 002 → 003）
- 在 SQL Editor 中运行 `SELECT is_admin();` 检查函数是否存在
