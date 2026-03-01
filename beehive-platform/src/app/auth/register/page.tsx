'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { FormErrors } from '@/types';

export default function RegisterPage() {
  const { t } = useTranslation('common');
  const { signUpWithPassword, verifyOtp } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

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

  const handleRegister = async () => {
    const okEmail = validateEmail();
    const okPassword = validatePassword();
    if (!okEmail || !okPassword) return;

    setLoading(true);
    setErrors({});

    try {
      const displayName = email.trim().split('@')[0] || '用户';
      await signUpWithPassword(email.trim(), password.trim(), displayName);
      showToast('success', '验证码已发送至邮箱，请验证');
      setStep('otp');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('User already registered') || message.includes('already exists')) {
        setErrors({ general: '该邮箱已注册，请直接登录' });
      } else if (message.includes('fetch') || message.includes('network') || message.includes('Failed')) {
        setErrors({ general: '服务暂时不可用，请稍后重试' });
      } else {
        setErrors({ general: message || '注册失败，请稍后重试' });
      }
      showToast('error', '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: '请输入 6 位验证码' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      // 注册后发出的邮件同样可以通过 verifyOtp 验证 (type 传 'signup')
      await verifyOtp(email.trim(), otp.trim(), 'signup');
      showToast('success', '注册验证成功！');
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setErrors({ general: message || '验证码无效或已过期' });
      showToast('error', '验证失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'details') {
      handleRegister();
    } else {
      handleVerifyOtp();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ink)] flex flex-col">
      <div className="film-grain" />

      {/* 顶部导航 */}
      <nav className="p-6">
        <Link href="/">
          <Logo size="medium" />
        </Link>
      </nav>

      {/* 主内容 */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* 标题 */}
          <div className="text-center mb-10 animate-fade-up">
            <h1 className="text-3xl text-[var(--text-primary)] mb-3">
              {t('joinHive', '加入蜂巢')}
            </h1>
            <p className="text-[var(--text-muted)]">
              {t('startJourney', '开始你的创作之旅')}
            </p>
          </div>

          {/* 注册表单 */}
          <div className="card p-8 animate-fade-up delay-1">
            {errors.general && (
              <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                <p>{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 'details' ? (
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {loading ? t('registering', '发送中...') : '发送验证码'}
                  </button>
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
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      setErrors((p) => ({ ...p, otp: undefined, general: undefined }));
                      if (val.length === 6 && !loading) {
                        setTimeout(() => {
                          const btn = document.getElementById('verify-reg-btn');
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

                  <div className="mt-6">
                    <button
                      id="verify-reg-btn"
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify Code & Complete Registration'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="divider my-8" />

            <p className="text-center text-sm text-[var(--text-muted)]">
              {t('hasAccount', '已有账号？')}{' '}
              <Link href="/auth/login" className="text-[var(--gold)] hover:underline">
                {t('loginNow', '立即登录')}
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
