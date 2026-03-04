import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';
import { confirmRechargeOrder } from '@/lib/rechargeConfirm';
import { verifyNowPaymentsIPN, NOWPAYMENTS_SUCCESS_STATUSES } from '@/lib/payment-nowpayments';

const CHANNEL = 'nowpayments';

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
        console.error('[NOWPayments callback]', JSON.stringify(entry));
    } else if (level === 'warn') {
        console.warn('[NOWPayments callback]', JSON.stringify(entry));
    } else {
        console.log('[NOWPayments callback]', JSON.stringify(entry));
    }
}

/**
 * POST /api/recharge/callback/nowpayments
 * NOWPayments IPN 回调
 *
 * 文档：https://documenter.getpostman.com/view/7907941/2s93JwMgmb
 * 验签：x-nowpayments-sig header，HMAC-SHA512
 * 成功状态：payment_status === 'finished' | 'confirmed'
 * 关键字段：order_id（对应 out_trade_no）, payment_id（NOWPayments 内部交易号）
 *           price_amount（原始 USD 金额）, payment_status
 */
export async function POST(request: NextRequest) {
    // Mock 模式下直接返回成功（实际支付由 mock-confirm 处理）
    if (process.env.USE_MOCK_PAYMENT === 'true') {
        return NextResponse.json({ received: true }, { status: 200 });
    }

    try {
        // 1. 读取请求体（必须先读 text 再解析，用于签名验证）
        const rawText = await request.text();
        let body: Record<string, unknown>;
        try {
            body = JSON.parse(rawText) as Record<string, unknown>;
        } catch {
            logCallback('error', 'parse_failed', { reason: '请求体不是合法 JSON' });
            return NextResponse.json({ error: 'bad_request' }, { status: 400 });
        }

        // 2. 验证 IPN 签名
        const signature = request.headers.get('x-nowpayments-sig') ?? '';
        if (!signature) {
            logCallback('error', 'signature_missing');
            return NextResponse.json({ error: 'missing_signature' }, { status: 401 });
        }

        if (!verifyNowPaymentsIPN(body, signature)) {
            logCallback('error', 'signature_failed', { orderId: body.order_id });
            return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
        }

        // 3. 提取关键字段
        const paymentId = String(body.payment_id ?? '');
        const orderId = String(body.order_id ?? '');       // 对应 out_trade_no
        const paymentStatus = String(body.payment_status ?? '');
        const priceAmount = Number(body.price_amount ?? 0); // 原始 USD 金额

        if (!orderId || !paymentId) {
            logCallback('error', 'missing_fields', { orderId, paymentId });
            return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
        }

        // 4. 只处理最终成功状态
        if (!NOWPAYMENTS_SUCCESS_STATUSES.has(paymentStatus)) {
            logCallback('info', 'ignored_status', { orderId, paymentStatus });
            // 返回 200 告知 NOWPayments 不要重试此非终态通知
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 5. 查询订单（通过 out_trade_no 匹配）
        const admin = createServiceRoleClient();
        const { data: order, error: queryError } = await admin
            .from('recharge_orders')
            .select('id, user_id, amount_cents, status')
            .eq('out_trade_no', orderId)
            .maybeSingle();

        if (queryError || !order) {
            logCallback('warn', 'order_not_found', { orderId });
            // 返回 200 避免 NOWPayments 无限重试
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 6. 幂等：已支付直接返回
        if (order.status === 'paid') {
            logCallback('info', 'duplicate_callback', { orderId, orderId_db: order.id });
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 7. 金额校验（NOWPayments price_amount 是 USD，订单 amount_cents 是美分）
        const expectedUsd = order.amount_cents / 100;
        if (Math.abs(priceAmount - expectedUsd) > 0.01) {
            logCallback('error', 'amount_mismatch', {
                orderId,
                expectedUsd,
                receivedUsd: priceAmount,
            });
            return NextResponse.json({ error: 'amount_mismatch' }, { status: 400 });
        }

        // 8. 调用原子充值确认（RPC）
        const result = await confirmRechargeOrder(order, paymentId);

        if (!result.success) {
            logCallback('error', 'confirm_failed', { orderId, error: result.error });
            // 返回 500 让 NOWPayments 重试（RPC 失败可能是暂时性问题）
            return NextResponse.json({ error: 'confirm_failed' }, { status: 500 });
        }

        // 9. 成功
        logCallback('info', 'success', {
            orderId,
            paymentId,
            priceAmountUsd: priceAmount,
            newBalanceCents: result.newBalanceCents,
        });
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const errorStack = err instanceof Error ? err.stack : undefined;
        logCallback('error', 'unexpected_error', { error: errorMessage, stack: errorStack });
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
