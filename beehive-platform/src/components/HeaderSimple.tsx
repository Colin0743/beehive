'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from './Logo';

// Figma 设计的按钮组件
function Button({ 
  children, 
  variant = "primary", 
  size = "medium",
  onClick,
  className = ""
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "secondary" | "text";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  className?: string;
}) {
  const baseStyles = "font-semibold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = {
    primary: "bg-[#FFD700] text-[#111827] hover:bg-[#E6C200] shadow-sm",
    secondary: "bg-transparent border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFF9E6]",
    text: "bg-transparent text-[#4A90E2] hover:underline",
  };
  const sizeStyles = {
    small: "h-9 px-4 text-sm",
    medium: "h-11 px-6 text-sm",
    large: "h-[52px] px-8 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function HeaderContent() {
  const { user, isLoggedIn, logout } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 跳转到搜索结果页面
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { key: 'all', label: t('all') },
    { key: 'sciFi', label: t('sciFi') },
    { key: 'animation', label: t('animation') },
    { key: 'documentary', label: t('documentary') },
    { key: 'education', label: t('education') },
    { key: 'other', label: t('other') },
  ];
  
  const currentCategoryKey = searchParams.get('category') || 'all';
  const currentCategory = categories.find(cat => 
    (cat.key === 'all' && (currentCategoryKey === 'all' || currentCategoryKey === '全部')) ||
    (cat.key === 'sciFi' && (currentCategoryKey === 'sciFi' || currentCategoryKey === '科幻')) ||
    (cat.key === 'animation' && (currentCategoryKey === 'animation' || currentCategoryKey === '动画')) ||
    (cat.key === 'documentary' && (currentCategoryKey === 'documentary' || currentCategoryKey === '纪录片')) ||
    (cat.key === 'education' && (currentCategoryKey === 'education' || currentCategoryKey === '教育')) ||
    (cat.key === 'other' && (currentCategoryKey === 'other' || currentCategoryKey === '其他'))
  ) || categories[0];

  const handleCategoryClick = (categoryKey: string) => {
    if (categoryKey === 'all') {
      router.push('/');
    } else {
      router.push(`/?category=${categoryKey}`);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50">
      {/* Navigation - 完全按照 Figma 设计 */}
      <nav className="border-b border-neutral-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Left: Logo */}
            <Link href="/">
              <Logo size="medium" />
            </Link>

            {/* Center: Search */}
            <div className="flex-1 max-w-[600px] mx-8">
              <form onSubmit={handleSearch} className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </form>
            </div>

            {/* Right: Links and Button */}
            <div className="flex items-center gap-6">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                    <img src={user?.avatar || '/default-avatar.svg'} alt={user?.name} className="w-8 h-8 rounded-full border-2 border-neutral-200" />
                    <span>{user?.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                    {t('logout')}
                  </button>
                  <Link href="/projects/new">
                    <Button variant="primary" size="medium">{t('startCreating')}</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                    {t('login')}
                  </Link>
                  <Link href="/auth/register" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                    {t('register')}
                  </Link>
                  <Link href="/projects/new">
                    <Button variant="primary" size="medium">{t('startCreating')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Category Tabs - 完全按照 Figma 设计（仅在首页显示） */}
      {pathname === '/' && (
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex gap-8 h-12">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryClick(category.key)}
                  className={`relative text-sm transition-colors ${
                    currentCategory.key === category.key
                      ? "text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {category.label}
                  {currentCategory.key === category.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default function HeaderSimple() {
  return (
    <Suspense fallback={
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="medium" />
            <div className="text-neutral-500 text-sm">Loading...</div>
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
}
