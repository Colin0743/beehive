import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from '@/app/api/_helpers';
import { createAlipayOrder } from '@/lib/payment';
import { createWxNativeOrder } from '@/lib/payment-wechat';
import { validatePaymentConfig } from '@/lib/payment-config';
import { createNowPaymentsInvoice } from '@/lib/payment-nowpayments';
import { getRegion } from '@/lib/region';

/** 国内版支持的充值金额（分，人民币） */
const ALLOWED_AMOUNTS_CENTS_CN = [100, 500, 1000, 5000, 10000]; // ¥1, ¥5, ¥10, ¥50, ¥100

/** 海外版支持的充值金额（分，美分 = 美元 × 100） */
const ALLOWED_AMOUNTS_CENTS_GLOBAL = [50, 500, 1000, 5000, 10000]; // $0.50, $5, $10, $50, $100

/** 支持的支付渠道 */
const ALLOWED_CHANNELS_CN = ['alipay_pc', 'alipay_wap', 'wx_native'] as const;
const ALLOWED_CHANNELS_GLOBAL = ['crypto'] as const;

/**
 * 获取应用基础 URL，优先使用 NEXT_PUBLIC_APP_URL 以保证 HTTPS
 * 回退到请求头中的 origin/referer 仅作为最后手段
 */
