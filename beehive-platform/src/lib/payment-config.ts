/**
 * 支付配置模块（客户端安全）
 * 提供支付渠道配置，不依赖 Node.js 模块
 */
import { getRegion } from '@/lib/region';

/** 支付服务商类型 */
export type PaymentProvider = 'alipay' | 'wechat' | 'stripe' | 'paypal';

/**
 * 获取当前区域可用的支付方式列表
 * 此函数可在客户端和服务端安全调用
 */
export function getAvailableProviders(): PaymentProvider[] {
  return getRegion() === 'cn'
    ? ['alipay', 'wechat']
    : ['stripe', 'paypal'];
}
