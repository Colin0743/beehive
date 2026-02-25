# 需求文档：多区域版本管理

## 简介

蜂巢AI视频协作平台需要同时运营国内版和海外版。两个版本功能完全一致，仅在支付方式和语言上有差异：国内版使用支付宝/微信支付、纯中文界面；海外版使用Stripe/PayPal、纯英文界面。两个版本使用同一套代码库，通过环境变量区分区域，各自连接独立的Supabase实例（独立数据库和用户体系）。

国内版部署在自有服务器（yangyangyunhe.cloud），海外版通过GitHub + Vercel部署（beehiveai域名）。

## 术语表

- **Region_Config**: 区域配置模块，通过环境变量 `NEXT_PUBLIC_REGION` 确定当前运行区域（`cn` 或 `global`）
- **CN_Version**: 国内版，区域标识为 `cn`，部署于 yangyangyunhe.cloud
- **Global_Version**: 海外版，区域标识为 `global`，部署于 beehiveai 域名（Vercel）
- **Payment_Provider**: 支付服务商，国内版为支付宝/微信支付，海外版为Stripe/PayPal
- **Supabase_Instance**: Supabase实例，每个区域使用独立的Supabase项目（独立数据库、Auth、Storage）
- **i18n_System**: 国际化系统，项目已有的 i18next 配置，包含 `enResources` 和 `zhResources`

## 需求

### 需求 1: 区域环境配置

**用户故事:** 作为开发者，我希望通过环境变量指定应用运行的区域，以便同一套代码在不同区域以正确的配置运行。

#### 验收标准

1. THE Region_Config SHALL 通过环境变量 `NEXT_PUBLIC_REGION` 确定当前区域，值为 `cn` 或 `global`
2. IF `NEXT_PUBLIC_REGION` 未设置或值无效，THEN THE Region_Config SHALL 默认使用 `cn` 并在控制台输出警告
3. THE Region_Config SHALL 提供 `getRegion()` 函数返回当前区域标识
4. THE Region_Config SHALL 提供 `isCN()` 和 `isGlobal()` 辅助函数供业务代码使用
5. THE Region_Config SHALL 使用 TypeScript 类型约束区域标识为 `'cn' | 'global'` 联合类型

### 需求 2: 独立Supabase实例

**用户故事:** 作为系统管理员，我希望国内版和海外版各自使用独立的Supabase实例，以便数据完全隔离、便于后续APP扩展。

#### 验收标准

1. THE CN_Version SHALL 连接国内版专用的 Supabase_Instance（通过 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 配置）
2. THE Global_Version SHALL 连接海外版专用的 Supabase_Instance（通过相同的环境变量名，但值指向不同的Supabase项目）
3. THE 现有 Supabase 客户端代码（`supabase.ts` 和 `supabase-server.ts`）SHALL 无需修改，通过环境变量自然切换到对应实例
4. THE 两个 Supabase_Instance SHALL 使用相同的数据库表结构（共享同一套 migration 脚本）
5. THE 两个 Supabase_Instance SHALL 拥有完全独立的用户体系和数据

### 需求 3: 语言固定配置

**用户故事:** 作为用户，我希望国内版始终显示中文、海外版始终显示英文，无需手动切换语言。

#### 验收标准

1. WHEN `NEXT_PUBLIC_REGION` 为 `cn` 时，THE i18n_System SHALL 固定使用 `zhResources` 中文资源
2. WHEN `NEXT_PUBLIC_REGION` 为 `global` 时，THE i18n_System SHALL 固定使用 `enResources` 英文资源
3. THE 应用 SHALL 不显示语言切换器
4. THE 现有 i18n_System（i18next + react-i18next）SHALL 被复用，仅需根据区域设置默认语言
5. WHEN 区域确定后，THE i18n_System SHALL 在初始化时锁定语言，运行期间不可切换

### 需求 4: 支付服务商区域适配

**用户故事:** 作为开发者，我希望根据区域自动选择对应的支付服务商，以便用户使用本地化的支付方式。

#### 验收标准

1. WHERE CN_Version，THE 应用 SHALL 使用支付宝和微信支付作为 Payment_Provider（复用现有 `payment.ts` 实现）
2. WHERE Global_Version，THE 应用 SHALL 使用 Stripe 和 PayPal 作为 Payment_Provider
3. THE 支付模块 SHALL 提供统一的支付接口（如 `createOrder`、`verifyPayment`），内部根据区域调用对应的 Payment_Provider
4. THE 充值页面 SHALL 根据区域仅展示当前区域可用的支付方式
5. WHEN 海外版 Stripe/PayPal 尚未实现时，THE Global_Version SHALL 使用模拟支付模式（`USE_MOCK_PAYMENT=true`）
6. THE 现有支付配置验证模块（`payment-config.ts`）SHALL 被扩展以支持 Stripe 和 PayPal 的环境变量检查

