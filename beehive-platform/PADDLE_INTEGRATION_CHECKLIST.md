# Paddle 支付集成准备清单

## ✅ 已完成的准备工作

### 1. 服务条款页面 (Terms of Service)
- **路径**: `/terms`
- **文件**: `src/app/terms/page.tsx`
- **状态**: ✅ 已创建并部署

**包含内容**：
- ✅ 服务描述
- ✅ 用户账户规则
- ✅ 用户行为规范
- ✅ 内容所有权
- ✅ **支付和退款政策**（Section 5）
  - 任务发布费用：$0.5 USD
  - 不支持退款（类似游戏点卡）
  - 服务故障例外：7天内可申请退款
- ✅ **支付处理商声明**（Section 6）
  - 明确说明 Paddle 作为 Merchant of Record
  - 包含 Paddle 的责任范围
- ✅ 免责声明
- ✅ 责任限制
- ✅ 条款修改权
- ✅ **联系信息**（Section 10）
  - 公司：YangYang Yunhe (Shenzhen) Technology Co., Ltd., China
  - 邮箱：Colincao0734@Outlook.com

### 2. 定价页面 (Pricing)
- **路径**: `/recharge`
- **文件**: `src/app/recharge/page.tsx`
- **状态**: ✅ 已创建并部署

**包含内容**：
- ✅ 明确的定价信息："Publishing tasks costs $0.5 per task"
- ✅ 充值金额选项（¥1, ¥5, ¥10, ¥50, ¥100）
- ✅ 当前余额显示
- ✅ 支付渠道选择

### 3. 产品介绍
- **路径**: `/` (首页)
- **状态**: ✅ 已完成

**包含内容**：
- ✅ 平台功能介绍
- ✅ 项目展示
- ✅ 用户角色说明（发起人、参与者、参与者）
- ✅ 工作流程说明

### 4. Footer 链接
- **文件**: `src/components/Footer.tsx`
- **状态**: ✅ 已完成

**包含内容**：
- ✅ 服务条款链接 (`/terms`)
- ✅ 隐私政策链接 (`/privacy`)
- ✅ 联系方式
- ✅ 快速导航

### 5. 部署状态
- **平台**: Vercel
- **域名**: https://beehive-gules.vercel.app
- **自动部署**: ✅ 已配置（GitHub push 触发）
- **最新代码**: ✅ 已推送到 GitHub

---

## 📋 Paddle 审核要求对照

| 要求项 | 状态 | 说明 |
|--------|------|------|
| 清晰的产品介绍 | ✅ | 首页包含完整的平台介绍和功能说明 |
| 定价页面 (Pricing) | ✅ | `/recharge` 页面明确显示 $0.5 per task |
| 服务条款 (Terms) | ✅ | `/terms` 页面包含完整的服务条款 |
| 支付处理商声明 | ✅ | 服务条款 Section 6 明确说明 Paddle 作为 MoR |
| 退款政策 | ✅ | 服务条款 Section 5 详细说明退款规则 |
| 联系信息 | ✅ | 服务条款 Section 10 包含公司和邮箱 |
| Footer 链接 | ✅ | Footer 包含服务条款和隐私政策链接 |

---

## 🚀 下一步：Paddle 集成

### 1. 注册 Paddle 账号
- 访问 https://paddle.com
- 注册商家账号
- 完成 KYC 验证

### 2. 配置 Paddle 产品
在 Paddle Dashboard 中创建产品：
- **产品名称**: Task Publishing Credit
- **定价**: $0.5 USD per task
- **类型**: One-time purchase (一次性购买)

### 3. 获取 Paddle 凭证
- Vendor ID
- API Key
- Public Key (用于验证 webhook)

### 4. 集成 Paddle SDK

#### 安装依赖
```bash
npm install @paddle/paddle-js
```

#### 环境变量配置
在 Vercel 中添加环境变量：
```bash
NEXT_PUBLIC_PADDLE_VENDOR_ID=你的VendorID
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox  # 测试环境，生产环境改为 production
PADDLE_API_KEY=你的APIKey
PADDLE_PUBLIC_KEY=你的PublicKey
```

#### 前端集成
修改 `src/app/recharge/page.tsx`：
```typescript
import { initializePaddle } from '@paddle/paddle-js';

// 初始化 Paddle
const paddle = await initializePaddle({
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
  token: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID,
});

// 打开支付弹窗
paddle.Checkout.open({
  items: [{ priceId: 'pri_xxx', quantity: 1 }],
  customer: { email: user.email },
  customData: { userId: user.id },
});
```

#### 后端 Webhook
创建 `src/app/api/paddle/webhook/route.ts`：
```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('paddle-signature');
  
  // 验证签名
  const isValid = verifyPaddleSignature(body, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  // 处理支付成功事件
  if (event.event_type === 'transaction.completed') {
    const { customer_id, custom_data } = event.data;
    // 更新用户余额
    await updateUserBalance(custom_data.userId, 50); // 增加 0.5 元
  }
  
  return NextResponse.json({ received: true });
}
```

### 5. 测试流程
1. 使用 Paddle Sandbox 环境测试
2. 测试支付流程
3. 测试 Webhook 接收
4. 验证余额更新

### 6. 上线前检查
- [ ] Paddle 账号审核通过
- [ ] 产品配置完成
- [ ] SDK 集成完成
- [ ] Webhook 测试通过
- [ ] 切换到生产环境
- [ ] 进行真实支付测试

---

## 📞 联系信息

**公司**: YangYang Yunhe (Shenzhen) Technology Co., Ltd., China  
**邮箱**: Colincao0734@Outlook.com  
**网站**: https://beehive-gules.vercel.app (临时域名)  
**最终域名**: beestudioai.com

---

## 📝 备注

1. **当前支付状态**: 使用 `USE_MOCK_PAYMENT=true` 模拟支付
2. **Paddle 集成后**: 将 `USE_MOCK_PAYMENT` 改为 `false`，启用真实支付
3. **定价策略**: 每次任务发布扣除 $0.5 USD（约 ¥3.5 CNY）
4. **退款政策**: 不支持退款（类似游戏点卡），但服务故障可在 7 天内申请退款

---

**最后更新**: 2025-02-26
