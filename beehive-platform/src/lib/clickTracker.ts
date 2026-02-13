import type { StorageResult } from '@/types';

// ==================== 点击追踪模块 ====================

// localStorage 存储键名
const CLICK_DATA_KEY = 'projectClickData';

// 时间常量
const FIVE_MINUTES_MS = 5 * 60 * 1000;           // 5分钟去重窗口
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 默认24小时统计窗口
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;    // 7天清理阈值

// 点击事件记录
interface ClickEvent {
  projectId: string;
  timestamp: number; // Unix 毫秒时间戳
  userId?: string;   // 可选，用于去重
}

// 点击数据存储结构
interface ClickData {
  events: ClickEvent[];
  lastCleanup: number; // 上次清理时间戳
}

/**
 * 安全读取 localStorage
 */
function safeGetItem(key: string): StorageResult<string | null> {
  try {
    const value = localStorage.getItem(key);
    return { success: true, data: value };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '读取存储失败',
    };
  }
}

/**
 * 安全写入 localStorage
 */
function safeSetItem(key: string, value: string): StorageResult<void> {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (error: any) {
    if (error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: '存储空间不足',
      };
    }
    return {
      success: false,
      error: error.message || '存储操作失败',
    };
  }
}

/**
 * 获取点击数据，解析失败时重置为空数据
 */
function getClickData(): StorageResult<ClickData> {
  const result = safeGetItem(CLICK_DATA_KEY);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  if (!result.data) {
    // 无数据时返回空结构
    return {
      success: true,
      data: { events: [], lastCleanup: Date.now() },
    };
  }

  try {
    const parsed = JSON.parse(result.data) as ClickData;
    // 基本格式校验：确保 events 是数组
    if (!Array.isArray(parsed.events)) {
      // 格式不兼容，重置数据
      const emptyData: ClickData = { events: [], lastCleanup: Date.now() };
      safeSetItem(CLICK_DATA_KEY, JSON.stringify(emptyData));
      return { success: true, data: emptyData };
    }
    return { success: true, data: parsed };
  } catch {
    // JSON 解析失败，重置数据
    const emptyData: ClickData = { events: [], lastCleanup: Date.now() };
    safeSetItem(CLICK_DATA_KEY, JSON.stringify(emptyData));
    return { success: true, data: emptyData };
  }
}

/**
 * 保存点击数据到 localStorage
 */
function saveClickData(data: ClickData): StorageResult<void> {
  const json = JSON.stringify(data);
  const result = safeSetItem(CLICK_DATA_KEY, json);

  if (!result.success && result.error === '存储空间不足') {
    // 存储配额超限，尝试清理后重试
    const now = Date.now();
    data.events = data.events.filter(e => (now - e.timestamp) < SEVEN_DAYS_MS);
    data.lastCleanup = now;
    const retryJson = JSON.stringify(data);
    return safeSetItem(CLICK_DATA_KEY, retryJson);
  }

  return result;
}

// ==================== 导出的点击追踪器 ====================

export const clickTracker = {
  /**
   * 记录一次点击事件
   * 含5分钟同用户同项目去重逻辑
   */
  recordClick(projectId: string, userId?: string): StorageResult<void> {
    const dataResult = getClickData();
    if (!dataResult.success || !dataResult.data) {
      return { success: false, error: dataResult.error || '获取点击数据失败' };
    }

    const data = dataResult.data;
    const now = Date.now();

    // 5分钟去重：检查同一用户在5分钟内是否已点击同一项目
    if (userId) {
      const recentDuplicate = data.events.some(
        e =>
          e.projectId === projectId &&
          e.userId === userId &&
          (now - e.timestamp) < FIVE_MINUTES_MS
      );

      if (recentDuplicate) {
        // 重复点击，静默成功（不记录新事件）
        return { success: true };
      }
    }

    // 记录新的点击事件
    const newEvent: ClickEvent = {
      projectId,
      timestamp: now,
      ...(userId ? { userId } : {}),
    };

    data.events.push(newEvent);

    // 保存到 localStorage
    return saveClickData(data);
  },

  /**
   * 获取指定时间窗口内的点击次数
   * @param projectId 项目ID
   * @param windowMs 时间窗口（毫秒），默认24小时
   */
  getClickCount(projectId: string, windowMs: number = TWENTY_FOUR_HOURS_MS): StorageResult<number> {
    const dataResult = getClickData();
    if (!dataResult.success || !dataResult.data) {
      return { success: false, error: dataResult.error || '获取点击数据失败' };
    }

    const data = dataResult.data;
    const now = Date.now();
    const cutoff = now - windowMs;

    // 统计时间窗口内该项目的点击次数
    const count = data.events.filter(
      e => e.projectId === projectId && e.timestamp >= cutoff
    ).length;

    return { success: true, data: count };
  },

  /**
   * 批量获取多个项目的点击次数（减少重复解析 localStorage）
   * @param projectIds 项目ID数组
   * @param windowMs 时间窗口（毫秒），默认24小时
   */
  getBatchClickCounts(
    projectIds: string[],
    windowMs: number = TWENTY_FOUR_HOURS_MS
  ): StorageResult<Record<string, number>> {
    const dataResult = getClickData();
    if (!dataResult.success || !dataResult.data) {
      return { success: false, error: dataResult.error || '获取点击数据失败' };
    }

    const data = dataResult.data;
    const now = Date.now();
    const cutoff = now - windowMs;

    // 初始化结果，所有项目默认为0
    const counts: Record<string, number> = {};
    for (const id of projectIds) {
      counts[id] = 0;
    }

    // 一次遍历统计所有项目的点击次数
    const projectIdSet = new Set(projectIds);
    for (const event of data.events) {
      if (projectIdSet.has(event.projectId) && event.timestamp >= cutoff) {
        counts[event.projectId]++;
      }
    }

    return { success: true, data: counts };
  },

  /**
   * 清理超过7天的历史点击记录
   * @returns 返回清理的记录数
   */
  cleanup(): StorageResult<number> {
    const dataResult = getClickData();
    if (!dataResult.success || !dataResult.data) {
      return { success: false, error: dataResult.error || '获取点击数据失败' };
    }

    const data = dataResult.data;
    const now = Date.now();
    const cutoff = now - SEVEN_DAYS_MS;

    const originalCount = data.events.length;
    // 保留7天内的记录
    data.events = data.events.filter(e => e.timestamp >= cutoff);
    data.lastCleanup = now;

    const removedCount = originalCount - data.events.length;

    // 保存清理后的数据
    const saveResult = saveClickData(data);
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return { success: true, data: removedCount };
  },
};

// 导出类型供测试和其他模块使用
export type { ClickEvent, ClickData };