### 需求 5: 环境变量模板

**用户故事:** 作为运维工程师，我希望为每个区域提供清晰的环境变量模板，以便快速配置部署环境。

#### 验收标准

1. THE 项目 SHALL 提供 `.env.cn.example` 文件，包含国内版所需的全部环境变量
2. THE 项目 SHALL 提供 `.env.global.example` 文件，包含海外版所需的全部环境变量
3. THE `.env.cn.example` SHALL 包含 `NEXT_PUBLIC_REGION=cn`、国内版 Supabase 连接信息占位、支付宝/微信支付配置项
4. THE `.env.global.example` SHALL 包含 `NEXT_PUBLIC_REGION=global`、海外版 Supabase 连接信息占位、Stripe/PayPal 配置项
5. THE 两个模板文件 SHALL 包含注释说明每个变量的用途

### 需求 6: 部署策略

**用户故事:** 作为运维工程师，我希望国内版和海外版有各自清晰的部署流程，以便独立部署和运维。

#### 验收标准

1. THE CN_Version SHALL 支持部署到自有服务器（yangyangyunhe.cloud）
2. THE Global_Version SHALL 支持通过 GitHub + Vercel 部署（beehiveai 域名）
3. THE 项目 SHALL 提供 Vercel 部署配置文件（`vercel.json`），包含海外版所需的环境变量引用
4. THE 两个版本 SHALL 使用相同的构建命令（`npm run build`），仅通过环境变量区分行为
5. WHEN 代码推送到主分支时，THE Global_Version SHALL 可通过 Vercel 自动部署

### 需求 7: 开发环境区域切换

**用户故事:** 作为开发者，我希望在本地开发时能快速切换区域进行测试。

#### 验收标准

1. THE 开发环境 SHALL 支持通过修改 `.env.local` 中的 `NEXT_PUBLIC_REGION` 切换区域
2. WHEN 修改 `NEXT_PUBLIC_REGION` 后重启开发服务器，THE 应用 SHALL 加载对应区域的语言和支付配置
3. THE 应用 SHALL 在开发模式下在控制台输出当前区域标识
4. THE 项目 SHALL 在 README 或开发文档中说明区域切换步骤

### 需求 8: 区域感知的UI适配

**用户故事:** 作为前端开发者，我希望组件能感知当前区域，以便在少数需要区域差异的地方（如支付、品牌名称）做适配。

#### 验收标准

1. THE Region_Config SHALL 提供 `useRegion()` React Hook，返回当前区域标识
2. WHEN 组件需要根据区域展示不同内容时（如支付方式选择），THE 组件 SHALL 通过 `useRegion()` 获取区域信息
3. THE 品牌名称 SHALL 通过 i18n 翻译键管理（国内版"泱泱云合AI制片厂"，海外版"YangYang Cloud AI Studio"），无需额外区域判断
4. THE 应用 SHALL 避免在业务代码中出现大量区域判断的 if-else 语句，优先通过 i18n 和支付抽象层处理差异

### 需求 9: 向后兼容性

**用户故事:** 作为项目维护者，我希望多区域改造不破坏现有国内版功能，以便平滑过渡。

#### 验收标准

1. WHEN `NEXT_PUBLIC_REGION` 未设置时，THE 应用 SHALL 默认以国内版模式运行，所有现有功能正常
2. THE 多区域改造 SHALL 不修改现有 API 接口的签名
3. THE 多区域改造 SHALL 不改变现有数据库表结构
4. THE 现有支付宝/微信支付集成 SHALL 在国内版配置下保持正常运行
5. THE 现有 Playwright E2E 测试 SHALL 在国内版配置下全部通过

### 需求 10: 功能同步保障

**用户故事:** 作为产品经理，我希望两个版本的功能保持完全同步（支付除外），以便降低维护成本。

#### 验收标准

1. THE CN_Version 和 Global_Version SHALL 拥有完全相同的功能集（项目管理、任务系统、用户认证、充值、成就、反馈等），仅支付方式不同
2. WHEN 新功能开发完成时，THE 新功能 SHALL 同时在两个版本中可用
3. THE 项目 SHALL 不使用功能开关（Feature Flag）来区分两个版本的功能差异
4. THE 两个版本的差异 SHALL 仅限于：支付服务商、语言资源、Supabase 实例连接信息、部署目标
