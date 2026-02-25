'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import { balanceStorage, rechargeStorage } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getAvailableProviders } from '@/lib/payment-unified';
import { useRegion } from '@/hooks/useRegion';

const AMOUNT_OPTIONS = [
  { cents: 100, label: '¥1' },
  { cents: 500, label: '¥5' },
  { cents: 1000, label: '¥10' },
  { cents: 5000, label: '¥50' },
  { cents: 10000, label: '¥100' },
];

// 支付方式到渠道值的映射
const PROVIDER_CHANNEL_MAP: Record<string, { value: string; labelKey: string }[]> = {
  alipay: [{ value: 'alipay_pc', labelKey: 'paymentChannelAlipayPc' }],
  wechat: [{ value: 'wx_native', labelKey: 'paymentChannelWxNative' }],
  stripe: [{ value: 'stripe', labelKey: 'paymentChannelStripe' }],
  paypal: [{ value: 'paypal', labelKey: 'paymentChannelPaypal' }],
};

const PENDING_ORDER_KEY = 'recharge_pending_out_trade_no';

export default function RechargePage() {
  const { t } = useTranslation('common');
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const region = useRegion();
  const [balance, setBalance] = useState<{ balance_yuan: string; task_publish_fee_yuan: string } | null>(null);
  const [selectedCents, setSelectedCents] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pollingReturn, setPollingReturn] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pollingOutTradeNo, setPollingOutTradeNo] = useState<string | null>(null);

  // 根据区域动态获取可用支付渠道
  const availableProviders = getAvailableProviders();
  const channelOptions = availableProviders.flatMap(
    (p) => PROVIDER_CHANNEL_MAP[p] || []
  );

  // 默认选中第一个可用渠道
  useEffect(() => {
    if (channelOptions.length > 0 && !selectedChannel) {
      setSelectedChannel(channelOptions[0].value);
    }
  }, [channelOptions, selectedChannel]);

  const refreshBalance = useCallback(() => {
    balanceStorage.getBalance().then((r) => {
      if (r.success && r.data) {
        setBalance({
          balance_yuan: r.data.balance_yuan,
          task_publish_fee_yuan: r.data.task_publish_fee_yuan,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (authLoading) return; // 等待认证状态加载完成
    if (!isLoggedIn || !user) {
      router.push('/auth/login');
      return;
    }
    refreshBalance();
  }, [authLoading, isLoggedIn, user, router, refreshBalance]);

  const runPolling = useCallback(
    async (outTradeNo: string) => {
      for (let i = 0; i < 60; i++) {
        const res = await rechargeStorage.getOrderStatus(outTradeNo);
        if (res.success && res.data?.status === 'paid') {
          setMessage({ type: 'success', text: t('paymentReturnSuccess') });
          refreshBalance();
          setPollingReturn(false);
          setQrCodeUrl(null);
          setPollingOutTradeNo(null);
          return;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      setMessage({ type: 'error', text: '支付确认超时，请刷新余额查看' });
      setPollingReturn(false);
    },
    [t, refreshBalance]
  );

  // 支付返回后轮询订单状态（支付宝 return_url 跳回）
  useEffect(() => {
    const returnFlag = searchParams.get('return');
    const outTradeNo = searchParams.get('out_trade_no');
    if (returnFlag !== '1' || !outTradeNo) return;

    localStorage.removeItem(PENDING_ORDER_KEY);
    setPollingReturn(true);
    setMessage({ type: 'success', text: t('paymentReturnPending') });
    runPolling(outTradeNo);
    window.history.replaceState({}, '', '/recharge');
  }, [searchParams, t, runPolling]);

  // 手动返回时：检查 localStorage 中是否有待确认的订单
  useEffect(() => {
    if (authLoading || !isLoggedIn) return;
    const returnFlag = searchParams.get('return');
    if (returnFlag === '1') return; // 已由上方 useEffect 处理

    const pendingNo = localStorage.getItem(PENDING_ORDER_KEY);
    if (!pendingNo) return;

    setPollingReturn(true);
    setMessage({ type: 'success', text: '检测到未完成的充值订单，正在确认支付结果...' });
    runPolling(pendingNo).then(() => {
      localStorage.removeItem(PENDING_ORDER_KEY);
    });
  }, [authLoading, isLoggedIn, searchParams, runPolling]);

  // 微信扫码支付：展示二维码后轮询
  useEffect(() => {
    if (!pollingOutTradeNo || !qrCodeUrl) return;
    runPolling(pollingOutTradeNo);
  }, [pollingOutTradeNo, qrCodeUrl, runPolling]);

  const handleRecharge = async () => {
    if (!selectedCents) {
      setMessage({ type: 'error', text: t('selectAmount') });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const orderRes = await rechargeStorage.createOrder(selectedCents, selectedChannel);
      if (!orderRes.success || !orderRes.data) {
        setMessage({ type: 'error', text: orderRes.error || '创建订单失败' });
        setLoading(false);
        return;
      }
      const { out_trade_no, redirect_url, code_url } = orderRes.data;

      if (redirect_url) {
        // 保存订单号到 localStorage，以便手动返回时恢复轮询
        localStorage.setItem(PENDING_ORDER_KEY, out_trade_no);
        setMessage({ type: 'success', text: t('redirectingToPay') });
        window.location.href = redirect_url;
        return;
      }

      if (code_url) {
        setMessage({ type: 'success', text: t('paymentReturnPending') });
        setPollingReturn(true);
        setQrCodeUrl(code_url);
        setPollingOutTradeNo(out_trade_no);
        setLoading(false);
        return;
      }

      setMessage({ type: 'error', text: '无法获取支付链接，请重试' });
    } catch (err) {
      setMessage({ type: 'error', text: '充值失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isLoggedIn || !user) return null;

  return (
    <LayoutSimple>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl text-[var(--text-primary)] mb-2 animate-fade-up">
          {t('rechargeTitle')}
        </h1>
        <p className="text-[var(--text-muted)] mb-8 animate-fade-up">
          {t('rechargeDesc', { fee: balance?.task_publish_fee_yuan ?? '1.00' })}
        </p>

        {balance && (
          <div className="card p-6 mb-8 animate-fade-up">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">{t('balance')}</span>
              <span className="text-2xl font-semibold text-[var(--gold)]">
                ¥{balance.balance_yuan}
              </span>
            </div>
          </div>
        )}

        <div className="mb-6 animate-fade-up">
          <p className="text-sm text-[var(--text-muted)] mb-4">{t('selectAmount')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMOUNT_OPTIONS.map((opt) => (
              <button
                key={opt.cents}
                type="button"
                onClick={() => setSelectedCents(opt.cents)}
                className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                  selectedCents === opt.cents
                    ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]'
                    : 'border-[var(--ink-border)] hover:border-[var(--gold)]/50 text-[var(--text-primary)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 animate-fade-up">
          <p className="text-sm text-[var(--text-muted)] mb-4">{t('paymentChannel')}</p>
          <div className="flex flex-wrap gap-3">
            {channelOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedChannel(opt.value)}
                className={`py-2 px-4 rounded-lg border-2 transition-colors text-sm ${
                  selectedChannel === opt.value
                    ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]'
                    : 'border-[var(--ink-border)] hover:border-[var(--gold)]/50 text-[var(--text-primary)]'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {qrCodeUrl && (
          <div className="mb-6 p-6 rounded-lg bg-white/5 border border-[var(--ink-border)] text-center animate-fade-up">
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {t('paymentReturnPending')}
            </p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
              alt="WeChat Pay QR Code"
              className="mx-auto w-48 h-48"
            />
            <p className="text-xs text-[var(--text-muted)] mt-4">
              {t('wechatScanQrHint')}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleRecharge}
          disabled={loading || !selectedCents || pollingReturn}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner size="sm" />
              {t('loading')}
            </span>
          ) : pollingReturn ? (
            t('paymentReturnPending')
          ) : (
            t('payNow')
          )}
        </button>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </LayoutSimple>
  );
}
