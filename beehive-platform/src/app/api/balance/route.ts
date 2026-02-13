import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
} from '@/app/api/_helpers';

/**
 * GET /api/balance
 * 查询当前用户余额（需认证）
 */
export async function GET(_request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;

  const { data, error } = await supabase
    .from('user_balances')
    .select('balance_cents, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return errorResponse('查询余额失败', 500);
  }

  const balanceCents = data?.balance_cents ?? 0;
  const taskPublishFeeCents = parseInt(
    process.env.TASK_PUBLISH_FEE_CENTS ?? '100',
    10
  );
  return successResponse({
    balance_cents: balanceCents,
    balance_yuan: (balanceCents / 100).toFixed(2),
    updated_at: data?.updated_at ?? null,
    task_publish_fee_cents: taskPublishFeeCents,
    task_publish_fee_yuan: (taskPublishFeeCents / 100).toFixed(2),
  });
}
