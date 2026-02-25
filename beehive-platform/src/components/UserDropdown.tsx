'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { balanceStorage } from '@/lib/api';
import FeedbackModal from '@/components/FeedbackModal';

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
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [balanceYuan, setBalanceYuan] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    balanceStorage.getBalance().then((r) => {
      if (r.success && r.data) setBalanceYuan(r.data.balance_yuan);
    });
  }, [isOpen, isMobileSheetOpen]);

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
    setIsMobileSheetOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    setIsMobileSheetOpen(false);
    onLogout();
  };

  // 移动端点击处理
  const handleAvatarClick = useCallback(() => {
    if (isMobile) {
      setIsMobileSheetOpen(true);
    }
  }, [isMobile]);

  // 关闭半屏菜单
  const closeMobileSheet = useCallback(() => {
    setIsMobileSheetOpen(false);
  }, []);

  // 头像加载失败降级
  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/default-avatar.svg';
  };

  return (
    <>
    <div className="relative" onMouseEnter={!isMobile ? handleMouseEnter : undefined} onMouseLeave={!isMobile ? handleMouseLeave : undefined}>
      {/* Trigger Area：头像 + 名称 */}
      <button className="flex items-center gap-2 nav-link" onClick={handleAvatarClick}>
        <img
          src={user?.avatar || '/default-avatar.svg'}
          alt=""
          className="w-8 h-8 rounded-full border border-[var(--ink-border)]"
          onError={handleAvatarError}
        />
        <span className="hidden lg:inline">{user?.name || ''}</span>
      </button>

      {/* 桌面端下拉面板 */}
      {!isMobile && isOpen && (
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

          {/* 问题反馈 */}
          <div className="py-1">
            <button
              onClick={() => { setIsOpen(false); setFeedbackOpen(true); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--ink-lighter)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {t('feedback.entry')}
            </button>
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

    {/* 移动端半屏菜单 */}
    {isMobile && isMobileSheetOpen && (
      <>
        {/* 遮罩层 */}
        <div 
          className="fixed inset-0 bg-black/60 z-[200] animate-fade-in"
          onClick={closeMobileSheet}
        />
        {/* 半屏菜单 */}
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--ink-light)] rounded-t-2xl z-[201] animate-slide-up max-h-[70vh] overflow-y-auto">
          {/* 拖拽条 */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-[var(--ink-border)] rounded-full" />
          </div>
          
          {/* 用户信息区 */}
          <div className="px-6 pb-4 flex items-center gap-4 border-b border-[var(--ink-border)]">
            <img
              src={user?.avatar || '/default-avatar.svg'}
              alt=""
              className="w-14 h-14 rounded-full border-2 border-[var(--ink-border)] flex-shrink-0"
              onError={handleAvatarError}
            />
            <div className="min-w-0">
              <p className="text-lg font-medium text-[var(--text-primary)] truncate">
                {user?.name || ''}
              </p>
              <p className="text-sm text-[var(--text-muted)] truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>

          {/* 余额区 */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--ink-border)]">
            <span className="text-base text-[var(--text-muted)]">{t('balance')}</span>
            <span className="text-xl font-semibold text-[var(--gold)]">
              ¥{balanceYuan ?? '0.00'}
            </span>
          </div>
          <Link
            href="/recharge"
            onClick={handleLinkClick}
            className="flex items-center justify-center gap-2 mx-6 my-4 py-3 rounded-xl bg-[var(--gold)] text-[var(--ink)] font-medium text-base"
          >
            {t('userDropdown.recharge')}
          </Link>

          {/* 快捷链接区 */}
          <div className="px-4 py-2">
            <Link
              href="/profile"
              onClick={handleLinkClick}
              className="flex items-center gap-4 px-4 py-4 text-base text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] rounded-xl transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {t('userDropdown.profile')}
            </Link>
            <Link
              href="/my-projects"
              onClick={handleLinkClick}
              className="flex items-center gap-4 px-4 py-4 text-base text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] rounded-xl transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              {t('userDropdown.myProjects')}
            </Link>
          </div>

          {/* 问题反馈 */}
          <div className="px-4 py-2 border-t border-[var(--ink-border)]">
            <button
              onClick={() => { closeMobileSheet(); setFeedbackOpen(true); }}
              className="w-full flex items-center gap-4 px-4 py-4 text-base text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] rounded-xl transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {t('feedback.entry')}
            </button>
          </div>

          {/* 退出登录区 */}
          <div className="px-4 py-4 border-t border-[var(--ink-border)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 text-base text-[var(--error)] hover:bg-[var(--ink-lighter)] rounded-xl transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {t('userDropdown.logout')}
            </button>
          </div>

          {/* 底部安全区域 */}
          <div className="h-6" />
        </div>
      </>
    )}

    {/* 反馈模态框 */}
    <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
