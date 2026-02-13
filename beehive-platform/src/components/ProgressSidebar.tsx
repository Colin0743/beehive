'use client';

import { useTranslation } from 'react-i18next';
import { Project, Task } from '@/types';
import { useState, useRef, useEffect } from 'react';
import InlineEditText from './InlineEditText';
import { validateTelegramGroup } from '@/lib/validators';

interface ProgressSidebarProps {
  project: Project;
  tasks: Task[];
  achievementsCount: number;
  canEdit: boolean;
  onFieldSave: (field: string, value: any) => Promise<boolean>;
}

export default function ProgressSidebar({
  project,
  tasks,
  achievementsCount,
  canEdit,
  onFieldSave
}: ProgressSidebarProps) {
  const { t } = useTranslation('common');
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(project.currentDuration);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // 同步外部变化
  useEffect(() => {
    setLocalValue(project.currentDuration);
  }, [project.currentDuration]);
  
  // 计算进度百分比
  const progress = Math.min((localValue / project.targetDuration) * 100, 100);
  
  // 计算已完成任务数
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;

  // 处理拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canEdit) return;
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateValue(e.clientX);
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;
    setIsDragging(false);
    // 保存到后端
    await onFieldSave('currentDuration', localValue);
  };

  const updateValue = (clientX: number) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = Math.round(percent * project.targetDuration);
    setLocalValue(newValue);
  };

  // 键盘方向键支持
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!canEdit) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(localValue + 1, project.targetDuration);
      setLocalValue(newValue);
      await onFieldSave('currentDuration', newValue);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(localValue - 1, 0);
      setLocalValue(newValue);
      await onFieldSave('currentDuration', newValue);
    }
  };

  // 全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, localValue]);

  return (
    <div className="space-y-6">
      {/* 进度卡片 */}
      <div className="card p-6 border-2 border-[var(--gold)] animate-fade-up">
        <div className="mb-6">
          {/* Target seconds 和 Current seconds 同一行 */}
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <div className="flex items-baseline gap-1 text-sm text-[var(--text-muted)]">
              <span>{t('target')}</span>
              <span className="text-[var(--text-primary)]">{project.targetDuration}</span>
              <span>{t('seconds')}</span>
            </div>
            <div className="flex items-baseline gap-1 text-sm">
              <span className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                {localValue}
              </span>
              <span className="text-[var(--text-muted)]">{t('seconds')}</span>
            </div>
          </div>
          
          {/* 可拖动进度条 */}
          <div
            ref={progressBarRef}
            className={`progress-track mb-2 relative ${canEdit ? 'cursor-pointer' : ''}`}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            tabIndex={canEdit ? 0 : -1}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={project.targetDuration}
            aria-valuenow={localValue}
            style={{ overflow: 'visible' }}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            {/* 小黄点指示器 */}
            <div 
              className="absolute top-1/2 w-4 h-4 rounded-full bg-[#FFD700] shadow-lg transition-all pointer-events-none"
              style={{ 
                left: `${progress}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 12px rgba(255, 215, 0, 0.8)',
                zIndex: 10
              }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {progress.toFixed(1)}% {t('completedStatus')}
          </p>
        </div>
        
        {/* 视觉分隔符 */}
        <div className="divider mb-4" />
        
        {/* 任务完成统计 */}
        <div className="flex justify-between text-sm mb-3">
          <span className="text-[var(--text-muted)]">{t('tasks')}</span>
          <span className="text-[var(--text-primary)]">
            {completedTasksCount} / {tasks.length}
          </span>
        </div>
        
        {/* 成就数量 */}
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">{t('achievements')}</span>
          <span className="text-[var(--text-primary)]">{achievementsCount}</span>
        </div>
      </div>

      {/* Telegram 群组链接卡片 */}
      <div className="card p-6 animate-fade-up delay-1">
        <div className="flex items-center gap-2 mb-3">
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="text-[var(--text-muted)]"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          <span className="text-sm text-[var(--text-muted)]">Telegram</span>
        </div>
        <InlineEditText
          value={project.telegramGroup || ''}
          onSave={(v) => onFieldSave('telegramGroup', v)}
          canEdit={canEdit}
          placeholder="https://t.me/your_group"
          validate={validateTelegramGroup}
        />
      </div>
    </div>
  );
}
