import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
} from '@/app/api/_helpers';
import { confirmRechargeOrder } from '@/lib/rechargeConfirm';

/**
 * GET /api/recharge/mock-confirm
 * 模拟支付确认：仅在 USE_MOCK_PAYMENT=true 时可用
 * 生产环境未显式开启 mock 模式时，此接口直接拒绝请求
 */
export async function GET(request: NextRequest) {
  // 仅在显式开启模拟支付模式时允许调用
  if (process.env.USE_MOCK_PAYMENT !== 'true') {
    return errorResponse('模拟支付未启用', 403);
  }

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

  const { data: order, error: orderError } = await supabase
    .from('recharge_orders')
    .select('id, user_id, amount_cents, status')
    .eq('out_trade_no', outTradeNo)
    .single();

  if (orderError || !order) {
    return errorResponse('订单不存在', 404);
  }

  if (order.user_id !== userId) {
    return errorResponse('无权操作此订单', 403);
  }

  if (order.status === 'paid') {
    return successResponse({ message: '订单已支付', order_id: order.id });
  }

  const result = await confirmRechargeOrder(order, `MOCK_${Date.now()}`);

  if (!result.success) {
    return errorResponse(result.error || '确认失败', 500);
  }

  return successResponse({
    message: '充值成功',
    order_id: order.id,
    amount_cents: order.amount_cents,
    new_balance_cents: result.newBalanceCents,
  });
}
