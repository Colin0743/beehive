import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
} from '@/app/api/_helpers';
import { queryAlipayTradeStatus } from '@/lib/payment';
import { confirmRechargeOrder } from '@/lib/rechargeConfirm';
import { validatePaymentConfig } from '@/lib/payment-config';

/**
 * GET /api/recharge/status?out_trade_no=xxx
 * 查询充值订单状态（需认证，仅能查自己的订单）
 * 当订单为 pending 且为支付宝渠道时，主动查询支付宝确认支付结果
 */
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { searchParams } = new URL(request.url);
  const outTradeNo = searchParams.get('out_trade_no');
  if (!outTradeNo) {
    return errorResponse('缺少参数：out_trade_no', 400);
  }

  const { supabase, userId } = auth;

  const { data: order, error } = await supabase
    .from('recharge_orders')
    .select('id, status, amount_cents, payment_channel, user_id')
    .eq('out_trade_no', outTradeNo)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return errorResponse('查询失败', 500);
  }

  if (!order) {
    return errorResponse('订单不存在', 404);
  }

  // 订单仍为 pending 且为支付宝渠道：主动查询支付宝确认支付结果
  if (
    order.status === 'pending' &&
    order.payment_channel?.startsWith('alipay')
  ) {
    const config = validatePaymentConfig();
    if (config.alipayEnabled) {
      try {
        const tradeStatus = await queryAlipayTradeStatus(outTradeNo);
        if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
          // 支付宝确认已支付，主动确认订单
          const result = await confirmRechargeOrder(
            {
              id: order.id,
              user_id: order.user_id,
              amount_cents: order.amount_cents,
              status: order.status,
            },
            `ALIPAY_QUERY_${outTradeNo}`
          );
          if (result.success) {
            console.log('[Status] 主动查询确认支付成功:', outTradeNo);
            return successResponse({
              status: 'paid',
              amount_cents: order.amount_cents,
            });
          }
        }
      } catch (err) {
        console.error('[Status] 主动查询支付宝失败:', err);
        // 查询失败不影响返回当前状态
      }
    }
  }

  return successResponse({
    status: order.status,
    amount_cents: order.amount_cents,
  });
}
