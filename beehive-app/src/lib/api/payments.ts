import { supabase } from '../supabase';

/**
 * Mock 充值 — 直接更新数据库余额（跳过支付网关）
 * 真实上线时替换为 IAP / Stripe / Paddle 流程
 */
export async function mockRecharge(userId: string, amountCents: number): Promise<{ newBalance: number }> {
    // 1. 先获取当前余额
    const { data: current } = await supabase
        .from('user_balances')
        .select('balance_cents')
        .eq('user_id', userId)
        .single();

    const currentBalance = current?.balance_cents ?? 0;
    const newBalance = currentBalance + amountCents;

    // 2. upsert 余额记录
    const { error } = await supabase
        .from('user_balances')
        .upsert(
            { user_id: userId, balance_cents: newBalance, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
        );

    if (error) throw error;

    // 3. 插入交易记录（表可能不存在，忽略错误）
    const { error: txError } = await supabase
        .from('balance_transactions')
        .insert({
            user_id: userId,
            amount_cents: amountCents,
            type: 'recharge',
        });
    if (txError) console.warn('[payments] tx insert error:', txError.message);

    return { newBalance };
}

/**
 * 发布任务扣费
 * 检查余额是否足够，执行扣除
 */
export async function deductForTaskPublish(
    userId: string,
    costCents: number
): Promise<{ success: boolean; newBalance: number; error?: string }> {
    // 1. 获取当前余额
    const { data: current } = await supabase
        .from('user_balances')
        .select('balance_cents')
        .eq('user_id', userId)
        .single();

    const currentBalance = current?.balance_cents ?? 0;

    if (currentBalance < costCents) {
        return {
            success: false,
            newBalance: currentBalance,
            error: `Insufficient balance. Need $${(costCents / 100).toFixed(2)}, have $${(currentBalance / 100).toFixed(2)}.`,
        };
    }

    const newBalance = currentBalance - costCents;

    // 2. 更新余额
    const { error } = await supabase
        .from('user_balances')
        .update({ balance_cents: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

    if (error) throw error;

    // 3. 插入交易记录
    const { error: txError } = await supabase
        .from('balance_transactions')
        .insert({
            user_id: userId,
            amount_cents: -costCents,
            type: 'task_publish',
        });
    if (txError) console.warn('[payments] tx insert error:', txError.message);

    return { success: true, newBalance };
}

/** 预设充值额度选项（分） */
export const RECHARGE_OPTIONS = [
    { label: '$5', cents: 500 },
    { label: '$10', cents: 1000 },
    { label: '$20', cents: 2000 },
    { label: '$50', cents: 5000 },
];