function getBaseUrl(request: NextRequest): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl.replace(/\/$/, '');
  }

  const origin = request.headers.get('origin') || request.headers.get('referer') || '';
  const fromHeader = origin.replace(/\/$/, '');
  if (fromHeader) {
    console.warn('[Recharge] WARN: NEXT_PUBLIC_APP_URL 未配置，使用请求头构建回调 URL，可能非 HTTPS');
    return fromHeader;
  }

  return 'http://localhost:3000';
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;
  const region = getRegion();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('请求体格式错误', 400);
  }

  const missing = validateRequiredFields(body, ['amount_cents']);
  if (missing) {
    return errorResponse(`缺少必填字段：${missing.join(', ')}`, 400);
  }

  const amountCents = Number(body.amount_cents);
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return errorResponse('充值金额必须为正整数（单位：分）', 400);
  }

  // 根据区域校验金额范围
  const allowedAmounts = region === 'cn' ? ALLOWED_AMOUNTS_CENTS_CN : ALLOWED_AMOUNTS_CENTS_GLOBAL;
  if (!allowedAmounts.includes(amountCents)) {
    const labels = region === 'cn'
      ? allowedAmounts.map((c) => `¥${c / 100}`)
      : allowedAmounts.map((c) => `$${(c / 100).toFixed(2)}`);
    return errorResponse(`充值金额需为以下之一：${labels.join(', ')}`, 400);
  }

  // 校验渠道
  const allowedChannels = region === 'cn'
    ? (ALLOWED_CHANNELS_CN as readonly string[])
    : (ALLOWED_CHANNELS_GLOBAL as readonly string[]);
  const channel = (body.channel as string) || (region === 'cn' ? 'alipay_pc' : 'crypto');
  if (!allowedChannels.includes(channel)) {
    return errorResponse(`不支持该支付渠道：${channel}`, 400);
  }

  const outTradeNo = `R${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const config = validatePaymentConfig();
  const useMockExplicit = process.env.USE_MOCK_PAYMENT === 'true';

  console.log('[Recharge] 支付配置状态:', JSON.stringify(config));

  // 密钥未配置且未显式开启 mock 模式时，拒绝充值请求
  if (!useMockExplicit && config.mockMode) {
    console.warn(
      `[Recharge] WARN: 支付密钥未配置，充值功能不可用。缺失变量: ${config.missingVars.join(', ')}`
    );
    return errorResponse('支付功能暂未开放，请联系管理员', 503);
  }

  const paymentChannel = config.mockMode ? 'mock' : channel;

  const { data: order, error } = await supabase
    .from('recharge_orders')
    .insert({
      user_id: userId,
      amount_cents: amountCents,
      status: 'pending',
      payment_channel: paymentChannel,
      out_trade_no: outTradeNo,
    })
    .select()
    .single();

  if (error) {
    console.error('[Recharge] 创建订单失败:', error);
    return errorResponse('创建充值订单失败', 500);
  }

  // Mock 模式
  if (config.mockMode) {
    return successResponse({
      order_id: order.id,
      out_trade_no: outTradeNo,
      amount_cents: amountCents,
      amount_display: region === 'cn'
        ? `¥${(amountCents / 100).toFixed(2)}`
        : `$${(amountCents / 100).toFixed(2)}`,
      payment_channel: 'mock',
      mock_pay_url: `/api/recharge/mock-confirm?out_trade_no=${outTradeNo}`,
    });
  }

  const baseUrl = getBaseUrl(request);

  // ——— 海外版：NOWPayments 稳定币支付 ———
  if (channel === 'crypto' && config.cryptoEnabled) {
    try {
      const invoice = await createNowPaymentsInvoice({
        priceAmountUsd: amountCents / 100,
        orderId: outTradeNo,
        orderDescription: `Bee Studio AI Credit $${(amountCents / 100).toFixed(2)}`,
        ipnCallbackUrl: `${baseUrl}/api/recharge/callback/nowpayments`,
        successUrl: `${baseUrl}/recharge?return=1&out_trade_no=${outTradeNo}`,
        cancelUrl: `${baseUrl}/recharge?cancelled=1`,
      });

      return successResponse({
        order_id: order.id,
        out_trade_no: outTradeNo,
        amount_cents: amountCents,
        amount_display: `$${(amountCents / 100).toFixed(2)}`,
        payment_channel: 'nowpayments',
        invoice_url: invoice.invoiceUrl,
        redirect_url: invoice.invoiceUrl, // 复用前端 redirect_url 处理逻辑
      });
    } catch (err) {
      console.error('[NOWPayments] create invoice failed:', err);
      return errorResponse('创建加密货币支付失败，请重试', 500);
    }
  }

  // ——— 国内版：微信 Native ———
  if (channel === 'wx_native' && config.wechatEnabled) {
    try {
      const notifyUrl = `${baseUrl}/api/recharge/callback/wechat`;
      const codeUrl = await createWxNativeOrder({
        outTradeNo,
        amountCents,
        description: `蜂巢余额充值 ¥${(amountCents / 100).toFixed(2)}`,
        notifyUrl,
      });
      return successResponse({
        order_id: order.id,
        out_trade_no: outTradeNo,
        amount_cents: amountCents,
        amount_display: `¥${(amountCents / 100).toFixed(2)}`,
        payment_channel: channel,
        code_url: codeUrl,
      });
    } catch (err) {
      console.error('[WeChat] create order failed:', err);
      return errorResponse('创建支付失败，请重试', 500);
    }
  }

  // ——— 国内版：支付宝 ———
  if ((channel === 'alipay_pc' || channel === 'alipay_wap') && config.alipayEnabled) {
    try {
      const returnUrl = `${baseUrl}/recharge?return=1&out_trade_no=${outTradeNo}`;
      const notifyUrl = `${baseUrl}/api/recharge/callback/alipay`;

      const payUrl = createAlipayOrder(channel as 'alipay_pc' | 'alipay_wap', {
        outTradeNo,
        amountCents,
        subject: '蜂巢余额充值',
        body: `充值 ¥${(amountCents / 100).toFixed(2)}`,
        returnUrl,
        notifyUrl,
      });

      return successResponse({
        order_id: order.id,
        out_trade_no: outTradeNo,
        amount_cents: amountCents,
        amount_display: `¥${(amountCents / 100).toFixed(2)}`,
        payment_channel: channel,
        redirect_url: payUrl,
      });
    } catch (err) {
      console.error('[Alipay] create order failed:', err);
      return errorResponse('创建支付失败，请重试', 500);
    }
  }

  return errorResponse(`不支持的支付渠道或未配置：${channel}`, 400);
}
