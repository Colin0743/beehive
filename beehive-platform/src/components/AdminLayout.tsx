'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin';
import { useToast } from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  // 权限检查 - 等 loading 完成后再判断
  React.useEffect(() => {
    if (loading) return;
    if (!isLoggedIn || !isAdmin(user)) {
      showToast('error', t('admin.noPermission'));
      router.push('/');
    }
  }, [user, isLoggedIn, loading, router, showToast, t]);

  // loading 中显示深色背景加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">{t('loading')}</div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin(user)) {
    return null;
  }

  const menuItems = [
    { href: '/admin/dashboard', label: t('admin.dashboard'), icon: '📊' },
    { href: '/admin/projects', label: t('admin.projectManagement'), icon: '📁' },
    { href: '/admin/users', label: t('admin.userManagement'), icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-[var(--ink)] relative">
      {/* 电影胶片装饰层 */}
      <div className="film-grain" />

      {/* 顶部导航栏 - 与主站 HeaderSimple 一致的深色风格 */}
      <nav className="sticky top-0 z-50 bg-[var(--ink)]/95 backdrop-blur-md border-b border-[var(--ink-border)]">
        {/* 光晕装饰元素 */}
        <div className="glow" style={{ top: '-300px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/admin/dashboard"
                  className="text-xl font-bold text-[var(--gold)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  🐝 {t('admin.systemTitle')}
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      pathname === item.href
                        ? 'border-[var(--gold)] text-[var(--gold)]'
                        : 'border-transparent nav-link hover:border-[var(--ink-border)]'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="nav-link px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('admin.backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 移动端菜单 - 深色背景 + 金色高亮 */}
      <div className="sm:hidden bg-[var(--ink-lighter)] border-t border-[var(--ink-border)]">
        <div className="pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                pathname === item.href
                  ? 'bg-[var(--gold-muted)] border-[var(--gold)] text-[var(--gold)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--ink-light)] hover:border-[var(--ink-border)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 主内容区域 - 添加淡入动画 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 animate-fade-in relative z-10">
        {children}
      </main>
    </div>
  );
}
