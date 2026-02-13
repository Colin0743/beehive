# 需求文档：支付系统上线（Payment Go-Live）

## 简介

蜂巢AI视频协作平台当前支付系统已具备完整的代码架构（支付宝 PC/WAP、微信 Native 扫码），但运行在模拟（mock）模式下。本需求规划从模拟模式切换到真实支付上线的完整流程，涵盖环境变量配置、回调验证加固、安全防护、遗留依赖清理以及上线前检查。

## 术语表

- **支付系统（Payment_System）**：蜂巢平台中处理用户充值的完整模块，包括订单创建、支付渠道对接、回调处理和余额更新
- **回调路由（Callback_Route）**：接收支付宝/微信异步支付结果通知的 API 端点
- **充值确认（Recharge_Confirm）**：将 pending 订单标记为 paid 并增加用户余额的核心逻辑（`rechargeConfirm.ts`）
- **模拟模式（Mock_Mode）**：通过 `USE_MOCK_PAYMENT=true` 或缺少真实密钥时启用的测试支付流程
- **环境变量配置（Env_Config）**：`.env.local` 及生产环境中存储支付密钥和参数的配置
- **支付渠道（Payment_Channel）**：具体的支付方式，包括 `alipay_pc`、`alipay_wap`、`wx_native`
- **订单幂等性（Order_Idempotency）**：确保同一笔支付回调被多次调用时只处理一次的机制
- **pingpp 遗留依赖（Pingpp_Legacy）**：根目录 `package.json` 中的 `pingpp` 和 `pingpp-verifier` 包，实际代码已改为自建对接

## 需求

### 需求 1：支付环境变量配置

**用户故事：** 作为运维人员，我希望在生产环境中正确配置支付宝和微信支付的密钥和参数，以便系统能够调用真实支付 API。

#### 验收标准

1. WHEN 生产环境部署时，THE Env_Config SHALL 包含支付宝所需的全部环境变量：`ALIPAY_APP_ID`、`ALIPAY_PRIVATE_KEY`（或 `ALIPAY_PRIVATE_KEY_PATH`）、`ALIPAY_PUBLIC_KEY`（或 `ALIPAY_PUBLIC_KEY_PATH`）
2. WHEN 生产环境部署时，THE Env_Config SHALL 包含微信支付所需的全部环境变量：`WXPAY_APP_ID`、`WXPAY_MCHID`、`WXPAY_API_KEY`、`WXPAY_PRIVATE_KEY`（或 `WXPAY_PRIVATE_KEY_PATH`）
3. WHEN `USE_MOCK_PAYMENT` 环境变量未设置或设置为 `false` 且支付密钥已配置，THE Payment_System SHALL 使用真实支付渠道处理充值请求
4. THE Env_Config SHALL 提供一个 `.env.example` 文件，列出所有支付相关环境变量及其说明
5. IF 任一必需的支付环境变量缺失，THEN THE Payment_System SHALL 在启动时记录明确的错误日志，指明缺失的变量名称

### 需求 2：支付宝回调验证加固

**用户故事：** 作为开发者，我希望支付宝回调接口具备完整的安全验证，以防止伪造的支付通知导致资金损失。

#### 验收标准

1. WHEN 支付宝发送异步通知到 `/api/recharge/callback/alipay`，THE Callback_Route SHALL 使用支付宝公钥验证通知签名
2. WHEN 签名验证失败，THE Callback_Route SHALL 返回 `fail` 响应并记录告警日志
3. WHEN 通知中的 `total_amount` 与订单记录的 `amount_cents` 不匹配，THE Callback_Route SHALL 拒绝该通知并记录金额不一致的详细信息
4. WHEN 收到 `trade_status` 为 `TRADE_SUCCESS` 或 `TRADE_FINISHED` 的通知，THE Callback_Route SHALL 调用 Recharge_Confirm 完成订单确认
5. WHEN 同一笔订单的回调被重复调用，THE Callback_Route SHALL 保证 Order_Idempotency，对已支付订单直接返回 `success`

### 需求 3：微信支付回调验证加固

**用户故事：** 作为开发者，我希望微信支付回调接口具备完整的签名验证和数据解密，以确保回调数据的真实性和完整性。

#### 验收标准

1. WHEN 微信支付发送异步通知到 `/api/recharge/callback/wechat`，THE Callback_Route SHALL 使用微信平台证书验证请求签名
2. WHEN 签名验证失败，THE Callback_Route SHALL 返回 `{"code":"FAIL","message":"Invalid signature"}` 并记录告警日志
3. WHEN 通知中的 `amount.total` 与订单记录的 `amount_cents` 不匹配，THE Callback_Route SHALL 拒绝该通知并记录金额不一致的详细信息
4. WHEN 收到 `event_type` 为 `TRANSACTION.SUCCESS` 的通知，THE Callback_Route SHALL 使用 AES-256-GCM 解密 resource 数据并调用 Recharge_Confirm
5. WHEN 同一笔订单的回调被重复调用，THE Callback_Route SHALL 保证 Order_Idempotency，对已支付订单直接返回 `{"code":"SUCCESS"}`
6. THE Payment_System SHALL 实现微信平台证书的自动下载和缓存机制，用于验证回调签名

