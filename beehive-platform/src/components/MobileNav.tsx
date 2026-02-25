'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import UserDropdown from './UserDropdown';

const Icons = {
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  folder: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  tasks: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const CATEGORIES = [
  { key: 'film', value: '电影' },
  { key: 'animation', value: '动画' },
  { key: 'commercial', value: '商业制作' },
  { key: 'publicWelfare', value: '公益' },
  { key: 'other', value: '其他' },
];

interface MobileNavProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  initialSearchQuery?: string;
}

export default function MobileNav({ showSearch = true, onSearch, initialSearchQuery = '' }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // 关闭菜单当路由变化
  useEffect(() => {
    setIsOpen(false);
    setShowSearchBar(false);
  }, [pathname]);

  // 防止滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      }
      setShowSearchBar(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  const NavLink = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-manipulation ${
        active 
          ? 'bg-[var(--gold-muted)] text-[var(--gold)]' 
          : 'text-[var(--text-secondary)] hover:bg-[var(--ink-lighter)] hover:text-[var(--text-primary)]'
      }`}
      onClick={() => setIsOpen(false)}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <>
      {/* 移动端导航栏 - 仅在md以下显示 */}
      <div className="md:hidden">
        {/* 顶部栏 */}
        <div className="flex items-center gap-1">
          {/* 搜索按钮 */}
          {showSearch && (
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] transition-colors touch-manipulation"
              aria-label={t('search')}
            >
              {Icons.search}
            </button>
          )}
          
          {/* 通知 */}
          {isLoggedIn && user && <NotificationBell userId={user.id} />}
          
          {/* 登录/头像 - 始终显示在顶部 */}
          {isLoggedIn && user ? (
            <UserDropdown
              user={{ name: user.name || '', email: user.email || '', avatar: user.avatar || '' }}
              onLogout={() => { logout(); router.push('/'); }}
            />
          ) : (
            <Link href="/auth/login" className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] transition-colors touch-manipulation">
              {Icons.user}
            </Link>
          )}
          
          {/* 汉堡菜单按钮 */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] transition-colors touch-manipulation"
            aria-label={t('menu')}
          >
            {Icons.menu}
          </button>
        </div>

        {/* 搜索栏展开 */}
        {showSearchBar && (
          <div className="absolute left-0 right-0 top-full bg-[var(--ink)] border-b border-[var(--ink-border)] p-4 animate-fade-in z-50">
            <form onSubmit={handleSearch} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 pr-4"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* 侧滑菜单遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 侧滑菜单 */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-[var(--ink-light)] z-[101] transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 菜单头部 */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--ink-border)]">
            <Logo size="small" />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] transition-colors touch-manipulation"
              aria-label={t('close')}
            >
              {Icons.close}
            </button>
          </div>

          {/* 导航链接 */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <NavLink href="/" icon={Icons.home} label={t('home')} active={pathname === '/'} />
            <NavLink href="/projects" icon={Icons.folder} label={t('allProjects')} active={pathname === '/projects'} />
            <NavLink href="/tasks" icon={Icons.tasks} label={t('taskHall')} active={pathname === '/tasks'} />
            
            {isLoggedIn && (
              <NavLink href="/projects/new" icon={Icons.plus} label={t('startCreating')} />
            )}

            {/* 分类 */}
            <div className="pt-4 mt-4 border-t border-[var(--ink-border)]">
              <p className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {t('projectCategories')}
              </p>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.key}
                  href={`/projects?category=${cat.key}`}
                  className="flex items-center px-4 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] rounded-lg transition-colors touch-manipulation"
                  onClick={() => setIsOpen(false)}
                >
                  {t(cat.key)}
                </Link>
              ))}
            </div>
          </nav>

          {/* 底部 */}
          <div className="p-4 border-t border-[var(--ink-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">{t('language')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
