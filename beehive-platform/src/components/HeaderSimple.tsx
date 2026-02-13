'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/NotificationBell';
import UserDropdown from '@/components/UserDropdown';
import Logo from './Logo';

function HeaderContent() {
  const { user, isLoggedIn, logout } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--ink)]/95 backdrop-blur-md border-b border-[var(--ink-border)]">
      <div className="container">
        <div className="h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="medium" />
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {isLoggedIn && user && <NotificationBell userId={user.id} />}
            {isLoggedIn ? (
              <>
                <UserDropdown
                  user={{ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' }}
                  onLogout={() => { logout(); router.push('/'); }}
                />
                <Link href="/projects/new">
                  <button className="btn-primary">{t('startCreating')}</button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="nav-link">{t('login')}</Link>
                <Link href="/auth/register">
                  <button className="btn-primary">{t('register')}</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function HeaderSimple() {
  return (
    <Suspense fallback={
      <nav className="sticky top-0 z-50 bg-[var(--ink)] border-b border-[var(--ink-border)]">
        <div className="container h-16 flex items-center">
          <Logo size="medium" />
        </div>
      </nav>
    }>
      <HeaderContent />
    </Suspense>
  );
}
