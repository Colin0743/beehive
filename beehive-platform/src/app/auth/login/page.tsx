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

  const handleLogin = useCallback(async () => {
    const okEmail = validateEmail();
    const okPassword = validatePassword();
    if (!okEmail || !okPassword) return;

    setLoading(true);
    setErrors({});

    try {
      await signInWithPassword(email.trim(), password.trim());
      showToast('success', t('loginSuccess', 'Sign in successful'));
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('Invalid login credentials')) {
        setErrors({ general: t('wrongCredentials', 'Invalid email or password') });
      } else if (message.includes('Email not confirmed')) {
        setErrors({ general: 'Email not verified. Please check your inbox or sign up again.' });
      } else if (message.includes('fetch') || message.includes('network') || message.includes('Failed')) {
        setErrors({ general: 'Service temporarily unavailable, please try again later' });
      } else {
        setErrors({ general: message || 'Login failed, please try again' });
      }
      showToast('error', t('loginFailed', 'Login failed'));
    } finally {
      setLoading(false);
    }
  }, [email, password, router, showToast, signInWithPassword, t]);

  const handleReset = useCallback(async () => {
    if (!validateEmail()) return;
    setResetting(true);
    setErrors({});

    try {
      await sendPasswordReset(email.trim());
      showToast('success', 'Password reset email sent');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('fetch') || message.includes('network') || message.includes('Failed')) {
        setErrors({ general: 'Service temporarily unavailable, please try again later' });
      } else {
        setErrors({ general: message || 'Failed to send, please try again' });
      }
      showToast('error', 'Failed to send, please try again');
    } finally {
      setResetting(false);
    }
  }, [email, sendPasswordReset, showToast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
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
              {t('welcomeBack', 'Welcome Back')}
            </h1>
            <p className="text-[var(--text-muted)]">
              {t('continueJourney', 'Sign in with email and password')}
            </p>
          </div>

          <div className="card p-8 animate-fade-up delay-1">
            {errors.general && (
              <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                <p>{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? t('loggingIn', 'Signing In...') : t('login', 'Sign In')}
                </button>
              </div>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="text-[var(--gold)] hover:underline disabled:opacity-50"
              >
                {resetting ? 'Sending...' : 'Forgot password?'}
              </button>
            </div>

            <div className="divider my-8" />

            <p className="text-center text-sm text-[var(--text-muted)]">
              {t('noAccount', 'Don\'t have an account?')} {' '}
              <Link href="/auth/register" className="text-[var(--gold)] hover:underline">
                {t('registerNow', 'Sign Up')}
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
