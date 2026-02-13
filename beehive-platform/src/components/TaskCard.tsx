'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  projectId: string;
  projectName?: string;
  projectCategory?: string;
  isCreator: boolean;
  isLoggedIn: boolean;
  currentUserId?: string;
  hasAccepted?: boolean;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onPublish?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
}

// 相对时间格式化辅助函数
export function getRelativeTime(dateStr: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return t('justNow');
  if (diffMinutes < 60) return t('minutesAgo', { count: diffMinutes });
  if (diffHours < 24) return t('hoursAgo', { count: diffHours });
  if (diffDays < 30) return t('daysAgo', { count: diffDays });
  return t('longAgo');
}

// 状态标签颜色映射
const statusStyles: Record<string, string> = {
  draft: 'bg-[var(--ink-lighter)] text-[var(--text-muted)]',
  published: 'bg-[var(--gold)]/15 text-[var(--gold)]',
  completed: 'bg-emerald-500/15 text-emerald-400',
};

export default function TaskCard({
  task, projectId, projectName, projectCategory,
  isCreator, isLoggedIn, currentUserId, hasAccepted,
  onClick, onEdit, onDelete, onPublish, onComplete,
}: TaskCardProps) {
  const { t } = useTranslation('common');

  const firstImage = task.referenceImages?.[0];
  const hasImages = task.referenceImages && task.referenceImages.length > 0;

  return (
    <div 
      className={`card overflow-hidden animate-fade-up hover:border-[var(--gold-muted)] transition-all ${onClick ? 'cursor-pointer' : ''}`}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick(task);
        }
      }}
    >
      {/* 横向布局：左侧图片 + 右侧内容 */}
      <div className="flex flex-col sm:flex-row">
        {/* 左侧：参考图片 */}
        {hasImages && (
          <div className="sm:w-48 sm:flex-shrink-0 relative group">
            <div className="aspect-video sm:aspect-square w-full h-full overflow-hidden">
              <img 
                src={firstImage} 
                alt="Task reference" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {task.referenceImages!.length > 1 && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs">
                  +{task.referenceImages!.length - 1}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 右侧：任务详情 */}
        <div className="flex-1 p-4 flex flex-col">
          {/* 顶部：状态标签 + 完成标记 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[task.status]}`}>
                {t(`task${task.status.charAt(0).toUpperCase() + task.status.slice(1)}`)}
              </span>
              {projectName && (
                <span className="text-xs text-[var(--text-muted)]">{projectName}</span>
              )}
              {projectCategory && (
                <span className="tag text-xs">{projectCategory}</span>
              )}
            </div>
            {task.status === 'completed' && task.contributorName && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {task.contributorName}
              </span>
            )}
          </div>

          {/* 提示词 */}
          <p className="text-[var(--text-primary)] text-base leading-relaxed mb-3 truncate flex-1">
            {task.prompt}
          </p>

          {/* 元信息：时间 + 时长 */}
          <div className="flex items-center gap-4 mb-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {getRelativeTime(task.createdAt, t)}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[var(--gold)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              {task.duration}{t('seconds')}
            </span>
          </div>

          {/* 操作按钮 - 创建者：Edit/Complete/Delete 并排；非创建者：查看/已接受 */}
          <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto" onClick={(e) => e.stopPropagation()}>
            {isCreator ? (
              <>
                {onEdit && (
                  <button onClick={() => onEdit(task)} className="btn-secondary h-7 px-2.5 text-[11px] whitespace-nowrap flex-shrink-0">
                    {t('edit')}
                  </button>
                )}
                {task.status === 'draft' && onPublish && (
                  <button onClick={() => onPublish(task.id)} className="btn-primary h-7 px-2.5 text-[11px] whitespace-nowrap flex-shrink-0">
                    {t('publishTask')}
                  </button>
                )}
                {task.status === 'published' && onComplete && (
                  <button onClick={() => onComplete(task.id)} className="btn-primary h-7 px-2.5 text-[11px] whitespace-nowrap flex-shrink-0">
                    {t('completeTaskShort')}
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(task.id)} className="h-7 px-2.5 text-[11px] text-[var(--error)] hover:bg-[var(--error)]/10 rounded-[var(--radius-md)] transition-colors whitespace-nowrap flex-shrink-0">
                    {t('delete')}
                  </button>
                )}
              </>
            ) : (
              task.status === 'published' && (
                <span
                  className={`inline-flex items-center justify-center h-7 px-2.5 text-[11px] rounded-[var(--radius-md)] flex-shrink-0 whitespace-nowrap ${
                    hasAccepted
                      ? 'bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30'
                      : 'bg-[var(--ink-lighter)] text-[var(--text-muted)]'
                  }`}
                >
                  {hasAccepted ? t('taskAccepted') : t('view')}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
