import { NextRequest } from 'next/server';
import {
  getAuthenticatedClient,
  successResponse,
  errorResponse,
} from '@/app/api/_helpers';

/**
 * GET /api/balance/transactions
 * 查询当前用户余额流水（需认证）
 * 支持分页：?limit=20&offset=0
 */
export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return errorResponse('未认证，请先登录', 401);
  }

  const { supabase, userId } = auth;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10), 0);

  const { data, error } = await supabase
    .from('balance_transactions')
    .select('id, amount_cents, type, related_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return errorResponse('查询流水失败', 500);
  }

  const items = (data ?? []).map((row) => ({
    id: row.id,
    amount_cents: row.amount_cents,
    amount_yuan: (row.amount_cents / 100).toFixed(2),
    type: row.type,
    related_id: row.related_id,
    created_at: row.created_at,
  }));

  return successResponse({ items });
}
