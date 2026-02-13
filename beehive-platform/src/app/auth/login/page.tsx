'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { FormErrors } from '@/types';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const { t } = useTranslation('common');
  const { sendMagicLink, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  // 发送成功后显示提示界面
  const [sent, setSent] = useState(false);

  // 已登录则跳转首页
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  // 验证邮箱格式
  const validateEmail = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = t('emailRequired', '请输入邮箱地址');
    } else if (!emailRegex.test(email)) {
      newErrors.email = t('invalidEmail', '邮箱格式不正确');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 发送 Magic Link
  const handleSendLink = useCallback(async () => {
    if (!validateEmail()) return;

    setSending(true);
    setErrors({});

    try {
      await sendMagicLink(email.trim());
      setSent(true);
      showToast('success', '登录链接已发送到您的邮箱');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('fetch') || message.includes('network') || message.includes('Failed')) {
        setErrors({ general: '服务暂时不可用，请稍后重试' });
      } else {
        setErrors({ general: message || '发送失败，请稍后重试' });
      }
      showToast('error', '发送失败，请稍后重试');
    } finally {
      setSending(false);
    }
  }, [email, sendMagicLink, showToast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendLink();
  };

  // 返回重新输入邮箱
  const handleBack = () => {
    setSent(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[var(--ink)] flex flex-col">
      <div className="film-grain" />

      <nav className="p-6">
        <Link href="/">
          <Logo size="medium" />
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 animate-fade-up">
            <h1 className="text-3xl text-[var(--text-primary)] mb-3">
              {t('welcomeBack', '欢迎回来')}
            </h1>
            <p className="text-[var(--text-muted)]">
              {sent
                ? '请查看您的邮箱'
                : t('continueJourney', '输入邮箱，我们会发送登录链接')}
            </p>
          </div>

          <div className="card p-8 animate-fade-up delay-1">
            {errors.general && (
              <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                <p>{errors.general}</p>
                {errors.general.includes('服务暂时不可用') && (
                  <button
                    type="button"
                    onClick={handleSendLink}
                    className="mt-2 text-[var(--gold)] hover:underline text-sm"
                  >
                    点击重试
                  </button>
                )}
              </div>
            )}

            {!sent ? (
              /* 输入邮箱 */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {t('email', '邮箱地址')}
                  </label>
                  <input
                    type="email"
                    placeholder={t('emailPlaceholder', '请输入您的邮箱')}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    autoFocus
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-2">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {sending ? '发送中...' : '发送登录链接'}
                </button>
              </form>
            ) : (
              /* 发送成功提示 */
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[var(--gold)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] mb-2">
                    登录链接已发送至
                  </p>
                  <p className="text-[var(--gold)] font-medium">{email}</p>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  请打开邮箱，点击邮件中的链接即可登录。<br />
                  如未收到，请检查垃圾邮件文件夹。
                </p>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSendLink}
                    disabled={sending}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {sending ? '发送中...' : '重新发送'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    ← 更换邮箱
                  </button>
                </div>
              </div>
            )}

            <div className="divider my-8" />

            <p className="text-center text-sm text-[var(--text-muted)]">
              {t('noAccount', '还没有账号？')}{' '}
              <Link href="/auth/register" className="text-[var(--gold)] hover:underline">
                {t('registerNow', '立即注册')}
              </Link>
            </p>
          </div>

          <p className="text-center mt-8 animate-fade-up delay-2">
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {t('backToHome', '返回首页')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
