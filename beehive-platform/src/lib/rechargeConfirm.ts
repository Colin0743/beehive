/**
 * 充值订单确认 - 通过 RPC 调用原子性地完成订单确认
 * 供 mock-confirm 与支付宝/微信回调共用
 *
 * 内部调用 PostgreSQL 函数 confirm_recharge_order，
 * 在单个数据库事务中完成：订单状态更新、流水插入、余额增加。
 */
import { createServiceRoleClient } from '@/lib/supabase-server';

export interface RechargeOrder {
  id: string;
  user_id: string;
  amount_cents: number;
  status: string;
}

export interface ConfirmResult {
  success: boolean;
  newBalanceCents?: number;
  error?: string;
}

/**
 * 确认充值订单：调用数据库 RPC 函数原子性地完成订单确认
 * @param order 订单对象（需包含 id, user_id, amount_cents, status）
 * @param tradeNo 支付渠道交易号（支付宝 trade_no / 微信 transaction_id / MOCK_xxx）
 * @returns 成功返回 { success: true, newBalanceCents }，失败返回 { success: false, error }
 */
export async function confirmRechargeOrder(
  order: RechargeOrder,
  tradeNo: string
): Promise<ConfirmResult> {
  // 前置检查：非 pending 状态直接返回，避免不必要的 RPC 调用
  if (order.status !== 'pending') {
    return { success: false, error: '订单状态异常' };
  }

  const admin = createServiceRoleClient();

  // 调用原子充值确认 RPC 函数
  const { data, error } = await admin.rpc('confirm_recharge_order', {
    p_order_id: order.id,
    p_trade_no: tradeNo,
    p_expected_amount: order.amount_cents,
  });

  // RPC 调用本身出错（网络/数据库连接等）
  if (error) {
    console.error('[rechargeConfirm] RPC 调用失败:', error.message);
    return { success: false, error: '充值确认失败' };
  }

  // 解析 RPC 返回的 jsonb 结果
  const result = data as { success: boolean; new_balance: number; error_msg: string } | null;

  if (!result) {
    return { success: false, error: 'RPC 返回结果为空' };
  }

  if (!result.success) {
    return { success: false, error: result.error_msg || '充值确认失败' };
  }

  return {
    success: true,
    newBalanceCents: result.new_balance,
  };
}
