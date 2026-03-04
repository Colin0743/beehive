/**
 * NOWPayments 稳定币支付集成
 * 支持 USDT/USDC 等稳定币支付
 * 环境变量：NOWPAYMENTS_API_KEY, NOWPAYMENTS_IPN_SECRET
 *
 * API 文档: https://documenter.getpostman.com/view/7907941/2s93JwMgmb
 */
import crypto from 'crypto';

const NOWPAYMENTS_API_BASE = 'https://api.nowpayments.io/v1';

function getApiKey(): string {
    const key = process.env.NOWPAYMENTS_API_KEY;
    if (!key) {
        throw new Error('NOWPAYMENTS_API_KEY 未配置');
    }
    return key;
}

function getIpnSecret(): string {
    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!secret) {
        throw new Error('NOWPAYMENTS_IPN_SECRET 未配置');
    }
    return secret;
}

export interface CreateNowPaymentsInvoiceParams {
    /** 金额（美元），精确到小数点两位，例如 0.50 */
    priceAmountUsd: number;
    /** 内部订单号（out_trade_no） */
    orderId: string;
    /** 订单描述 */
    orderDescription: string;
    /** 支付成功后跳转的页面 URL */
    successUrl: string;
    /** 取消支付后跳转的页面 URL */
    cancelUrl: string;
    /** IPN 回调地址 */
    ipnCallbackUrl: string;
}

export interface NowPaymentsInvoice {
    /** NOWPayments 发票 ID */
    invoiceId: string;
    /** 用户支付页面 URL，前端直接跳转 */
    invoiceUrl: string;
}

/**
 * 创建 NOWPayments 发票
 * 用户跳转到 invoice_url 后选择具体的稳定币种和链进行支付
 */
export async function createNowPaymentsInvoice(
    params: CreateNowPaymentsInvoiceParams
): Promise<NowPaymentsInvoice> {
    const apiKey = getApiKey();

    const body = {
        price_amount: params.priceAmountUsd,
        price_currency: 'usd',
        order_id: params.orderId,
        order_description: params.orderDescription,
        ipn_callback_url: params.ipnCallbackUrl,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        // 允许用户在支付页选择具体的稳定币
        is_fixed_rate: false,
        is_fee_paid_by_user: false,
    };

    const res = await fetch(`${NOWPAYMENTS_API_BASE}/invoice`, {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`NOWPayments invoice 创建失败 (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as Record<string, unknown>;

    const invoiceId = data.id as string;
    const invoiceUrl = data.invoice_url as string;

    if (!invoiceId || !invoiceUrl) {
        throw new Error(`NOWPayments 响应格式异常: ${JSON.stringify(data)}`);
    }

    return { invoiceId, invoiceUrl };
}

/**
 * 验证 NOWPayments IPN 回调签名
 *
 * 验证逻辑：
 * 1. 将 body 的 key 按字母序排序
 * 2. JSON.stringify(sorted keys)
 * 3. HMAC-SHA512(sorted_string, IPN_SECRET)
 * 4. 与 x-nowpayments-sig header 比对（hex 编码）
 */
export function verifyNowPaymentsIPN(
    rawBody: Record<string, unknown>,
    signature: string
): boolean {
    try {
        const secret = getIpnSecret();
        // 按 key 字母序排序后重新序列化
        const sortedStr = JSON.stringify(rawBody, Object.keys(rawBody).sort());
        const hmac = crypto.createHmac('sha512', secret);
        hmac.update(sortedStr);
        const computed = hmac.digest('hex');
        // 常量时间比较防止时序攻击
        return crypto.timingSafeEqual(
            Buffer.from(computed, 'hex'),
            Buffer.from(signature, 'hex')
        );
    } catch (err) {
        console.error('[NOWPayments] 签名验证失败:', err);
        return false;
    }
}

/** NOWPayments 支付最终成功的状态 */
export const NOWPAYMENTS_SUCCESS_STATUSES = new Set([
    'finished',
    'confirmed',
    'partially_paid', // 部分支付暂时忽略（根据业务决定是否处理）
]);

export function isNowPaymentsEnabled(): boolean {
    return !!(
        process.env.NOWPAYMENTS_API_KEY &&
        process.env.NOWPAYMENTS_IPN_SECRET
    );
}
