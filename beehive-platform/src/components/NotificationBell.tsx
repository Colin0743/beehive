'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Notification } from '@/types';
import { notificationStorage } from '@/lib/api';

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const { t } = useTranslation('common');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 加载通知数据
  const loadNotifications = async () => {
    const result = await notificationStorage.getNotifications(userId);
    if (result.success && result.data) {
      setNotifications(result.data);
    }
    const countResult = await notificationStorage.getUnreadCount(userId);
    if (countResult.success && countResult.data !== undefined) {
      setUnreadCount(countResult.data);
    }
  };

  useEffect(() => {
    loadNotifications();
    // 定时刷新（每30秒）
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 标记单条已读
  const handleMarkRead = async (notificationId: string) => {
    await notificationStorage.markAsRead(userId, notificationId);
    loadNotifications();
  };

  // 全部已读
  const handleMarkAllRead = async () => {
    for (const n of notifications.filter(n => !n.isRead)) {
      await notificationStorage.markAsRead(userId, n.id);
    }
    loadNotifications();
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 铃铛按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label={t('notifications')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {/* 未读徽章 */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[var(--error)] text-white text-[10px] font-medium flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 下拉通知列表 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto card shadow-2xl animate-scale-in z-50">
          {/* 头部 */}
          <div className="p-4 border-b border-[var(--ink-border)] flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-primary)]">{t('notifications')}</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-[var(--gold)] hover:underline">
                {t('markAllRead')}
              </button>
            )}
          </div>

          {/* 通知列表 */}
          {notifications.length > 0 ? (
            <div>
              {notifications.slice(0, 20).map(notification => (
                <button
                  key={notification.id}
                  onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                  className={`w-full text-left p-4 border-b border-[var(--ink-border)] last:border-0 hover:bg-[var(--ink-lighter)] transition-colors ${!notification.isRead ? 'bg-[var(--gold)]/5' : ''
                    }`}
                >
                  <div className="flex gap-3">
                    {/* 未读指示器 */}
                    <div className="pt-1.5 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${!notification.isRead ? 'bg-[var(--gold)]' : 'bg-transparent'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-xs text-[var(--text-muted)] mt-1 block">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="mx-auto mb-2 opacity-40">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p className="text-sm text-[var(--text-muted)]">{t('noNotifications')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
