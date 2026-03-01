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
  const { signInWithPassword, sendPasswordReset, sendMagicLink, verifyOtp, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  // 已登录则跳转首页
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const validateEmail = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = t('emailRequired', '请输入邮箱地址');
    } else if (!emailRegex.test(email)) {
      newErrors.email = t('invalidEmail', '邮箱格式不正确');
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: FormErrors = {};
    if (!password.trim()) {
      newErrors.password = t('passwordRequired', '请输入密码');
    } else if (password.trim().length < 6) {
      newErrors.password = t('passwordMinLength', '密码至少需要6个字符');
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = useCallback(async () => {
    const okEmail = validateEmail();
    const okPassword = validatePassword();
    if (!okEmail || !okPassword) return;

    setLoading(true);
    setErrors({});

    try {
      await signInWithPassword(email.trim(), password.trim());
      showToast('success', t('loginSuccess', '登录成功'));
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('Invalid login credentials')) {
        setErrors({ general: t('wrongCredentials', '邮箱或密码错误') });
      } else if (message.includes('Email not confirmed')) {
        setErrors({ general: '邮箱未验证，请重新注册或通过验证码登录' });
      } else if (message.includes('fetch') || message.includes('network') || message.includes('Failed')) {
        setErrors({ general: '服务暂时不可用，请稍后重试' });
      } else {
        setErrors({ general: message || '登录失败，请稍后重试' });
      }
      showToast('error', t('loginFailed', '登录失败'));
    } finally {
      setLoading(false);
    }
  }, [email, password, router, showToast, signInWithPassword, t]);

  const handleSendOtp = useCallback(async () => {
    if (!validateEmail()) return;
    setLoading(true);
    setErrors({});
    try {
      await sendMagicLink(email.trim());
      showToast('success', '验证码已发送至邮箱');
      setStep('otp');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setErrors({ general: message || '发送验证码失败' });
      showToast('error', '发送验证码失败');
    } finally {
      setLoading(false);
    }
  }, [email, sendMagicLink, showToast, validateEmail]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== 6) {
      setErrors({ otp: '请输入 6 位验证码' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await verifyOtp(email.trim(), otp.trim(), 'magiclink');
      showToast('success', '验证成功并登录');
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setErrors({ general: message || '验证码无效或已过期' });
      showToast('error', '验证失败');
    } finally {
      setLoading(false);
    }
  }, [email, otp, router, showToast, verifyOtp]);

  const handleReset = useCallback(async () => {
    if (!validateEmail()) return;
    setResetting(true);
    setErrors({});

    try {
      await sendPasswordReset(email.trim());
      showToast('success', '重置密码邮件已发送');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('fetch') || message.includes('network') || message.includes('Failed')) {
        setErrors({ general: '服务暂时不可用，请稍后重试' });
      } else {
        setErrors({ general: message || '发送失败，请稍后重试' });
      }
      showToast('error', '发送失败，请稍后重试');
    } finally {
      setResetting(false);
    }
  }, [email, sendPasswordReset, showToast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'email') {
      handleLogin();
    } else {
      handleVerifyOtp();
    }
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
              {t('continueJourney', '使用邮箱和密码登录')}
            </p>
          </div>

          <div className="card p-8 animate-fade-up delay-1">
            {errors.general && (
              <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                <p>{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 'email' ? (
                <>
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
                        setErrors((p) => ({ ...p, email: undefined, general: undefined }));
                      }}
                      className={`input ${errors.email ? 'input-error' : ''}`}
                      autoFocus
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-2">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      {t('password', '密码')}
                    </label>
                    <input
                      type="password"
                      placeholder={t('passwordPlaceholder', '请输入密码')}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((p) => ({ ...p, password: undefined, general: undefined }));
                      }}
                      className={`input ${errors.password ? 'input-error' : ''}`}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-400 mt-2">{errors.password}</p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Enter Verification Code
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-4">
                    A 6-digit code has been sent to <span className="text-[var(--text-primary)] font-medium">{email}</span>
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      // 仅允许输入数字
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      setErrors((p) => ({ ...p, otp: undefined, general: undefined }));
                      // 如果粘贴了 6 位数字，自动提交 (可选体验优化)
                      if (val.length === 6 && !loading) {
                        // setTimeout to let state update
                        setTimeout(() => {
                          const btn = document.getElementById('verify-btn');
                          btn?.click();
                        }, 100);
                      }
                    }}
                    className={`input text-center text-2xl tracking-[0.5em] font-mono ${errors.otp ? 'input-error' : ''}`}
                    autoFocus
                  />
                  {errors.otp && (
                    <p className="text-xs text-red-400 mt-2 text-center">{errors.otp}</p>
                  )}
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-xs text-[var(--gold)] hover:underline"
                    >
                      Back to Email / Password
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('password', '密码')}
                </label>
                <input
                  type="password"
                  placeholder={t('passwordPlaceholder', '请输入密码')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: undefined, general: undefined }));
                  }}
                  className={`input ${errors.password ? 'input-error' : ''}`}
                />
                {errors.password && (
                  <p className="text-xs text-red-400 mt-2">{errors.password}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {step === 'email' ? (
                  <>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {loading ? t('loggingIn', '登录中...') : t('login', '登录')}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendOtp}
                      className="btn-outline w-full disabled:opacity-50 !border-[var(--gold)] !text-[var(--gold)] hover:!bg-[var(--gold)] hover:!text-[var(--ink)]"
                    >
                      {loading ? '发送中...' : '使用验证码登录 (Log in with OTP)'}
                    </button>
                  </>
                ) : (
                  <button
                    id="verify-btn"
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="text-[var(--gold)] hover:underline disabled:opacity-50"
              >
                {resetting ? '发送中...' : '忘记密码'}
              </button>
            </div>

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
