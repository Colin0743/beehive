/**
 * 支付配置验证模块
 * 统一检查支付宝和微信支付的环境变量配置状态，
 * 在应用启动时输出配置状态日志，缺失变量时给出明确警告。
 *
 * Requirements: 1.1, 1.2, 1.5
 */

/** 支付宝必需的环境变量 */
const ALIPAY_REQUIRED_VARS = [
  'ALIPAY_APP_ID',
  // 私钥：ALIPAY_PRIVATE_KEY 或 ALIPAY_PRIVATE_KEY_PATH 二选一
] as const;

/** 支付宝私钥变量组（二选一） */
const ALIPAY_PRIVATE_KEY_VARS = ['ALIPAY_PRIVATE_KEY', 'ALIPAY_PRIVATE_KEY_PATH'] as const;

/** 微信支付必需的环境变量 */
const WXPAY_REQUIRED_VARS = [
  'WXPAY_APP_ID',
  'WXPAY_MCHID',
  'WXPAY_API_KEY',
  // 私钥：WXPAY_PRIVATE_KEY 或 WXPAY_PRIVATE_KEY_PATH 二选一
] as const;

/** 微信支付私钥变量组（二选一） */
const WXPAY_PRIVATE_KEY_VARS = ['WXPAY_PRIVATE_KEY', 'WXPAY_PRIVATE_KEY_PATH'] as const;

/** Stripe 必需的环境变量 */
const STRIPE_REQUIRED_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
] as const;

/** PayPal 必需的环境变量 */
const PAYPAL_REQUIRED_VARS = [
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
] as const;

/** 支付配置状态 */
export interface PaymentConfigStatus {
  /** 支付宝是否可用 */
  alipayEnabled: boolean;
  /** 微信支付是否可用 */
  wxPayEnabled: boolean;
  /** Stripe 是否可用 */
  stripeEnabled: boolean;
  /** PayPal 是否可用 */
  paypalEnabled: boolean;
  /** 是否处于模拟支付模式 */
  mockMode: boolean;
  /** 缺失的环境变量名称列表 */
  missingVars: string[];
}

/**
 * 检查一组必需变量是否存在，返回缺失的变量名
 */
function checkRequiredVars(vars: readonly string[]): string[] {
  return vars.filter((v) => !process.env[v]);
}

/**
 * 检查二选一变量组，如果两个都缺失则返回描述字符串
 */
function checkEitherVar(vars: readonly string[]): string | null {
  const hasAny = vars.some((v) => !!process.env[v]);
  if (!hasAny) {
    return vars.join(' 或 ');
  }
  return null;
}

/**
 * 验证支付配置，返回完整的配置状态
 * 整合 isAlipayEnabled 和 isWxPayEnabled 的逻辑
 */
export function validatePaymentConfig(): PaymentConfigStatus {
  const missingVars: string[] = [];

  // 检查支付宝配置
  const alipayMissing = checkRequiredVars(ALIPAY_REQUIRED_VARS);
  missingVars.push(...alipayMissing);

  const alipayKeyMissing = checkEitherVar(ALIPAY_PRIVATE_KEY_VARS);
  if (alipayKeyMissing) {
    missingVars.push(alipayKeyMissing);
  }

  const alipayEnabled = alipayMissing.length === 0 && alipayKeyMissing === null;

  // 检查微信支付配置
  const wxMissing = checkRequiredVars(WXPAY_REQUIRED_VARS);
  missingVars.push(...wxMissing);

  const wxKeyMissing = checkEitherVar(WXPAY_PRIVATE_KEY_VARS);
  if (wxKeyMissing) {
    missingVars.push(wxKeyMissing);
  }

  const wxPayEnabled = wxMissing.length === 0 && wxKeyMissing === null;

  // 检查 Stripe 配置
  const stripeMissing = checkRequiredVars(STRIPE_REQUIRED_VARS);
  missingVars.push(...stripeMissing);
  const stripeEnabled = stripeMissing.length === 0;

  // 检查 PayPal 配置
  const paypalMissing = checkRequiredVars(PAYPAL_REQUIRED_VARS);
  missingVars.push(...paypalMissing);
  const paypalEnabled = paypalMissing.length === 0;

  // 判断模拟模式：显式设置 USE_MOCK_PAYMENT=true，或者所有渠道都不可用
  const useMockEnv = process.env.USE_MOCK_PAYMENT;
  const mockMode = useMockEnv === 'true' || (!alipayEnabled && !wxPayEnabled && !stripeEnabled && !paypalEnabled);

  return {
    alipayEnabled,
    wxPayEnabled,
    stripeEnabled,
    paypalEnabled,
    mockMode,
    missingVars,
  };
}

/**
 * 在应用启动时调用，输出支付配置状态日志
 * 缺失变量时输出 WARN 级别日志，包含缺失变量名称
 */
export function logPaymentConfigStatus(): void {
  const status = validatePaymentConfig();

  // 输出各渠道启用状态
  console.log(
    `[Payment Config] 支付宝: ${status.alipayEnabled ? '已启用' : '未启用'} | 微信支付: ${status.wxPayEnabled ? '已启用' : '未启用'} | Stripe: ${status.stripeEnabled ? '已启用' : '未启用'} | PayPal: ${status.paypalEnabled ? '已启用' : '未启用'} | 模拟模式: ${status.mockMode ? '是' : '否'}`
  );

  // 缺失变量时输出明确的 WARN 日志
  if (status.missingVars.length > 0) {
    console.warn(
      `[Payment Config] WARN: 以下支付环境变量缺失: ${status.missingVars.join(', ')}`
    );
  }

  // 模拟模式额外提示
  if (status.mockMode && process.env.USE_MOCK_PAYMENT !== 'true') {
    console.warn(
      '[Payment Config] WARN: 支付密钥未配置，系统已回退到模拟支付模式'
    );
  }
}
