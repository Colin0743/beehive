/**
 * 支付配置模块（客户端安全）
 * 提供支付渠道配置，不依赖 Node.js 模块
 */
import { getRegion } from '@/lib/region';

/** 支付服务商类型 */
export type PaymentProvider = 'alipay' | 'wechat' | 'stripe' | 'paypal' | 'crypto';

/**
 * 获取当前区域可用的支付方式列表
 * 此函数可在客户端和服务端安全调用
 */
export function getAvailableProviders(): PaymentProvider[] {
  return getRegion() === 'cn'
    ? ['alipay', 'wechat']
    : ['crypto'];
}

/** 支付配置验证结果 */
export interface PaymentConfigValidation {
  /** 是否启用 mock 模式（密钥未配置或显式开启） */
  mockMode: boolean;
  /** 支付宝是否已配置 */
  alipayEnabled: boolean;
  /** 微信支付是否已配置 */
  wechatEnabled: boolean;
  /** Stripe 是否已配置 */
  stripeEnabled: boolean;
  /** PayPal 是否已配置 */
  paypalEnabled: boolean;
  /** NOWPayments 加密货币是否已配置 */
  cryptoEnabled: boolean;
  /** 缺失的环境变量列表 */
  missingVars: string[];
}

/**
 * 验证支付配置状态
 * 检查各支付渠道的环境变量是否配置完整
 * 
 * 注意：此函数仅在服务端使用（API Routes）
 */
export function validatePaymentConfig(): PaymentConfigValidation {
  const region = getRegion();
  const useMockExplicit = process.env.USE_MOCK_PAYMENT === 'true';
  const missingVars: string[] = [];

  // 检查支付宝配置
  const alipayEnabled = !!(
    process.env.ALIPAY_APP_ID &&
    (process.env.ALIPAY_PRIVATE_KEY || process.env.ALIPAY_PRIVATE_KEY_PATH)
  );
  if (region === 'cn' && !alipayEnabled) {
    if (!process.env.ALIPAY_APP_ID) missingVars.push('ALIPAY_APP_ID');
    if (!process.env.ALIPAY_PRIVATE_KEY && !process.env.ALIPAY_PRIVATE_KEY_PATH) {
      missingVars.push('ALIPAY_PRIVATE_KEY');
    }
  }

  // 检查微信支付配置
  const wechatEnabled = !!(
    process.env.WXPAY_APP_ID &&
    process.env.WXPAY_MCHID &&
    process.env.WXPAY_API_KEY &&
    (process.env.WXPAY_PRIVATE_KEY || process.env.WXPAY_PRIVATE_KEY_PATH)
  );
  if (region === 'cn' && !wechatEnabled) {
    if (!process.env.WXPAY_APP_ID) missingVars.push('WXPAY_APP_ID');
    if (!process.env.WXPAY_MCHID) missingVars.push('WXPAY_MCHID');
    if (!process.env.WXPAY_API_KEY) missingVars.push('WXPAY_API_KEY');
    if (!process.env.WXPAY_PRIVATE_KEY && !process.env.WXPAY_PRIVATE_KEY_PATH) {
      missingVars.push('WXPAY_PRIVATE_KEY');
    }
  }

  // 检查 Stripe 配置（保留兼容性，global 区域不再使用）
  const stripeEnabled = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PUBLISHABLE_KEY
  );

  // 检查 PayPal 配置（保留兼容性，global 区域不再使用）
  const paypalEnabled = !!(
    process.env.PAYPAL_CLIENT_ID &&
    process.env.PAYPAL_CLIENT_SECRET
  );

  // 检查 NOWPayments 配置
  const cryptoEnabled = !!(
    process.env.NOWPAYMENTS_API_KEY &&
    process.env.NOWPAYMENTS_IPN_SECRET
  );
  if (region === 'global' && !cryptoEnabled) {
    if (!process.env.NOWPAYMENTS_API_KEY) missingVars.push('NOWPAYMENTS_API_KEY');
    if (!process.env.NOWPAYMENTS_IPN_SECRET) missingVars.push('NOWPAYMENTS_IPN_SECRET');
  }

  // 判断是否使用 mock 模式
  const mockMode = useMockExplicit || (
    region === 'cn' ? (!alipayEnabled && !wechatEnabled) : !cryptoEnabled
  );

  return {
    mockMode,
    alipayEnabled,
    wechatEnabled,
    stripeEnabled,
    paypalEnabled,
    cryptoEnabled,
    missingVars,
  };
}
