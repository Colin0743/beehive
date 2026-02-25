'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';
import { taskStorage, taskAcceptanceStorage } from '@/lib/api';
import { TaskGridSkeleton } from '@/components/SkeletonCard';

type PublishedTask = Task & { projectId: string; projectName: string; projectCategory: string };

// ========== 工具函数 ==========

// 洗牌函数 - Fisher-Yates 算法，返回随机排列的新数组
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 标题预览截断 - 取 prompt 的前 maxLen 个字符
function getTitlePreview(prompt: string, maxLen = 20): string {
  return prompt.slice(0, maxLen);
}

// 提示词预览截断 - 超过 maxLen 时添加省略号
function getPromptPreview(prompt: string, maxLen = 50): string {
  if (prompt.length > maxLen) {
    return prompt.slice(0, maxLen) + '...';
  }
  return prompt;
}

// ========== TaskNote 便签组件（新增内联组件） ==========

interface TaskNoteProps {
  task: PublishedTask;
  isFlipping: boolean;
  onClick: (task: PublishedTask) => void;
}

function TaskNote({ task, isFlipping, onClick }: TaskNoteProps) {
  const { t } = useTranslation('common');
  const firstImage = task.referenceImages?.[0];
  const titlePreview = getTitlePreview(task.prompt);
  const promptPreview = getPromptPreview(task.prompt);

  return (
    <div
      className={`task-note-container ${isFlipping ? 'flipping' : ''}`}
      onClick={() => onClick(task)}
    >
      <div className="task-note-inner">
        {/* 正面：参考图片 + 悬停叠加层 */}
        <div className="task-note-front card cursor-pointer group relative overflow-hidden hover:border-[var(--gold-muted)]" style={{ aspectRatio: '3/4' }}>
          {firstImage ? (
            <img src={firstImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[var(--ink-lighter)] flex items-center justify-center">
              <span className="text-[var(--text-muted)]">{t('noImage')}</span>
            </div>
          )}
          {/* 悬停信息叠加层 */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast)] flex flex-col justify-end p-4">
            <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{titlePreview}</p>
            <p className="text-xs text-[var(--gold)] mb-2">{task.duration}s</p>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{promptPreview}</p>
          </div>
        </div>
        {/* 背面：翻转时显示的加载动画 */}
        <div className="task-note-back card flex items-center justify-center bg-[var(--ink-light)]" style={{ aspectRatio: '3/4' }}>
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}


// ========== TaskDetailModal 弹窗组件（新增内联组件） ==========

interface TaskDetailModalProps {
  task: PublishedTask;
  isLoggedIn: boolean;
  hasAccepted: boolean;
  onAccept: (task: Task) => void;
  onClose: () => void;
}

function TaskDetailModal({ task, isLoggedIn, hasAccepted, onAccept, onClose }: TaskDetailModalProps) {
  const { t } = useTranslation('common');

  // 打开弹窗时阻止背景滚动，关闭时恢复
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/60" />
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* 标题 */}
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
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
                />
              ))}
            </div>
          </div>
        )}

        {/* 完整提示词 */}
        <div className="mb-4">
          <p className="text-sm text-[var(--text-muted)] mb-1">{t('fullPrompt')}</p>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed bg-[var(--ink-lighter)] p-3 rounded-[var(--radius-md)]">
            {task.prompt}
          </p>
        </div>

        {/* 任务需求 */}
        {task.requirements && (
          <div className="mb-4">
            <p className="text-sm text-[var(--text-muted)] mb-1">{t('taskRequirements')}</p>
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
            <p className="text-xs text-[var(--text-muted)]">{t('creatorEmail')}</p>
            <p className="text-sm text-[var(--text-primary)] truncate">{task.creatorEmail}</p>
          </div>
          <div className="bg-[var(--ink-lighter)] p-3 rounded-[var(--radius-md)]">
            <p className="text-xs text-[var(--text-muted)]">{t('projectInfo')}</p>
            <p className="text-sm text-[var(--text-primary)] truncate">{task.projectName}</p>
          </div>
          <div className="bg-[var(--ink-lighter)] p-3 rounded-[var(--radius-md)]">
            <p className="text-xs text-[var(--text-muted)]">{t('projectCategory')}</p>
            <p className="text-sm text-[var(--text-primary)]">{task.projectCategory}</p>
          </div>
        </div>

        {/* 接受任务按钮 */}
        {hasAccepted ? (
          <button disabled className="btn-secondary w-full opacity-60 cursor-not-allowed">
            {t('taskAccepted')}
          </button>
        ) : (
          <button
            onClick={() => onAccept(task)}
            className="btn-primary w-full"
          >
            {isLoggedIn ? t('acceptTask') : t('login')}
          </button>
        )}
      </div>
    </div>
  );
}


// ========== TaskHallPage 主页面组件（完全重写） ==========

