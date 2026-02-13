'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { balanceStorage } from '@/lib/api';

interface UserDropdownProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onLogout: () => void;
}

export default function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [balanceYuan, setBalanceYuan] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    balanceStorage.getBalance().then((r) => {
      if (r.success && r.data) setBalanceYuan(r.data.balance_yuan);
    });
  }, [isOpen]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  // 头像加载失败降级
  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/default-avatar.svg';
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Trigger Area：头像 + 名称 */}
      <button className="flex items-center gap-2 nav-link">
        <img
          src={user?.avatar || '/default-avatar.svg'}
          alt=""
          className="w-8 h-8 rounded-full border border-[var(--ink-border)]"
          onError={handleAvatarError}
        />
        <span className="hidden lg:inline">{user?.name || ''}</span>
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 card shadow-2xl animate-scale-in z-50">
          {/* 用户信息区 */}
          <div className="p-4 flex items-center gap-3">
            <img
              src={user?.avatar || '/default-avatar.svg'}
              alt=""
              className="w-10 h-10 rounded-full border border-[var(--ink-border)] flex-shrink-0"
              onError={handleAvatarError}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user?.name || ''}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>

          {/* 余额区 */}
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">{t('balance')}</span>
            <span className="text-sm font-medium text-[var(--gold)]">
              ¥{balanceYuan ?? '0.00'}
            </span>
          </div>
          <Link
            href="/recharge"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--gold)] hover:bg-[var(--ink-lighter)] transition-colors"
          >
            {t('userDropdown.recharge')}
          </Link>

          {/* 分隔线 */}
          <div className="border-t border-[var(--ink-border)]" />

          {/* 快捷链接区 */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--ink-lighter)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {t('userDropdown.profile')}
            </Link>
            <Link
              href="/my-projects"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--ink-lighter)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              {t('userDropdown.myProjects')}
            </Link>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-[var(--ink-border)]" />

          {/* 退出登录区 */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--ink-lighter)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {t('userDropdown.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
