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
  const { signInWithPassword, sendPasswordReset, isLoggedIn, signInWithGoogle } = useAuth();
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

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      showToast('error', message || 'Google Sign In failed');
    }
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
