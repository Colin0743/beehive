import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
} from '@/app/api/_helpers';

/**
 * GET /api/recharge/status?out_trade_no=xxx
 * 查询充值订单状态（需认证，仅能查自己的订单）
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
    .select('id, status, amount_cents')
    .eq('out_trade_no', outTradeNo)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return errorResponse('查询失败', 500);
  }

  if (!order) {
    return errorResponse('订单不存在', 404);
  }

  return successResponse({
    status: order.status,
    amount_cents: order.amount_cents,
  });
}
