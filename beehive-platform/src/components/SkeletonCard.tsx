'use client';

/**
 * 骨架屏组件
 * 在数据加载期间提供视觉占位，减少用户感知等待时间
 */

/** 项目卡片骨架屏 */
export function ProjectCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="card overflow-hidden animate-pulse">
        <div className="aspect-[4/3] bg-[var(--ink-lighter)]" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-[var(--ink-lighter)] rounded w-3/4" />
          <div className="h-3 bg-[var(--ink-lighter)] rounded w-full" />
          <div className="h-1.5 bg-[var(--ink-lighter)] rounded w-full" />
          <div className="flex justify-between">
            <div className="h-3 bg-[var(--ink-lighter)] rounded w-1/4" />
            <div className="h-3 bg-[var(--ink-lighter)] rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-[var(--ink-lighter)]" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-[var(--ink-lighter)] rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-[var(--ink-lighter)] rounded w-full" />
          <div className="h-3 bg-[var(--ink-lighter)] rounded w-2/3" />
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-[var(--ink-lighter)] rounded w-1/3" />
          <div className="h-2 bg-[var(--ink-lighter)] rounded w-full" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-[var(--ink-lighter)] rounded w-1/4" />
          <div className="h-3 bg-[var(--ink-lighter)] rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

/** 项目卡片骨架屏网格 */
export function ProjectGridSkeleton({
  count = 6,
  compact = false,
  columns = 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
}: {
  count?: number;
  compact?: boolean;
  columns?: string;
}) {
  return (
    <div className={`grid ${columns} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} compact={compact} />
      ))}
    </div>
  );
}

/** 任务便签骨架屏 */
export function TaskNoteSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse" style={{ aspectRatio: '3/4' }}>
      <div className="w-full h-full bg-[var(--ink-lighter)]" />
    </div>
  );
}

/** 任务墙骨架屏网格 */
export function TaskGridSkeleton({ count = 15 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TaskNoteSkeleton key={i} />
      ))}
    </div>
  );
}

/** 侧边栏任务预览骨架屏 */
export function TaskPreviewSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--ink-light)] border border-[var(--ink-border)] animate-pulse">
          <div className="w-14 h-14 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--ink-lighter)]" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-[var(--ink-lighter)] rounded w-2/3" />
            <div className="h-3 bg-[var(--ink-lighter)] rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
