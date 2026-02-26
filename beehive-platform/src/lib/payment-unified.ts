/**
 * 统一支付接口模块
 * 根据区域自动选择对应的支付服务商
 * CN 区域：支付宝、微信支付（复用现有实现）
 * Global 区域：Stripe、PayPal（未实现时使用 mock 模式）
 * 
 * 注意：此模块仅在服务端使用（API Routes），客户端请使用 payment-config.ts
 */
import { getRegion } from '@/lib/region';

/** 支付服务商类型 */
export type PaymentProvider = 'alipay' | 'wechat' | 'stripe' | 'paypal';

/** 统一订单创建参数 */
export interface CreateOrderParams {
  outTradeNo: string;
  amountCents: number;
  subject: string;
  returnUrl: string;
  notifyUrl: string;
}

/** 统一订单创建结果 */
export interface CreateOrderResult {
  /** 支付跳转 URL 或二维码内容 */
  payUrl: string;
  /** 实际使用的支付渠道 */
  channel: string;
}

/**
 * 统一创建订单接口
 * CN 区域调用现有 Alipay/WeChat 实现
 * Global 区域调用 Stripe/PayPal（未实现时返回 mock）
 * 
 * 注意：此函数仅在服务端使用（API Routes），不应在客户端调用
 */
export async function createOrder(
  provider: PaymentProvider,
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  // 客户端环境检测
  if (typeof window !== 'undefined') {
    throw new Error('createOrder 只能在服务端调用，请通过 API Routes 使用');
  }

  const region = getRegion();

  if (region === 'cn') {
    if (provider === 'alipay') {
      // 动态导入，避免加载不必要的支付模块
      const { createAlipayOrder } = await import('@/lib/payment');
      const payUrl = createAlipayOrder('alipay_pc', {
        ...params,
        body: params.subject,
      });
      return { payUrl, channel: 'alipay_pc' };
    }
    if (provider === 'wechat') {
      // 动态导入微信支付模块
      const { createWxNativeOrder } = await import('@/lib/payment-wechat');
      const codeUrl = await createWxNativeOrder({
        outTradeNo: params.outTradeNo,
        amountCents: params.amountCents,
        description: params.subject,
        notifyUrl: params.notifyUrl,
      });
      return { payUrl: codeUrl, channel: 'wx_native' };
    }
  }

  if (region === 'global') {
    if (provider === 'stripe' || provider === 'paypal') {
      // 未实现时使用 mock 模式
      if (process.env.USE_MOCK_PAYMENT === 'true') {
        return {
          payUrl: `/api/recharge/mock-confirm?out_trade_no=${params.outTradeNo}`,
          channel: 'mock',
        };
      }
      // TODO: 实现 Stripe/PayPal 真实对接
      throw new Error(`${provider} 支付尚未实现，请设置 USE_MOCK_PAYMENT=true`);
    }
  }

  throw new Error(`区域 ${region} 不支持支付方式 ${provider}`);
}

/**
 * 统一验证支付回调
 * 
 * 注意：此函数仅在服务端使用（API Routes），不应在客户端调用
 */
export async function verifyPayment(
  provider: PaymentProvider,
  payload: Record<string, string>
): Promise<boolean> {
  // 客户端环境检测
  if (typeof window !== 'undefined') {
    throw new Error('verifyPayment 只能在服务端调用，请通过 API Routes 使用');
  }

  if (provider === 'alipay') {
    const { verifyAlipayNotify } = await import('@/lib/payment');
    return verifyAlipayNotify(payload);
  }
  // TODO: 微信支付回调验证使用 verifyAndDecryptWxNotify，签名机制不同
  // TODO: Stripe webhook 验签、PayPal IPN 验签
  return false;
}
