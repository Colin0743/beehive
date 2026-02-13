'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/Logo';

/**
 * 注册页面 - 由于使用邮箱 OTP 登录，注册与登录已合并为同一流程。
 * 此页面引导用户前往登录页，首次登录将自动创建账号。
 */
export default function RegisterPage() {
  const { t } = useTranslation('common');

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

          {/* 引导卡片 */}
          <div className="card p-8 animate-fade-up delay-1">
            {/* 说明信息 */}
            <div className="text-center space-y-4 mb-8">
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
              <p className="text-[var(--text-secondary)] leading-relaxed">
                输入邮箱后，我们会发送一封包含登录链接的邮件。<br />
                点击链接即可登录，首次登录将自动创建账号。
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                无需设置密码，安全又便捷。
              </p>
            </div>

            {/* 前往登录按钮 */}
            <Link
              href="/auth/login"
              className="btn-primary w-full block text-center"
            >
              前往登录
            </Link>

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
