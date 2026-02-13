import type { Project } from '@/types';

// ==================== 排序引擎模块 ====================

/**
 * 排序方式类型
 * - hot: 按热度分数降序
 * - newest: 按创建时间降序
 * - fastest: 按进度百分比降序
 * - mostParticipants: 按参与者数量降序
 */
export type SortOption = 'hot' | 'newest' | 'fastest' | 'mostParticipants';

/**
 * 热度分数计算配置接口
 */
export interface HotnessConfig {
  clickWindowMs: number;        // 点击统计时间窗口（毫秒），默认 24小时
  decayHalfLifeMs: number;      // 衰减半衰期（毫秒），默认 24小时
  participantsWeight: number;   // 参与者权重系数，默认 2
  progressWeight: number;       // 进度活跃度权重系数，默认 5
}

/** 默认热度配置 */
const DEFAULT_HOTNESS_CONFIG: HotnessConfig = {
  clickWindowMs: 24 * 60 * 60 * 1000,      // 24小时
  decayHalfLifeMs: 24 * 60 * 60 * 1000,    // 24小时
  participantsWeight: 2,
  progressWeight: 5,
};

/**
 * 合并用户配置与默认配置
 */
function mergeConfig(config?: Partial<HotnessConfig>): HotnessConfig {
  return { ...DEFAULT_HOTNESS_CONFIG, ...config };
}

/**
 * 计算项目进度百分比，安全处理 targetDuration 为 0 的情况
 */
function getProgressRatio(project: Project): number {
  if (project.targetDuration === 0) {
    return 0;
  }
  return project.currentDuration / project.targetDuration;
}

// ==================== 导出的排序引擎 ====================

export const sortingEngine = {
  /**
   * 计算单个项目的热度分数
   *
   * 公式：score = clickCount + participantsCount × participantsWeight + progressRatio × progressWeight
   *
   * 其中：
   * - clickCount: 时间窗口内的点击次数（时间衰减由 clickTracker 的窗口过滤处理）
   * - participantsCount × participantsWeight: 参与者权重分
   * - (currentDuration / targetDuration) × progressWeight: 进度活跃度权重分
   *
   * @param project 项目对象
   * @param clickCount 时间窗口内的点击次数
   * @param config 可选的热度配置
   * @returns 热度分数
   */
  calculateHotnessScore(
    project: Project,
    clickCount: number,
    config?: Partial<HotnessConfig>
  ): number {
    const mergedConfig = mergeConfig(config);

    // 点击分数：直接使用点击次数
    const weightedClickScore = clickCount;

    // 参与者分数
    const participantsScore = project.participantsCount * mergedConfig.participantsWeight;

    // 进度活跃度分数（安全处理 targetDuration 为 0 的情况）
    const progressRatio = getProgressRatio(project);
    const progressScore = progressRatio * mergedConfig.progressWeight;

    return weightedClickScore + participantsScore + progressScore;
  },

  /**
   * 按热度降序排序项目列表
   * 相同热度分数时，按创建时间降序（更新的排前面）
   *
   * @param projects 项目列表
   * @param clickCounts 各项目的点击次数映射
   * @param config 可选的热度配置
   * @returns 排序后的项目列表（新数组，不修改原数组）
   */
  sortByHotness(
    projects: Project[],
    clickCounts: Record<string, number>,
    config?: Partial<HotnessConfig>
  ): Project[] {
    return [...projects].sort((a, b) => {
      const scoreA = sortingEngine.calculateHotnessScore(a, clickCounts[a.id] || 0, config);
      const scoreB = sortingEngine.calculateHotnessScore(b, clickCounts[b.id] || 0, config);

      // 热度分数降序
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      // 相同分数时，按创建时间降序（更新的排前面）
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  /**
   * 按指定维度排序项目列表
   *
   * @param projects 项目列表
   * @param sortOption 排序方式
   * @param clickCounts 各项目的点击次数映射（hot 排序时必需）
   * @returns 排序后的项目列表（新数组）
   */
  sortProjects(
    projects: Project[],
    sortOption: SortOption,
    clickCounts?: Record<string, number>
  ): Project[] {
    switch (sortOption) {
      case 'hot':
        return sortingEngine.sortByHotness(projects, clickCounts || {});

      case 'newest':
        return [...projects].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case 'fastest':
        return [...projects].sort((a, b) => {
          const progressA = getProgressRatio(a);
          const progressB = getProgressRatio(b);
          return progressB - progressA;
        });

      case 'mostParticipants':
        return [...projects].sort(
          (a, b) => b.participantsCount - a.participantsCount
        );

      default:
        // 未知排序方式，返回原顺序的副本
        return [...projects];
    }
  },

  /**
   * 首页分类板块混合策略排序
   *
   * 策略：前3个按热度降序选取，后3个按创建时间降序选取（去重后），总数不超过 limit
   *
   * @param projects 同一分类的项目列表
   * @param clickCounts 各项目的点击次数映射
   * @param limit 最大返回数量，默认 6
   * @returns 混合排序后的项目列表
   */
  getCategoryMixedProjects(
    projects: Project[],
    clickCounts: Record<string, number>,
    limit: number = 6
  ): Project[] {
    if (projects.length === 0) {
      return [];
    }

    // 热门项目数量：取 limit 的一半（向下取整后取3，或按比例）
    const hotCount = Math.min(3, Math.ceil(limit / 2), projects.length);
    const newestCount = limit - hotCount;

    // 按热度排序取前 hotCount 个
    const hotSorted = sortingEngine.sortByHotness(projects, clickCounts);
    const hotProjects = hotSorted.slice(0, hotCount);

    // 已选中的项目ID集合（用于去重）
    const selectedIds = new Set(hotProjects.map(p => p.id));

    // 按创建时间降序排序，去重后取 newestCount 个
    const newestSorted = [...projects].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const newestProjects: Project[] = [];
    for (const project of newestSorted) {
      if (newestProjects.length >= newestCount) break;
      if (!selectedIds.has(project.id)) {
        newestProjects.push(project);
        selectedIds.add(project.id);
      }
    }

    // 合并：热门在前，最新在后
    return [...hotProjects, ...newestProjects];
  },

  /**
   * 获取首页精选项目（按热度取前N个）
   *
   * @param projects 所有项目列表
   * @param clickCounts 各项目的点击次数映射
   * @param limit 返回数量，默认 6
   * @returns 热度最高的前N个项目
   */
  getFeaturedProjects(
    projects: Project[],
    clickCounts: Record<string, number>,
    limit: number = 6
  ): Project[] {
    const sorted = sortingEngine.sortByHotness(projects, clickCounts);
    return sorted.slice(0, limit);
  },
};

// 导出默认配置供测试使用
export { DEFAULT_HOTNESS_CONFIG };
