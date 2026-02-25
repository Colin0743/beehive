/**
 * 自建支付对接 - 支付宝
 * 直接调用支付宝开放平台 API，无需第三方聚合
 * 环境变量：ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY
 */
import { AlipaySdk } from 'alipay-sdk';
import fs from 'fs';

/** 支付宝沙箱网关地址 */
const ALIPAY_SANDBOX_GATEWAY = 'https://openapi-sandbox.dl.alipaydev.com/gateway.do';

let alipaySdk: AlipaySdk | null = null;

function getAlipaySdk(): AlipaySdk {
  if (!alipaySdk) {
    const appId = process.env.ALIPAY_APP_ID;
    const privateKey = process.env.ALIPAY_PRIVATE_KEY;
    const publicKey = process.env.ALIPAY_PUBLIC_KEY;
    const privateKeyPath = process.env.ALIPAY_PRIVATE_KEY_PATH;
    const publicKeyPath = process.env.ALIPAY_PUBLIC_KEY_PATH;
    const isSandbox = process.env.ALIPAY_SANDBOX === 'true';

    if (!appId || (!privateKey && !privateKeyPath)) {
      throw new Error('ALIPAY_APP_ID 和 ALIPAY_PRIVATE_KEY（或 ALIPAY_PRIVATE_KEY_PATH）必须配置');
    }

    const privKey = privateKey || (privateKeyPath && fs.readFileSync(privateKeyPath, 'ascii'));
    const pubKey = publicKey || (publicKeyPath && fs.readFileSync(publicKeyPath, 'ascii'));

    if (!privKey) {
      throw new Error('无法读取支付宝应用私钥');
    }

    alipaySdk = new AlipaySdk({
      appId,
      privateKey: privKey,
      alipayPublicKey: pubKey || undefined,
      keyType: 'PKCS8',
      // 沙箱环境使用沙箱网关
      ...(isSandbox && { gateway: ALIPAY_SANDBOX_GATEWAY }),
    });

    if (isSandbox) {
      console.log('[Alipay] 使用沙箱环境:', ALIPAY_SANDBOX_GATEWAY);
    }
  }
  return alipaySdk;
}

export interface CreateAlipayOrderParams {
  outTradeNo: string;
  amountCents: number;
  subject: string;
  body?: string;
  returnUrl: string;
  notifyUrl: string;
}

export type AlipayChannel = 'alipay_pc' | 'alipay_wap';

/**
 * 创建支付宝订单，返回支付跳转 URL
 */
export function createAlipayOrder(
  channel: AlipayChannel,
  params: CreateAlipayOrderParams
): string {
  const sdk = getAlipaySdk();
  const totalAmount = (params.amountCents / 100).toFixed(2);
  const productCode =
    channel === 'alipay_pc' ? 'FAST_INSTANT_TRADE_PAY' : 'QUICK_WAP_WAY';

  const bizContent = {
    out_trade_no: params.outTradeNo,
    product_code: productCode,
    total_amount: totalAmount,
    subject: params.subject,
    body: params.body || params.subject,
  };

  const method =
    channel === 'alipay_pc' ? 'alipay.trade.page.pay' : 'alipay.trade.wap.pay';

  const url = sdk.pageExecute(method, 'GET', {
    bizContent,
    returnUrl: params.returnUrl,
    notifyUrl: params.notifyUrl,
  });

  return url as string;
}

/**
 * 验签支付宝异步通知
 */
export function verifyAlipayNotify(postData: Record<string, string>): boolean {
  try {
    const sdk = getAlipaySdk();
    return sdk.checkNotifySignV2(postData);
  } catch {
    return false;
  }
}

/**
 * 主动查询支付宝订单交易状态
 * 用于本地开发或异步通知未到达时，服务端主动确认支付结果
 * @returns 交易状态字符串（TRADE_SUCCESS / TRADE_FINISHED / WAIT_BUYER_PAY / TRADE_CLOSED）或 null
 */
export async function queryAlipayTradeStatus(outTradeNo: string): Promise<string | null> {
  try {
    const sdk = getAlipaySdk();
    const result = await sdk.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no: outTradeNo,
      },
    });
    const tradeStatus = (result as Record<string, unknown>)?.tradeStatus as string | undefined;
    console.log('[Alipay] trade query result:', { outTradeNo, tradeStatus });
    return tradeStatus || null;
  } catch (err) {
    console.error('[Alipay] trade query failed:', err);
    return null;
  }
}

export function isAlipayEnabled(): boolean {
  return !!(
    process.env.ALIPAY_APP_ID &&
    (process.env.ALIPAY_PRIVATE_KEY || process.env.ALIPAY_PRIVATE_KEY_PATH)
  );
}
