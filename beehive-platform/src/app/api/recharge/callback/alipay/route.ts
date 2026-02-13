import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';
import { confirmRechargeOrder } from '@/lib/rechargeConfirm';
import { verifyAlipayNotify } from '@/lib/payment';

const USE_MOCK_PAYMENT = process.env.USE_MOCK_PAYMENT === 'true';

/** 支付渠道标识 */
const CHANNEL = 'alipay';

/**
 * 记录结构化回调日志
 * 包含订单号、金额、渠道、处理结果和时间戳
 */
function logCallback(
  level: 'info' | 'warn' | 'error',
  result: string,
  details: Record<string, unknown> = {}
) {
  const entry = {
    timestamp: new Date().toISOString(),
    channel: CHANNEL,
    result,
    ...details,
  };
  if (level === 'error') {
    console.error('[Alipay callback]', JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn('[Alipay callback]', JSON.stringify(entry));
  } else {
    console.log('[Alipay callback]', JSON.stringify(entry));
  }
}

/**
 * POST /api/recharge/callback/alipay
 * 支付宝异步通知回调（自建对接）
 * 支付宝以 application/x-www-form-urlencoded 格式 POST 通知
 */
export async function POST(request: NextRequest) {
  // 模拟模式直接返回成功
  if (USE_MOCK_PAYMENT) {
    return new NextResponse('success', { status: 200 });
  }

  try {
    // 1. 解析请求体
    const contentType = request.headers.get('content-type') || '';
    let postData: Record<string, string> = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const rawBody = await request.text();
      const params = new URLSearchParams(rawBody);
      params.forEach((value, key) => {
        postData[key] = value;
      });
    } else {
      try {
        postData = (await request.json()) as Record<string, string>;
      } catch {
        logCallback('error', 'parse_failed', { reason: '请求体解析失败' });
        return new NextResponse('fail', { status: 400 });
      }
    }

    const outTradeNo = postData.out_trade_no || '';
    const tradeNo = postData.trade_no || '';
    const totalAmountStr = postData.total_amount || '0';
    const tradeStatus = postData.trade_status || '';

    // 2. 验证支付宝签名
    if (!verifyAlipayNotify(postData)) {
      logCallback('error', 'signature_failed', {
        outTradeNo,
        amount: totalAmountStr,
      });
      return new NextResponse('fail', { status: 400 });
    }

    // 3. 检查交易状态，非成功状态直接返回
    if (tradeStatus !== 'TRADE_SUCCESS' && tradeStatus !== 'TRADE_FINISHED') {
      logCallback('info', 'ignored_status', {
        outTradeNo,
        tradeStatus,
      });
      return new NextResponse('success', { status: 200 });
    }

    // 4. 校验必要字段
    const totalAmount = Math.round(parseFloat(totalAmountStr) * 100);

    if (!outTradeNo || !tradeNo) {
      logCallback('error', 'missing_fields', {
        outTradeNo: outTradeNo || 'missing',
        tradeNo: tradeNo || 'missing',
      });
      return new NextResponse('fail', { status: 400 });
    }

    // 5. 查询订单
    const admin = createServiceRoleClient();
    const { data: order, error: queryError } = await admin
      .from('recharge_orders')
      .select('id, user_id, amount_cents, status')
      .eq('out_trade_no', outTradeNo)
      .maybeSingle();

    if (queryError || !order) {
      // 订单不存在：返回成功避免支付平台重试，记录 WARN 日志
      logCallback('warn', 'order_not_found', { outTradeNo });
      return new NextResponse('success', { status: 200 });
    }

    // 6. 幂等性：已支付订单直接返回成功
    if (order.status === 'paid') {
      logCallback('info', 'duplicate_callback', {
        outTradeNo,
        orderId: order.id,
        amount: totalAmountStr,
      });
      return new NextResponse('success', { status: 200 });
    }

    // 7. 金额校验
    if (order.amount_cents !== totalAmount) {
      logCallback('error', 'amount_mismatch', {
        outTradeNo,
        orderId: order.id,
        expectedCents: order.amount_cents,
        receivedCents: totalAmount,
      });
      return new NextResponse('fail', { status: 400 });
    }

    // 8. 调用充值确认（RPC 原子操作）
    const result = await confirmRechargeOrder(order, tradeNo);

    if (!result.success) {
      logCallback('error', 'confirm_failed', {
        outTradeNo,
        orderId: order.id,
        amount: totalAmountStr,
      });
      // 返回 fail 让支付宝重试，不暴露内部错误详情
      return new NextResponse('fail', { status: 500 });
    }

    // 9. 成功
    logCallback('info', 'success', {
      outTradeNo,
      orderId: order.id,
      amount: totalAmountStr,
      newBalance: result.newBalanceCents,
    });
    return new NextResponse('success', { status: 200 });

  } catch (err) {
    // 全局异常捕获：记录完整错误堆栈，但响应不暴露内部细节
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    logCallback('error', 'unexpected_error', {
      error: errorMessage,
      stack: errorStack,
    });
    // 响应中不包含任何内部错误信息
    return new NextResponse('fail', { status: 500 });
  }
}
