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

/** 支持的充值金额（分） */
const ALLOWED_AMOUNTS_CENTS = [100, 500, 1000, 5000, 10000]; // 1元, 5元, 10元, 50元, 100元

/** 支持的支付渠道（自建对接） */
const ALLOWED_CHANNELS = ['alipay_pc', 'alipay_wap', 'wx_native'] as const;

/**
 * 获取应用基础 URL，优先使用 NEXT_PUBLIC_APP_URL 以保证 HTTPS
 * 回退到请求头中的 origin/referer 仅作为最后手段
 */
function getBaseUrl(request: NextRequest): string {
  // 优先使用环境变量配置的 URL（保证 HTTPS）
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl.replace(/\/$/, '');
  }

  // 回退：从请求头获取（开发环境）
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

  if (!ALLOWED_AMOUNTS_CENTS.includes(amountCents)) {
    return errorResponse(
      `充值金额需为以下之一：${ALLOWED_AMOUNTS_CENTS.map((c) => c / 100 + '元').join(', ')}`,
      400
    );
  }

  const channel = (body.channel as string) || 'alipay_pc';
  if (!ALLOWED_CHANNELS.includes(channel as (typeof ALLOWED_CHANNELS)[number])) {
    return errorResponse(`不支持该支付渠道：${channel}`, 400);
  }

  const outTradeNo = `R${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // 使用统一配置检查判断支付模式
  const config = validatePaymentConfig();
  const useMockExplicit = process.env.USE_MOCK_PAYMENT === 'true';

  // 调试日志：输出配置状态
  console.log('[Recharge] 支付配置状态:', JSON.stringify(config));
  console.log('[Recharge] ALIPAY_APP_ID:', process.env.ALIPAY_APP_ID ? '已配置' : '未配置');
  console.log('[Recharge] ALIPAY_PRIVATE_KEY:', process.env.ALIPAY_PRIVATE_KEY ? `已配置(长度:${process.env.ALIPAY_PRIVATE_KEY.length})` : '未配置');

  // 密钥未配置且未显式开启 mock 模式时，拒绝充值请求
  if (!useMockExplicit && config.mockMode) {
    console.warn(
      `[Recharge] WARN: 支付密钥未配置，充值功能不可用。缺失变量: ${config.missingVars.join(', ')}`
    );
    return errorResponse('支付功能暂未开放，请联系管理员', 503);
  }

  // 确定实际使用的支付渠道
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
    return errorResponse('创建充值订单失败', 500);
  }

  // Mock 模式：返回 mock 支付 URL
  if (config.mockMode) {
    return successResponse({
      order_id: order.id,
      out_trade_no: outTradeNo,
      amount_cents: amountCents,
      amount_yuan: (amountCents / 100).toFixed(2),
      payment_channel: 'mock',
      mock_pay_url: `/api/recharge/mock-confirm?out_trade_no=${outTradeNo}`,
    });
  }

  // 使用 NEXT_PUBLIC_APP_URL 构建回调 URL（保证 HTTPS）
  const baseUrl = getBaseUrl(request);

  // 微信 Native 扫码支付
  if (channel === 'wx_native' && config.wxPayEnabled) {
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
        amount_yuan: (amountCents / 100).toFixed(2),
        payment_channel: channel,
        code_url: codeUrl,
      });
    } catch (err) {
      console.error('[WeChat] create order failed:', err);
      return errorResponse('创建支付失败，请重试', 500);
    }
  }

  // 自建支付宝对接
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
        amount_yuan: (amountCents / 100).toFixed(2),
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
