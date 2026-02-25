# 实施计划：多区域版本管理

## 概述

基于设计文档，将多区域版本管理功能拆分为增量式编码任务。从核心区域配置模块开始，逐步扩展到 i18n 集成、支付适配、环境模板、部署配置和 UI 适配。所有代码使用 TypeScript。

## 任务

- [x] 1. 实现区域配置核心模块
  - [x] 1.1 创建 `src/lib/region.ts` 区域配置模块
    - 定义 `Region` 类型（`'cn' | 'global'` 联合类型）
    - 实现 `getRegion()` 函数，读取 `NEXT_PUBLIC_REGION` 环境变量
    - 实现无效值/未设置时默认回退到 `'cn'`，开发模式下输出 console.warn
    - 实现 `isCN()` 和 `isGlobal()` 辅助函数
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1_

  - [x] 1.2 创建 `src/hooks/useRegion.ts` React Hook
    - 导入 `getRegion` 和 `Region` 类型
    - 添加 `'use client'` 指令
    - 使用 `useMemo` 缓存区域值
    - _需求: 8.1, 8.2_

  - [ ]* 1.3 编写区域解析一致性属性测试
    - **Property 1: 区域解析一致性**
    - 在 `tests/unit/region.property.test.ts` 中使用 `fast-check`
    - 验证有效区域标识下 `getRegion()`、`isCN()`、`isGlobal()` 的一致性和互斥性
    - **验证需求: 1.1, 1.3, 1.4**

  - [ ]* 1.4 编写无效区域回退属性测试
    - **Property 2: 无效区域回退**
    - 验证任意非法字符串（含 undefined、空字符串）均回退到 `'cn'`
    - **验证需求: 1.2, 9.1**

- [x] 2. 集成 i18n 语言锁定
  - [x] 2.1 修改 `src/lib/i18n.ts` 根据区域锁定语言
    - 导入 `getRegion`
    - 定义 `regionLangMap`（cn→zh, global→en）
    - 将 `lng` 和 `fallbackLng` 改为由区域决定
    - 设置 `detection.order` 和 `detection.caches` 为空数组，禁止语言自动检测和缓存
    - _需求: 3.1, 3.2, 3.4, 3.5_

  - [ ]* 2.2 编写 i18n 语言锁定单元测试
    - 验证 CN 区域初始化后语言为 `zh`
    - 验证 Global 区域初始化后语言为 `en`
    - _需求: 3.1, 3.2, 3.5_

- [x] 3. 检查点 - 确保核心模块正确
  - 确保所有测试通过，如有疑问请询问用户。

- [x] 4. 扩展支付配置验证
  - [x] 4.1 修改 `src/lib/payment-config.ts` 增加 Stripe/PayPal 配置检查
    - 新增 `STRIPE_REQUIRED_VARS` 和 `PAYPAL_REQUIRED_VARS` 常量
    - 扩展 `PaymentConfigStatus` 接口，增加 `stripeEnabled` 和 `paypalEnabled` 字段
    - 在 `validatePaymentConfig` 中增加 Stripe/PayPal 环境变量检查逻辑
    - 更新 `logPaymentConfigStatus` 输出 Stripe/PayPal 状态
    - _需求: 4.6_

  - [ ]* 4.2 编写支付配置验证完整性属性测试
    - **Property 4: 支付配置验证完整性**
    - 在 `tests/unit/region.property.test.ts` 中验证 `stripeEnabled`/`paypalEnabled` 与环境变量的对应关系
    - **验证需求: 4.6**

- [x] 5. 实现统一支付接口
  - [x] 5.1 创建 `src/lib/payment-unified.ts` 统一支付模块
    - 定义 `PaymentProvider`、`CreateOrderParams`、`CreateOrderResult` 类型
    - 实现 `getAvailableProviders()` 根据区域返回支付方式列表
    - 实现 `createOrder()` 统一接口，CN 区域调用现有 Alipay/WeChat，Global 区域使用 mock 或抛出错误
    - 实现 `verifyPayment()` 统一验证接口
    - _需求: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 5.2 编写区域-支付方式映射属性测试
    - **Property 3: 区域-支付方式映射正确性**
    - 验证 CN 区域仅返回 alipay/wechat，Global 区域仅返回 stripe/paypal，两者无交集
    - **验证需求: 4.1, 4.2, 4.3, 10.4**

  - [ ]* 5.3 编写统一支付接口单元测试
    - 测试 Global 区域 mock 模式返回 mock URL
    - 测试调用当前区域不支持的支付方式时抛出错误
    - _需求: 4.4, 4.5_

- [x] 6. 创建环境变量模板和部署配置
  - [x] 6.1 创建 `.env.cn.example` 国内版环境变量模板
    - 包含 `NEXT_PUBLIC_REGION=cn`、Supabase 连接信息占位、支付宝/微信支付配置项
    - 添加中文注释说明每个变量用途
    - _需求: 5.1, 5.3, 5.5_

  - [x] 6.2 创建 `.env.global.example` 海外版环境变量模板
    - 包含 `NEXT_PUBLIC_REGION=global`、Supabase 连接信息占位、Stripe/PayPal 配置项
    - 添加英文注释说明每个变量用途
    - _需求: 5.2, 5.4, 5.5_

  - [x] 6.3 创建 `vercel.json` Vercel 部署配置
    - 配置 Next.js 框架、构建命令、输出目录
    - _需求: 6.2, 6.3, 6.4_

  - [ ]* 6.4 编写环境模板和部署配置单元测试
    - 验证 `.env.cn.example` 存在且包含必要变量
    - 验证 `.env.global.example` 存在且包含必要变量
    - 验证 `vercel.json` 存在
    - _需求: 5.1, 5.2, 6.3_

- [x] 7. 检查点 - 确保支付和配置模块正确
  - 确保所有测试通过，如有疑问请询问用户。

- [x] 8. 充值页面区域适配
  - [x] 8.1 修改充值页面使用统一支付接口
    - 导入 `getAvailableProviders` 和 `useRegion`
    - 根据区域动态展示可用支付方式按钮
    - 调用 `createOrder()` 替代直接调用支付宝接口
    - _需求: 4.4, 8.2, 8.4_

  - [x] 8.2 确保品牌名称通过 i18n 管理
    - 在 i18n 资源中添加品牌名称翻译键（如 `appName`）
    - 国内版显示"泱泱云合AI制片厂"，海外版显示"YangYang Cloud AI Studio"
    - 使用 `t('appName')` 替代硬编码品牌名称
    - _需求: 8.3, 8.4_

- [x] 9. 开发环境区域切换支持
  - [x] 9.1 添加开发模式区域日志输出
    - 在应用启动时（如 `region.ts` 模块加载时）在开发模式下输出当前区域标识到控制台
    - _需求: 7.3_

  - [ ]* 9.2 编写开发模式日志单元测试
    - 验证开发模式下无效区域值触发 console.warn
    - _需求: 7.3_

- [x] 10. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有疑问请询问用户。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号，确保可追溯性
- 属性测试使用 `fast-check` 库验证通用正确性属性
- 单元测试验证具体示例和边缘情况
- Supabase 客户端代码（`supabase.ts`、`supabase-server.ts`）无需修改，通过环境变量自然切换（需求 2.3）
- 数据库表结构不变（需求 9.3），API 接口签名不变（需求 9.2）
