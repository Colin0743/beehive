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
      newErrors.email = t('emailRequired', 'Email address is required');
    } else if (!emailRegex.test(email)) {
      newErrors.email = t('invalidEmail', 'Invalid email address');
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: FormErrors = {};
    if (!password.trim()) {
      newErrors.password = t('passwordRequired', 'Password is required');
    } else if (password.trim().length < 6) {
      newErrors.password = t('passwordMinLength', 'Password must be at least 6 characters');
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
      const displayName = email.trim().split('@')[0] || 'User';
      await signUpWithPassword(email.trim(), password.trim(), displayName);
      showToast('success', 'Verification code sent to email. Please verify.');
      setStep('otp');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('User already registered') || message.includes('already exists')) {
        setErrors({ general: 'Email already registered. Please sign in.' });
      } else if (message.includes('fetch') || message.includes('network') || message.includes('Failed')) {
        setErrors({ general: 'Service temporarily unavailable, please try again later' });
      } else if (message.includes('rate limit')) {
        setErrors({ general: 'Rate limit exceeded. Please wait a few minutes before trying again.' });
      } else {
        setErrors({ general: message || 'Registration failed, please try again later' });
      }
      showToast('error', 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter 6-digit code' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      // 注册后发出的邮件同样可以通过 verifyOtp 验证 (type 传 'signup')
      await verifyOtp(email.trim(), otp.trim(), 'signup');
      showToast('success', 'Registration verified successfully!');
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setErrors({ general: message || 'Invalid or expired verification code' });
      showToast('error', 'Verification failed');
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
              {t('joinHive', 'Join Bee Studio AI')}
            </h1>
            <p className="text-[var(--text-muted)]">
              {t('startJourney', 'Start your AI video creation journey')}
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
                      {t('email', 'Email Address')}
                    </label>
                    <input
                      type="email"
                      placeholder={t('emailPlaceholder', 'Enter your email')}
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
                      {t('password', 'Password')}
                    </label>
                    <input
                      type="password"
                      placeholder={t('passwordPlaceholder', 'Enter your password')}
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
                    {loading ? t('registering', 'Sending...') : 'Send Verification Code'}
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
              {t('hasAccount', 'Already have an account?')} {' '}
              <Link href="/auth/login" className="text-[var(--gold)] hover:underline">
                {t('loginNow', 'Sign In')}
              </Link>
            </p>
          </div>

          <p className="text-center mt-8 animate-fade-up delay-2">
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {t('backToHome', 'Back to Home')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
