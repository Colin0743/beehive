import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';
import { confirmRechargeOrder } from '@/lib/rechargeConfirm';
import { verifyAndDecryptWxNotify } from '@/lib/payment-wechat';

const USE_MOCK_PAYMENT = process.env.USE_MOCK_PAYMENT === 'true';

/** 支付渠道标识 */
const CHANNEL = 'wechat';

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
    console.error('[WeChat callback]', JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn('[WeChat callback]', JSON.stringify(entry));
  } else {
    console.log('[WeChat callback]', JSON.stringify(entry));
  }
}

/** 构造微信回调 JSON 响应 */
function wxResponse(code: 'SUCCESS' | 'FAIL', message: string, status = 200) {
  return new NextResponse(JSON.stringify({ code, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * POST /api/recharge/callback/wechat
 * 微信支付异步通知回调（自建对接）
 *
 * 处理流程：
 * 1. 读取 raw body（JSON 格式）
 * 2. 使用微信平台证书验证签名（RSA-SHA256）
 * 3. 使用 AES-256-GCM 解密 resource 数据
 * 4. 根据 out_trade_no 查询订单
 * 5. 校验金额（amount.total 应等于 amount_cents）
 * 6. 调用 confirmRechargeOrder 完成确认
 * 7. 返回 JSON 响应
 */
export async function POST(request: NextRequest) {
  // 模拟模式直接返回成功
  if (USE_MOCK_PAYMENT) {
    return wxResponse('SUCCESS', '成功');
  }

  try {
    // 1. 读取请求体
    const rawBody = await request.text();
    if (!rawBody) {
      logCallback('error', 'empty_body');
      return wxResponse('FAIL', 'Empty body', 400);
    }

    const getHeader = (name: string) => request.headers.get(name);

    // 2. 验证签名并解密通知数据
    const verifyResult = await verifyAndDecryptWxNotify(rawBody, getHeader);

    if (!verifyResult.success || !verifyResult.data) {
      // 根据失败原因记录不同级别的日志
      if (verifyResult.failReason === 'signature_failed') {
        logCallback('error', 'signature_failed', { reason: '微信平台证书签名验证失败' });
        return wxResponse('FAIL', 'Invalid signature', 400);
      }
      if (verifyResult.failReason === 'missing_headers') {
        logCallback('error', 'missing_headers', { reason: '缺少签名相关请求头' });
        return wxResponse('FAIL', 'Invalid request', 400);
      }
      if (verifyResult.failReason === 'invalid_event_type') {
        logCallback('info', 'ignored_event_type', { reason: '非 TRANSACTION.SUCCESS 事件' });
        return wxResponse('SUCCESS', '成功');
      }
      // decrypt_failed 或 missing_api_key
      logCallback('error', 'verify_decrypt_failed', { failReason: verifyResult.failReason });
      return wxResponse('FAIL', 'Verification failed', 400);
    }

    const { out_trade_no: outTradeNo, transaction_id: transactionId, amount } = verifyResult.data;
    const amountTotal = amount?.total ?? 0;

    // 3. 查询订单
    const admin = createServiceRoleClient();
    const { data: order, error: queryError } = await admin
      .from('recharge_orders')
      .select('id, user_id, amount_cents, status')
      .eq('out_trade_no', outTradeNo)
      .maybeSingle();

    if (queryError || !order) {
      // 订单不存在：返回成功避免微信重试，记录 WARN 日志
      logCallback('warn', 'order_not_found', { outTradeNo });
      return wxResponse('SUCCESS', '成功');
    }

    // 4. 幂等性：已支付订单直接返回成功
    if (order.status === 'paid') {
      logCallback('info', 'duplicate_callback', {
        outTradeNo,
        orderId: order.id,
        amountCents: amountTotal,
      });
      return wxResponse('SUCCESS', '成功');
    }

    // 5. 金额校验
    if (order.amount_cents !== amountTotal) {
      logCallback('error', 'amount_mismatch', {
        outTradeNo,
        orderId: order.id,
        expectedCents: order.amount_cents,
        receivedCents: amountTotal,
      });
      return wxResponse('FAIL', 'Amount mismatch', 400);
    }

    // 6. 调用充值确认（RPC 原子操作）
    const result = await confirmRechargeOrder(order, transactionId);

    if (!result.success) {
      logCallback('error', 'confirm_failed', {
        outTradeNo,
        orderId: order.id,
        amountCents: amountTotal,
      });
      // 返回 FAIL 让微信重试，不暴露内部错误详情
      return wxResponse('FAIL', 'Processing failed', 500);
    }

    // 7. 成功
    logCallback('info', 'success', {
      outTradeNo,
      orderId: order.id,
      amountCents: amountTotal,
      transactionId,
      newBalance: result.newBalanceCents,
    });
    return wxResponse('SUCCESS', '成功');

  } catch (err) {
    // 全局异常捕获：记录完整错误堆栈，但响应不暴露内部细节
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    logCallback('error', 'unexpected_error', {
      error: errorMessage,
      stack: errorStack,
    });
    // 响应中不包含任何内部错误信息
    return wxResponse('FAIL', 'Internal error', 500);
  }
}