### 需求 4：充值确认逻辑的原子性和安全性

**用户故事：** 作为开发者，我希望充值确认流程具备事务原子性，以防止并发回调导致余额重复增加。

#### 验收标准

1. WHEN Recharge_Confirm 处理一笔订单时，THE Recharge_Confirm SHALL 在单个数据库事务中完成订单状态更新、流水插入和余额增加
2. WHEN 两个并发回调同时处理同一笔订单，THE Recharge_Confirm SHALL 确保只有一个回调成功更新订单状态，另一个因乐观锁（`eq('status', 'pending')`）失败
3. IF 事务中任一步骤失败，THEN THE Recharge_Confirm SHALL 回滚所有已执行的步骤，保持数据一致性
4. WHEN 充值成功后，THE Recharge_Confirm SHALL 确保 `user_balances.balance_cents` 的增加量精确等于 `recharge_orders.amount_cents`

### 需求 5：模拟模式的优雅降级

**用户故事：** 作为开发者，我希望系统在开发和测试环境中能够优雅地使用模拟支付，而在生产环境中使用真实支付。

#### 验收标准

1. WHEN `USE_MOCK_PAYMENT` 设置为 `true`，THE Payment_System SHALL 对所有充值请求使用模拟支付流程，返回 `mock_pay_url`
2. WHEN `USE_MOCK_PAYMENT` 未设置且支付密钥未配置，THE Payment_System SHALL 回退到模拟支付模式并在日志中记录警告
3. WHEN `USE_MOCK_PAYMENT` 设置为 `false` 且支付密钥已配置，THE Payment_System SHALL 使用真实支付渠道
4. THE Payment_System SHALL 在 API 响应中通过 `payment_channel` 字段明确标识当前使用的是真实渠道还是 `mock` 渠道

### 需求 6：遗留 pingpp 依赖清理

**用户故事：** 作为开发者，我希望清理不再使用的 pingpp 依赖，以减少安全风险和包体积。

#### 验收标准

1. THE Payment_System SHALL 从根目录 `蜂巢/package.json` 中移除 `pingpp` 和 `pingpp-verifier` 依赖
2. WHEN pingpp 依赖被移除后，THE Payment_System SHALL 确保所有现有支付功能正常运行，无任何代码引用 pingpp 模块
3. THE Payment_System SHALL 将数据库中 `pingpp_charge_id` 列重命名为 `external_trade_no`，更准确地反映其用途（存储支付宝 trade_no 或微信 transaction_id）

### 需求 7：生产环境安全加固

**用户故事：** 作为运维人员，我希望支付系统在生产环境中具备足够的安全防护，以保护用户资金安全。

#### 验收标准

1. THE Payment_System SHALL 确保所有支付回调 URL 使用 HTTPS 协议（`https://www.yangyangyunhe.cloud/api/recharge/callback/...`）
2. THE Callback_Route SHALL 对每个回调请求记录结构化日志，包含订单号、金额、渠道、处理结果和时间戳
3. WHEN 回调处理发生异常，THE Callback_Route SHALL 记录完整的错误堆栈信息，但响应中不暴露内部错误细节
4. THE Payment_System SHALL 对支付密钥使用环境变量存储，禁止在代码仓库中硬编码任何密钥
5. THE Payment_System SHALL 在回调路由中实现基本的速率限制，防止恶意请求轰炸

### 需求 8：数据库 Schema 优化

**用户故事：** 作为开发者，我希望数据库 Schema 准确反映自建支付对接的实际情况，消除 pingpp 时代的遗留命名。

#### 验收标准

1. THE Payment_System SHALL 创建数据库迁移脚本，将 `recharge_orders.pingpp_charge_id` 列重命名为 `external_trade_no`
2. THE Payment_System SHALL 更新所有引用 `pingpp_charge_id` 的代码，改为使用 `external_trade_no`
3. WHEN 迁移执行后，THE Payment_System SHALL 保留原有数据不丢失
4. THE Payment_System SHALL 在 `recharge_orders` 表的 `payment_channel` 约束中移除不再使用的渠道值（如 `wx_pub`、`wx_pub_qr`），仅保留 `mock`、`alipay_pc`、`alipay_wap`、`wx_native`

### 需求 9：端到端支付流程验证

**用户故事：** 作为开发者，我希望有自动化测试验证完整的支付流程，以确保上线后支付功能正确运行。

#### 验收标准

1. THE Payment_System SHALL 提供支付宝回调处理的单元测试，覆盖签名验证成功、签名验证失败、金额不匹配、重复回调等场景
2. THE Payment_System SHALL 提供微信支付回调处理的单元测试，覆盖解密成功、解密失败、金额不匹配、重复回调等场景
3. THE Payment_System SHALL 提供充值确认逻辑的单元测试，覆盖正常确认、并发确认、订单状态异常等场景
4. THE Payment_System SHALL 提供环境变量检测逻辑的单元测试，验证 `isAlipayEnabled()` 和 `isWxPayEnabled()` 在各种配置组合下的返回值