export default function TaskHallPage() {
  const { t } = useTranslation('common');
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  // 状态定义
  const [allTasks, setAllTasks] = useState<PublishedTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<PublishedTask[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [acceptedTaskIds, setAcceptedTaskIds] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PublishedTask | null>(null);
  const [loading, setLoading] = useState(true);

  // 分类列表
  const categories = [
    { key: 'all', label: t('allCategories') },
    { key: '电影', label: t('film') },
    { key: '动画', label: t('animation') },
    { key: '商业制作', label: t('commercial') },
    { key: '公益', label: t('publicWelfare') },
    { key: '其他', label: t('other') },
  ];

  // ===== 数据加载 =====
  useEffect(() => {
    (async () => {
      try {
        const result = await taskStorage.getAllPublishedTasks();
        if (result.success && result.data) {
          setAllTasks(result.data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 加载用户已接受的任务 ID
  useEffect(() => {
    if (user) {
      (async () => {
        const result = await taskAcceptanceStorage.getUserAcceptedTaskIds(user.id);
        if (result.success && result.data) setAcceptedTaskIds(result.data);
      })();
    }
  }, [user]);

  // ===== 分类过滤逻辑（移除搜索，只保留分类） =====
  useEffect(() => {
    let result = allTasks;
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.projectCategory === selectedCategory);
    }
    // 随机打乱后只取前25个（5行x5列）
    setFilteredTasks(shuffleArray(result).slice(0, 25));
  }, [selectedCategory, allTasks]);

  // ===== 刷新逻辑 =====
  const handleRefresh = useCallback(() => {
    setIsFlipping(true);
    setTimeout(async () => {
      const result = await taskStorage.getAllPublishedTasks();
      if (result.success && result.data) {
        setAllTasks(result.data);
      }
      setIsFlipping(false);
      setCountdown(60);
    }, 600); // 等待翻转动画完成后更新数据
  }, []);

  // 自动刷新定时器：每秒递减，到 0 时触发刷新
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  // ===== 接受任务逻辑 =====
  const handleAcceptTask = async (task: Task) => {
    if (!isLoggedIn || !user) {
      router.push('/auth/login');
      return;
    }
    const result = await taskAcceptanceStorage.acceptTask(task.id, user.id);
    if (result.success) {
      setAcceptedTaskIds(prev => [...prev, task.id]);
    }
  };

  // ===== 统计计算 =====
  const totalCount = allTasks.length;
  const categoryCountMap = allTasks.reduce((acc, t) => {
    acc[t.projectCategory] = (acc[t.projectCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 倒计时格式化为 MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <LayoutSimple>
      <div className="max-w-7xl mx-auto">
        {/* ===== Hero 区域（保留原有） ===== */}
        <section className="relative py-16 overflow-hidden mb-10">
          <div className="glow -top-40 -left-40" />
          <div className="glow -bottom-40 -right-40" style={{ opacity: 0.3 }} />
          <div className="relative text-center max-w-3xl mx-auto">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] mb-6 animate-fade-up"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('taskHallTitle')}
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-10 animate-fade-up delay-1">
              {t('taskHallDesc')}
            </p>
          </div>

          {/* ===== 统计筛选面板（Stats_Filter_Panel） ===== */}
          <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 animate-fade-up delay-2">
            {/* "全部" 卡片 */}
            <div
              onClick={() => setSelectedCategory('all')}
              className={`card p-4 text-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedCategory === 'all'
                  ? 'border-[var(--gold)] shadow-[0_0_12px_var(--gold-muted)]'
                  : 'hover:border-[var(--gold-muted)]'
                }`}
            >
              <p className="text-2xl font-semibold text-[var(--gold)]">{totalCount}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{t('allCategories')}</p>
            </div>
            {/* 各类别统计卡片 */}
            {categories.filter(cat => cat.key !== 'all').map(cat => (
              <div
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`card p-4 text-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedCategory === cat.key
                    ? 'border-[var(--gold)] shadow-[0_0_12px_var(--gold-muted)]'
                    : 'hover:border-[var(--gold-muted)]'
                  }`}
              >
                <p className="text-2xl font-semibold text-[var(--gold)]">
                  {categoryCountMap[cat.key] || 0}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{cat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 刷新计时器栏（Refresh_Timer） ===== */}
        <div className="flex items-center justify-center gap-3 mb-6 animate-fade-up delay-2">
          <span className="text-sm text-[var(--text-muted)]">
            {t('refreshCountdown')} {formatCountdown(countdown)}
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--ink-lighter)] transition-all"
            title={t('manualRefresh')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
        </div>

        {/* ===== 任务墙（Task Wall）- 5列全宽布局 ===== */}
        {loading ? (
          <TaskGridSkeleton count={15} />
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredTasks.map(task => (
              <TaskNote
                key={task.id}
                task={task}
                isFlipping={isFlipping}
                onClick={(t) => setSelectedTask(t)}
              />
            ))}
          </div>
        ) : (
          /* 空状态提示 */
          <div className="text-center py-20 animate-fade-up">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="mx-auto mb-4 opacity-40">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <p className="text-[var(--text-muted)] mb-4">{t('noPublishedTasks')}</p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--ink-lighter)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--gold)]/10 border border-[var(--ink-border)] hover:border-[var(--gold)]/30 transition-all"
              >
                {t('viewOtherCategories')}
              </button>
            )}
          </div>
        )}

        {/* ===== 任务详情弹窗（条件渲染） ===== */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isLoggedIn={isLoggedIn}
            hasAccepted={acceptedTaskIds.includes(selectedTask.id)}
            onAccept={handleAcceptTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </div>
    </LayoutSimple>
  );
}