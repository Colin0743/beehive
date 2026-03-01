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
  const { signInWithPassword, sendPasswordReset, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmail, setShowEmail] = useState(false);
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

  const handleGoogleLogin = () => {
    showToast('info', 'Google Sign In coming soon — credentials pending configuration.');
  };

  const handleAppleLogin = () => {
    showToast('info', 'Apple Sign In coming soon — credentials pending configuration.');
  };


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

            {/* SSO Primary Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.52 5.52 0 01-2.4 3.64v3.01h3.88c2.26-2.09 3.54-5.17 3.54-8.89z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.01a7.16 7.16 0 01-4.05 1.15 7.13 7.13 0 01-6.71-4.92H1.3v3.11A11.99 11.99 0 0012 24z" />
                  <path fill="#FBBC05" d="M5.29 14.31a7.19 7.19 0 010-4.62V6.58H1.3a11.99 11.99 0 000 10.84l3.99-3.11z" />
                  <path fill="#EA4335" d="M12 4.75a6.87 6.87 0 014.86 1.9l3.63-3.63A11.95 11.95 0 0012 0 11.99 11.99 0 001.3 6.58l3.99 3.11A7.13 7.13 0 0112 4.75z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleAppleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-black text-white font-semibold text-sm border border-[#333] hover:bg-[#111] transition-colors"
              >
                <svg width="16" height="20" viewBox="0 0 814 1000" fill="white">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.3-57.8-155.5-127.4C46 376.7 0 249.7 0 129.8c0-58.8 11.5-115.1 35.5-164.1C64.3 38.1 209.2 23 324.5 23c68.1 0 141.6 36.5 191.8 36.5 49.5 0 127.3-41.4 215.4-41.4 34.8 0 138.5 7.1 208.4 108.4zM532.5 23.6C559.5 125.5 498.6 230.2 393.2 272.5c-67.4 26.1-140.9 36.8-211.8 27.6-24.9-3.4-49.7-10-70.9-18.2C139.2 245.2 98.4 184.1 72.3 89.5 88.5 85.9 105.1 84 121.5 84c88.5 0 166.8 62.2 216.6 162.5 26.3-79 88.4-133.5 159.2-133.5 13.3 0 26.1 2 38.2 5.6 39.8 11.8 77 36.5 97 97.5l-.2-1.8 8.7 41.6c-14.4-22.5-37.1-41.7-73.1-53.3a106 106 0 0 0-28.4-3.9z" />
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[var(--ink-border)]" />
              <span className="text-[var(--text-muted)] text-xs">or</span>
              <div className="flex-1 h-px bg-[var(--ink-border)]" />
            </div>
            {/* Email Form: collapsed by default */}
            {!showEmail ? (
              <button
                type="button"
                onClick={() => setShowEmail(true)}
                className="btn-outline w-full !border-[var(--gold)] !text-[var(--gold)] hover:!bg-[var(--gold)] hover:!text-[var(--ink)]"
              >
                Continue with Email
              </button>
            ) : (
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
                  <button
                    type="button"
                    onClick={() => setShowEmail(false)}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] text-center"
                  >
                    Back
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetting}
                    className="text-[var(--gold)] hover:underline disabled:opacity-50"
                  >
                    {resetting ? 'Sending...' : 'Forgot password?'}
                  </button>
                </div>
              </form>
            )}

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
