# 蜂巢平台部署文档

## 海外版部署信息

### 部署平台
- **托管**: Vercel
- **域名**: https://beehive-gules.vercel.app
- **GitHub 仓库**: https://github.com/Colin0743/beehive
- **分支**: main

### 自动部署配置

Vercel 已配置 GitHub 集成，实现自动部署：

1. **触发条件**: 推送代码到 `main` 分支
2. **构建命令**: `npm run build`
3. **输出目录**: `.next`
4. **Root Directory**: `beehive-platform`

### 部署流程

```bash
# 1. 本地开发
cd beehive-platform
npm run dev

# 2. 提交代码
git add .
git commit -m "your commit message"

# 3. 推送到 GitHub（自动触发 Vercel 部署）
git -c http.sslVerify=false push beehive main
```

### 环境变量配置

在 Vercel Dashboard 已配置以下环境变量：

| 变量名 | 说明 | 状态 |
|--------|------|------|
| `NEXT_PUBLIC_REGION` | 区域标识（global） | ✅ 已配置 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ 已配置 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ 已配置 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | ✅ 已配置 |
| `USE_MOCK_PAYMENT` | 使用 mock 支付模式 | ✅ 已配置 (true) |

### 数据库配置

- **Supabase 项目**: beehive-global
- **项目 ID**: wsadzkdjmgebmwgpmjzm
- **区域**: US East
- **数据库迁移**: 已完成（10 个迁移脚本）

### 验证清单

- [x] 代码推送到 GitHub
- [x] Vercel 自动部署成功
- [x] 网站可访问（https://beehive-gules.vercel.app）
- [x] Supabase 数据库迁移完成
- [x] 环境变量配置完整
- [ ] 测试用户注册/登录
- [ ] 测试项目创建
- [ ] 测试充值功能（mock 模式）

### 后续优化

1. **自定义域名**（可选）
   - 在 Vercel Dashboard → Settings → Domains 添加自定义域名
   - 配置 DNS 记录指向 Vercel

2. **Stripe 支付接入**
   - 注册 Stripe 账号
   - 获取 API 密钥
   - 在 Vercel 添加环境变量：
     - `STRIPE_SECRET_KEY`
     - `STRIPE_PUBLISHABLE_KEY`
   - 设置 `USE_MOCK_PAYMENT=false`

3. **PayPal 支付接入**（可选）
   - 注册 PayPal Developer 账号
   - 获取 Client ID 和 Secret
   - 在 Vercel 添加环境变量：
     - `PAYPAL_CLIENT_ID`
     - `PAYPAL_CLIENT_SECRET`

### 监控和日志

- **Vercel Dashboard**: https://vercel.com/dashboard
- **部署日志**: 在 Vercel Dashboard → Deployments 查看
- **运行时日志**: 在 Vercel Dashboard → Logs 查看

### 回滚部署

如果新部署出现问题，可以在 Vercel Dashboard 快速回滚：

1. 进入 Deployments 页面
2. 找到之前的稳定版本
3. 点击 "Promote to Production"

---

## 国内版部署信息

### 部署平台
- **托管**: 自建服务器（yangyangyunhe.cloud）
- **数据库**: 国内 Supabase 实例
- **支付**: 支付宝 + 微信支付

### 环境变量

```env
NEXT_PUBLIC_REGION=cn
NEXT_PUBLIC_SUPABASE_URL=<国内Supabase地址>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<国内Supabase密钥>
SUPABASE_SERVICE_ROLE_KEY=<国内Service Role Key>
USE_MOCK_PAYMENT=false
ALIPAY_APP_ID=<支付宝AppID>
ALIPAY_PRIVATE_KEY=<支付宝私钥>
WXPAY_APP_ID=<微信AppID>
WXPAY_MCHID=<微信商户号>
WXPAY_API_KEY=<微信API密钥>
WXPAY_PRIVATE_KEY=<微信私钥>
```

---

## 故障排查

### 构建失败

1. 检查 Vercel 构建日志
2. 本地运行 `npm run build` 验证
3. 检查 TypeScript 类型错误
4. 检查环境变量是否配置完整

### 数据库连接失败

1. 检查 Supabase 项目状态
2. 验证环境变量中的 URL 和密钥
3. 检查 RLS 策略是否正确

### 支付功能异常

1. 确认 `USE_MOCK_PAYMENT` 设置
2. 检查支付密钥配置
3. 查看服务端日志

---

**最后更新**: 2026-02-26
**版本**: v1.2.4
