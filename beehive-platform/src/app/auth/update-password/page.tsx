'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';

export default function UpdatePasswordPage() {
  const { t } = useTranslation('common');
  const { updatePassword, isLoggedIn, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [authLoading, isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast('error', t('passwordMinLength', '密码至少需要6个字符'));
      return;
    }
    if (password !== confirmPassword) {
      showToast('error', t('passwordMismatch', '两次输入的密码不一致'));
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      showToast('success', '密码修改成功');
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : '修改失败';
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <LayoutSimple>
      <div className="max-w-md mx-auto">
        <div className="card p-8 animate-fade-up">
          <h1 className="text-2xl text-[var(--text-primary)] mb-6 text-center">
            {t('resetPassword', '重置密码')}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('newPassword', '新密码')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder={t('passwordPlaceholder', '请输入新密码')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('confirmPassword', '确认新密码')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                placeholder={t('confirmPasswordPlaceholder', '请再次输入新密码')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? '提交中...' : '确认修改'}
            </button>
          </form>
        </div>
      </div>
    </LayoutSimple>
  );
}
