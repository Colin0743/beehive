# 实现计划：支付系统上线（Payment Go-Live）

## 概述

将蜂巢平台支付系统从模拟模式切换到真实支付。核心工作包括：配置验证模块、充值确认原子性改造、数据库 Schema 优化、回调路由加固、遗留依赖清理和测试覆盖。

## 任务

- [x] 1. 支付配置验证模块和环境变量规范化
  - [x] 1.1 创建 `src/lib/payment-config.ts` 配置验证模块
    - 实现 `validatePaymentConfig()` 函数，检查支付宝和微信支付所需的全部环境变量
    - 实现 `logPaymentConfigStatus()` 函数，在应用启动时输出配置状态日志
    - 整合 `isAlipayEnabled()` 和 `isWxPayEnabled()` 的逻辑，返回 `PaymentConfigStatus` 对象
    - 缺失变量时输出明确的 WARN 日志，包含缺失变量名称
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ]* 1.2 编写配置检查完整性的属性测试
    - **Property 1: 配置检查完整性**
    - 使用 fast-check 生成随机环境变量组合，验证 validatePaymentConfig 输出正确
    - **Validates: Requirements 1.1, 1.2, 1.5**

  - [ ]* 1.3 编写支付模式选择正确性的属性测试
    - **Property 2: 支付模式选择正确性**
    - 使用 fast-check 生成随机 USE_MOCK_PAYMENT 和密钥配置组合，验证模式选择逻辑
    - **Validates: Requirements 1.3, 5.1, 5.2, 5.3, 5.4**

  - [x] 1.4 创建 `beehive-platform/.env.example` 文件
    - 列出所有支付相关环境变量及中文说明
    - _Requirements: 1.4_

- [x] 2. 数据库 Schema 优化和原子充值确认
  - [x] 2.1 创建数据库迁移脚本 `supabase/migrations/008_payment_go_live.sql`
    - 将 `pingpp_charge_id` 列重命名为 `external_trade_no`
    - 收紧 `payment_channel` 约束，仅保留 `mock`、`alipay_pc`、`alipay_wap`、`wx_native`
    - 创建 `confirm_recharge_order` PostgreSQL 函数，在单个事务中完成订单确认、流水插入和余额更新
    - _Requirements: 8.1, 8.3, 8.4, 4.1_

  - [x] 2.2 重构 `src/lib/rechargeConfirm.ts` 使用 RPC 调用
    - 将三步分离操作改为调用 `confirm_recharge_order` RPC 函数
    - 保持接口不变（`confirmRechargeOrder` 函数签名不变）
    - 更新所有 `pingpp_charge_id` 引用为 `external_trade_no`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.2_

  - [ ]* 2.3 编写充值确认原子性与余额精确性的属性测试
    - **Property 7: 充值确认原子性与余额精确性**
    - 使用 fast-check 生成随机金额的订单，验证确认后数据一致性
    - **Validates: Requirements 4.1, 4.4**

- [x] 3. 检查点 - 确保数据库迁移和核心逻辑正确
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 4. 支付宝回调路由加固
  - [x] 4.1 加固 `src/app/api/recharge/callback/alipay/route.ts`
    - 增加结构化日志：订单号、金额、渠道、处理结果、时间戳
    - 确保错误响应不暴露内部细节（堆栈、文件路径等）
    - 更新 `pingpp_charge_id` 引用为 `external_trade_no`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.2, 7.3_

  - [ ]* 4.2 编写支付宝回调的单元测试
    - 覆盖：签名验证成功/失败、金额匹配/不匹配、重复回调、各种 trade_status
    - _Requirements: 9.1_

  - [ ]* 4.3 编写回调金额校验的属性测试
    - **Property 5: 回调金额校验**
    - 使用 fast-check 生成随机订单金额和通知金额对，验证不匹配时拒绝
    - **Validates: Requirements 2.3, 3.3**

- [x] 5. 微信支付回调路由加固
  - [x] 5.1 加固 `src/app/api/recharge/callback/wechat/route.ts`
    - 增加结构化日志：订单号、金额、渠道、处理结果、时间戳
    - 确保错误响应不暴露内部细节
    - 更新 `pingpp_charge_id` 引用为 `external_trade_no`
    - 加强微信平台证书签名验证（当前代码标注为"简化"）
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.2, 7.3_

  - [ ]* 5.2 编写微信回调的单元测试
    - 覆盖：解密成功/失败、金额匹配/不匹配、重复回调、空 body
    - _Requirements: 9.2_

  - [ ]* 5.3 编写回调幂等性的属性测试
    - **Property 6: 回调幂等性**
    - 使用 fast-check 生成随机订单，模拟多次回调，验证余额只增加一次
    - **Validates: Requirements 2.5, 3.5**

- [x] 6. 检查点 - 确保回调路由加固完成
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 7. 充值创建 API 更新和模拟模式优化
  - [x] 7.1 更新 `src/app/api/recharge/create/route.ts`
    - 引入 `payment-config.ts` 的配置检查
    - 确保回调 URL 使用 `NEXT_PUBLIC_APP_URL` 构建（保证 HTTPS）
    - 在响应中明确标识 `payment_channel` 为真实渠道或 mock
    - 当密钥未配置回退到 mock 时记录 WARN 日志
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1_

  - [ ]* 7.2 编写回调 URL 协议安全的属性测试
    - **Property 8: 回调 URL 协议安全**
    - 使用 fast-check 生成随机 HTTPS URL，验证回调 URL 协议
    - **Validates: Requirements 7.1**

  - [ ]* 7.3 编写错误响应不泄露内部信息的属性测试
    - **Property 9: 错误响应不泄露内部信息**
    - 使用 fast-check 生成随机异常类型，验证响应不含内部信息
    - **Validates: Requirements 7.3**

- [x] 8. 遗留依赖清理
  - [x] 8.1 从 `蜂巢/package.json` 中移除 `pingpp` 和 `pingpp-verifier` 依赖
    - 搜索确认无代码引用 pingpp 模块
    - _Requirements: 6.1, 6.2_

- [x] 9. 环境变量检测逻辑测试
  - [ ]* 9.1 编写 isAlipayEnabled 和 isWxPayEnabled 的单元测试
    - 验证各种环境变量配置组合下的返回值
    - _Requirements: 9.4_

- [x] 10. 最终检查点 - 全面验证
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号以便追溯
- 检查点确保增量验证
- 属性测试使用 `fast-check` 库，每个属性至少 100 次迭代
- 数据库迁移需要在 Supabase Dashboard 或 CLI 中执行
- 生产环境密钥配置需要运维人员手动完成（非代码任务，不在此计划中）
