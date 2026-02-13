'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '@/types';
import { useToast } from '@/components/Toast';

interface TaskDetailModalProps {
  task: Task;
  projectName: string;
  projectCategory: string;
  isCreator: boolean;
  isLoggedIn: boolean;
  hasAccepted: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onPublish: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onAccept: (task: Task) => void;
}

export default function TaskDetailModal({
  task,
  projectName,
  projectCategory,
  isCreator,
  isLoggedIn,
  hasAccepted,
  onClose,
  onEdit,
  onDelete,
  onPublish,
  onComplete,
  onAccept,
}: TaskDetailModalProps) {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  // 下载全部参考图片 - 加入浏览器下载队列
  const handleDownloadAll = async () => {
    if (!task.referenceImages?.length) return;
    setDownloading(true);
    try {
      const blobs = await Promise.all(
        task.referenceImages.map((url) => fetch(url).then((r) => r.blob()))
      );
      blobs.forEach((blob, i) => {
        const url = task.referenceImages![i];
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `task-ref-${i + 1}.${url.includes('png') ? 'png' : 'jpg'}`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
      showToast('success', t('downloadAllImages'));
    } catch {
      showToast('error', t('copyFailed'));
    } finally {
      setDownloading(false);
    }
  };

  // 复制邮箱并接受任务
  const handleCopyEmailAndAccept = async () => {
    try {
      await navigator.clipboard.writeText(task.creatorEmail);
      showToast('success', t('copiedToClipboard', { label: t('creatorEmail') }));
      onAccept(task);
    } catch {
      showToast('error', t('copyFailed'));
    }
  };

  // 通用复制处理函数
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', t('copiedToClipboard', { label }));
    } catch (error) {
      showToast('error', t('copyFailed'));
    }
  };

  // 打开弹窗时阻止背景滚动，关闭时恢复
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ESC 键关闭模态框
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      
      {/* 弹窗内容 */}
      <div
        className="relative card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={t('closeModal')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* 标题 */}
        <h2 
          id="task-detail-title"
          className="text-xl font-semibold text-[var(--text-primary)] mb-4" 
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('taskDetailTitle')}
        </h2>

        {/* 参考图片 */}
        {task.referenceImages && task.referenceImages.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-[var(--text-muted)] mb-2">{t('taskReferenceImages')}</p>
            <div className="grid grid-cols-2 gap-2">
              {task.referenceImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${t('taskReferenceImages')} ${idx + 1}`}
                  className="w-full rounded-[var(--radius-md)] object-cover"
                  style={{ maxHeight: '240px' }}
                  loading="lazy"
                />
              ))}
            </div>
            <button
              onClick={handleDownloadAll}
              disabled={downloading}
              className="mt-2 text-sm text-[var(--gold)] hover:text-[var(--gold-muted)] transition-colors disabled:opacity-50"
            >
              {downloading ? t('loading') : t('downloadAllImages')}
            </button>
          </div>
        )}

        {/* 内容区域 - 将在后续子任务中继续添加 */}
        
        {/* 完整提示词 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-[var(--text-muted)]">{t('fullPrompt')}</p>
            <button
              onClick={() => handleCopy(task.prompt, t('fullPrompt'))}
              className="text-xs text-[var(--gold)] hover:text-[var(--gold-muted)] transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {t('copy', '复制')}
            </button>
          </div>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed bg-[var(--ink-lighter)] p-3 rounded-[var(--radius-md)]">
            {task.prompt}
          </p>
        </div>

        {/* 任务需求 - 仅在有内容时展示 */}
        {task.requirements && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-[var(--text-muted)]">{t('taskRequirements')}</p>
              <button
                onClick={() => handleCopy(task.requirements!, t('taskRequirements'))}
                className="text-xs text-[var(--gold)] hover:text-[var(--gold-muted)] transition-colors flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {t('copy', '复制')}
              </button>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed bg-[var(--ink-lighter)] p-3 rounded-[var(--radius-md)]">
              {task.requirements}
            </p>
          </div>
        )}

        {/* 任务元信息 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[var(--ink-lighter)] p-3 rounded-[var(--radius-md)]">
            <p className="text-xs text-[var(--text-muted)]">{t('taskDuration')}</p>
            <p className="text-sm text-[var(--gold)] font-medium">{task.duration}s</p>
          </div>
          <div className="bg-[var(--ink-lighter)] p-3 rounded-[var(--radius-md)]">
            <p className="text-xs text-[var(--text-muted)] mb-1">{t('creatorEmail')}</p>
            <p className="text-sm text-[var(--text-primary)] truncate">{task.creatorEmail}</p>
          </div>
          <div className="bg-[var(--ink-lighter)] p-3 rounded-[var(--radius-md)]">
            <p className="text-xs text-[var(--text-muted)]">{t('projectInfo')}</p>
            <p className="text-sm text-[var(--text-primary)] truncate">{projectName}</p>
          </div>
          <div className="bg-[var(--ink-lighter)] p-3 rounded-[var(--radius-md)]">
            <p className="text-xs text-[var(--text-muted)]">{t('projectCategory')}</p>
            <p className="text-sm text-[var(--text-primary)]">{projectCategory}</p>
          </div>
        </div>

        {/* 操作按钮区域 */}
        <div className="flex items-center gap-2 flex-wrap">
          {isCreator ? (
            <>
              {/* 创建者操作按钮 */}
              {task.status === 'draft' && (
                <>
                  <button onClick={() => onEdit(task)} className="btn-secondary h-9 px-4 text-sm">
                    {t('edit')}
                  </button>
                  <button onClick={() => onPublish(task.id)} className="btn-primary h-9 px-4 text-sm">
                    {t('publishTask')}
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(t('confirmDeleteTask'))) {
                        onDelete(task.id);
                        onClose();
                      }
                    }} 
                    className="h-9 px-4 text-sm text-[var(--error)] hover:bg-[var(--error)]/10 rounded-[var(--radius-md)] transition-colors"
                  >
                    {t('delete')}
                  </button>
                </>
              )}
              {task.status === 'published' && (
                <button onClick={() => {
                  onComplete(task.id);
                  onClose();
                }} className="btn-primary h-9 px-4 text-sm">
                  {t('completeTask')}
                </button>
              )}
            </>
          ) : (
            /* 非创建者：复制邮箱并接受 */
            task.status === 'published' && (
              <button
                onClick={handleCopyEmailAndAccept}
                disabled={!isLoggedIn}
                className={`h-9 px-4 text-sm rounded-[var(--radius-md)] font-medium transition-all ${
                  hasAccepted
                    ? 'bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 cursor-default'
                    : 'btn-primary'
                } disabled:opacity-40`}
              >
                {hasAccepted ? (
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t('copiedAndAccepted')}
                  </span>
                ) : (
                  t('copyEmail')
                )}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
