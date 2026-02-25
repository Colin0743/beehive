/**
 * API 客户端模块
 *
 * 替代 storage.ts，通过 HTTP 调用后端 API Routes 实现数据操作。
 * 导出与 storage.ts 完全相同的模块名和方法签名，
 * 前端页面只需将 import 路径从 '@/lib/storage' 改为 '@/lib/api' 即可。
 *
 * 所有方法均为异步，返回 Promise<StorageResult<T>>。
 */

import type {
  Project,
  User,
  ProjectLog,
  StorageResult,
  Task,
  TaskAcceptance,
  Notification,
  Achievement,
  Feedback,
} from '@/types';

// ==================== 内部 fetch 封装 ====================

/**
 * 统一的 API 请求封装函数
 * - 自动处理 JSON 序列化和反序列化
 * - HTTP 401 时触发登出并重定向到登录页
 * - 网络失败时返回友好错误信息
 */
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<StorageResult<T>> {
  try {
    const isGet = !options?.method || options.method === 'GET';
    const res = await fetch(url, {
      ...options,
      // GET 请求使用浏览器默认缓存策略（配合 API 层 Cache-Control）
      // 非 GET 请求强制不缓存
      ...(isGet ? {} : { cache: 'no-store' as RequestCache }),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // HTTP 401：登录过期，重定向到登录页
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return { success: false, error: '登录已过期，请重新登录' };
    }

    const body = await res.json();
    return body as StorageResult<T>;
  } catch (err) {
    console.error('[apiFetch] 请求失败:', url, err);
    return { success: false, error: '网络请求失败，请检查网络连接' };
  }
}

// ==================== 数据库字段名 ↔ 前端字段名 转换工具 ====================

/**
 * 将数据库 snake_case 的 profile 记录转换为前端 User 类型
 */
function mapProfileToUser(profile: Record<string, unknown>): User {
  return {
    id: profile.id as string,
    name: (profile.name as string) ?? '',
    email: (profile.email as string) ?? '',
    avatar: (profile.avatar as string) ?? '',
    role: profile.role as User['role'],
    isActive: profile.is_active as boolean | undefined,
    createdAt: profile.created_at as string,
  };
}

/**
 * 将数据库 snake_case 的 project 记录转换为前端 Project 类型
 */
function mapDbProjectToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    targetDuration: (row.target_duration as number) ?? 0,
    currentDuration: (row.current_duration as number) ?? 0,
    telegramGroup: (row.telegram_group as string) ?? '',
    coverImage: (row.cover_image as string) ?? '',
    videoFile: row.video_file as string | undefined,
    creatorId: row.creator_id as string,
    creatorName: (row.creator_name as string) ?? '',
    participantsCount: (row.participants_count as number) ?? 0,
    status: row.status as Project['status'],
    createdAt: row.created_at as string,
    logs: Array.isArray(row.logs) ? (row.logs as Record<string, unknown>[]).map(mapDbLogToProjectLog) : [],
    tasks: Array.isArray(row.tasks) ? (row.tasks as Record<string, unknown>[]).map(mapDbTaskToTask) : undefined,
  };
}

/**
 * 将前端 Project 字段转换为数据库 snake_case 字段
 */
function mapProjectToDb(data: Partial<Project>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (data.title !== undefined) result.title = data.title;
  if (data.description !== undefined) result.description = data.description;
  if (data.category !== undefined) result.category = data.category;
  if (data.targetDuration !== undefined) result.target_duration = data.targetDuration;
  if (data.currentDuration !== undefined) result.current_duration = data.currentDuration;
  if (data.telegramGroup !== undefined) result.telegram_group = data.telegramGroup;
  if (data.coverImage !== undefined) result.cover_image = data.coverImage;
  if (data.videoFile !== undefined) result.video_file = data.videoFile;
  if (data.status !== undefined) result.status = data.status;
  if (data.participantsCount !== undefined) result.participants_count = data.participantsCount;
  return result;
}

/**
 * 将数据库 snake_case 的 project_log 记录转换为前端 ProjectLog 类型
 */
function mapDbLogToProjectLog(row: Record<string, unknown>): ProjectLog {
  return {
    id: row.id as string,
    type: row.type as ProjectLog['type'],
    content: row.content as string,
    createdAt: row.created_at as string,
    creatorName: (row.creator_name as string) ?? '',
  };
}

/**
 * 将数据库 snake_case 的 task 记录转换为前端 Task 类型
 */
function mapDbTaskToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    prompt: row.prompt as string,
    referenceImages: (row.reference_images as string[]) ?? [],
    requirements: (row.requirements as string) ?? '',
    creatorEmail: (row.creator_email as string) ?? '',
    status: row.status as Task['status'],
    contributorName: row.contributor_name as string | undefined,
    duration: (row.duration as number) ?? 0,
    order: (row.order_index as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * 将前端 Task 字段转换为数据库 snake_case 字段
 */
function mapTaskToDb(data: Partial<Task>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (data.prompt !== undefined) result.prompt = data.prompt;
  if (data.referenceImages !== undefined) result.reference_images = data.referenceImages;
  if (data.requirements !== undefined) result.requirements = data.requirements;
  if (data.creatorEmail !== undefined) result.creator_email = data.creatorEmail;
  if (data.status !== undefined) result.status = data.status;
  if (data.contributorName !== undefined) result.contributor_name = data.contributorName;
  if (data.duration !== undefined) result.duration = data.duration;
  if (data.order !== undefined) result.order_index = data.order;
  return result;
}

/**
 * 将数据库 snake_case 的 task_acceptance 记录转换为前端 TaskAcceptance 类型
 */
function mapDbAcceptance(row: Record<string, unknown>): TaskAcceptance {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    userId: row.user_id as string,
    acceptedAt: row.accepted_at as string,
  };
}

/**
 * 将数据库 snake_case 的 notification 记录转换为前端 Notification 类型
 */
function mapDbNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    type: row.type as Notification['type'],
    message: row.message as string,
    taskId: (row.task_id as string) ?? '',
    projectId: (row.project_id as string) ?? '',
    isRead: row.is_read as boolean,
    createdAt: row.created_at as string,
  };
}

/**
 * 将数据库 snake_case 的 achievement 记录转换为前端 Achievement 类型
 */
function mapDbAchievement(row: Record<string, unknown>): Achievement {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    taskName: (row.task_name as string) ?? '',
    contributorName: (row.contributor_name as string) ?? '',
    projectId: row.project_id as string,
    projectName: (row.project_name as string) ?? '',
    completedAt: row.completed_at as string,
  };
}

// ==================== userStorage 模块 ====================

export const userStorage = {
  /**
   * 获取当前登录用户的 profile
   */
  async getCurrentUser(): Promise<StorageResult<User | null>> {
    const result = await apiFetch<Record<string, unknown>>('/api/auth/profile');
    if (!result.success) {
      // 未认证时返回 null 而非错误（与旧接口行为一致）
      if (result.error === '登录已过期，请重新登录') {
        return { success: true, data: null };
      }
      return { success: true, data: null };
    }
    return { success: true, data: result.data ? mapProfileToUser(result.data) : null };
  },

  /**
   * 保存当前登录用户（API 模式下为空操作，由 Supabase Auth 管理）
   */
  async setCurrentUser(_user: User): Promise<StorageResult<void>> {
    // Supabase Auth 自动管理 session，无需手动保存
    return { success: true };
  },

  /**
   * 清除当前登录用户（API 模式下为空操作，由 AuthContext 的 logout 处理）
   */
  async clearCurrentUser(): Promise<StorageResult<void>> {
    return { success: true };
  },

  /**
   * 获取所有注册用户（管理员接口）
   * 注意：当前 API 未提供此端点，返回空数组
   */
  async getAllUsers(): Promise<StorageResult<User[]>> {
    // TODO: 需要管理员 API 端点支持
    return { success: true, data: [] };
  },

  /**
   * 注册新用户（API 模式下由 Supabase Auth OTP 处理）
   */
  async registerUser(user: User): Promise<StorageResult<User>> {
    // Supabase Auth 通过 OTP 自动注册，此方法保留兼容性
    return { success: true, data: user };
  },

  /**
   * 根据邮箱查找用户
   * 注意：当前 API 未提供此端点
   */
  async findUserByEmail(_email: string): Promise<StorageResult<User | null>> {
    return { success: true, data: null };
  },

  /**
   * 根据 ID 查找用户
   * 注意：当前 API 未提供此端点
   */
  async findUserById(_userId: string): Promise<StorageResult<User | null>> {
    return { success: true, data: null };
  },

  /**
   * 更新用户信息（仅允许更新 name 和 avatar）
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<StorageResult<User>> {
    const result = await apiFetch<Record<string, unknown>>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: updates.name,
        avatar: updates.avatar,
      }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapProfileToUser(result.data) : ({} as User) };
  },

  /**
   * 删除用户
   * 注意：当前 API 未提供此端点
   */
  async deleteUser(_userId: string): Promise<StorageResult<void>> {
    return { success: false, error: '暂不支持通过 API 删除用户' };
  },
};

// ==================== projectStorage 模块 ====================

export const projectStorage = {
  /**
   * 获取所有项目
   */
  async getAllProjects(): Promise<StorageResult<Project[]>> {
    const result = await apiFetch<Record<string, unknown>[]>('/api/projects');
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const projects = (result.data ?? []).map(mapDbProjectToProject);
    return { success: true, data: projects };
  },

  /**
   * 根据 ID 获取项目（同时返回 tasks 和 logs）
   */
  async getProjectById(id: string): Promise<StorageResult<Project | null>> {
    const result = await apiFetch<Record<string, unknown>>(`/api/projects/${id}`);
    if (!result.success) {
      if (result.error?.includes('不存在')) {
        return { success: true, data: null };
      }
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbProjectToProject(result.data) : null };
  },

  /**
   * 创建项目
   */
  async createProject(project: Project): Promise<StorageResult<Project>> {
    const dbData = mapProjectToDb(project);
    const result = await apiFetch<Record<string, unknown>>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(dbData),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbProjectToProject(result.data) : project };
  },

  /**
   * 更新项目
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<StorageResult<Project>> {
    // 先获取当前项目数据以合并必填字段
    const currentResult = await apiFetch<Record<string, unknown>>(`/api/projects/${id}`);
    if (!currentResult.success || !currentResult.data) {
      return { success: false, error: currentResult.error ?? '项目不存在' };
    }

    const current = currentResult.data;
    const dbData = mapProjectToDb(updates);

    // API 要求 title、description、category 为必填字段
    const mergedData = {
      title: current.title,
      description: current.description,
      category: current.category,
      ...dbData,
    };

    const result = await apiFetch<Record<string, unknown>>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mergedData),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbProjectToProject(result.data) : ({} as Project) };
  },

  /**
   * 添加项目日志
   */
  async addProjectLog(projectId: string, log: ProjectLog): Promise<StorageResult<ProjectLog>> {
    const result = await apiFetch<Record<string, unknown>>(`/api/projects/${projectId}/logs`, {
      method: 'POST',
      body: JSON.stringify({
        type: log.type,
        content: log.content,
      }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbLogToProjectLog(result.data) : log };
  },

  /**
   * 删除项目
   */
  async deleteProject(id: string): Promise<StorageResult<void>> {
    const result = await apiFetch<unknown>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  },

  /**
   * 获取用户创建的项目
   */
  async getUserProjects(userId: string): Promise<StorageResult<Project[]>> {
    const result = await apiFetch<Record<string, unknown>[]>(`/api/projects?creator_id=${userId}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const projects = (result.data ?? []).map(mapDbProjectToProject);
    return { success: true, data: projects };
  },
};

// ==================== projectRelationStorage 模块 ====================

export const projectRelationStorage = {
  /**
   * 关注项目
   */
  async followProject(userId: string, projectId: string): Promise<StorageResult<void>> {
    const result = await apiFetch<unknown>('/api/project-follows', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  },

  /**
   * 取消关注项目
   */
  async unfollowProject(userId: string, projectId: string): Promise<StorageResult<void>> {
    const result = await apiFetch<unknown>(`/api/project-follows?project_id=${projectId}`, {
      method: 'DELETE',
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  },

  /**
   * 检查是否关注项目
   */
  async isFollowing(userId: string, projectId: string): Promise<StorageResult<boolean>> {
    const result = await apiFetch<{ isFollowing: boolean }>(`/api/project-follows?project_id=${projectId}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data?.isFollowing ?? false };
  },

  /**
   * 获取用户关注的项目 ID 列表
   */
  async getFollowedProjectIds(userId: string): Promise<StorageResult<string[]>> {
    const result = await apiFetch<string[]>('/api/project-follows');
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ?? [] };
  },

  /**
   * 参与项目
   */
  async participateInProject(
    userId: string,
    projectId: string,
    role: 'worker_bee'
  ): Promise<StorageResult<void>> {
    const result = await apiFetch<unknown>('/api/project-participations', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  },

  /**
   * 检查是否参与项目
   */
  async isParticipating(userId: string, projectId: string): Promise<StorageResult<boolean>> {
    const result = await apiFetch<{ isParticipating: boolean }>(`/api/project-participations?project_id=${projectId}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data?.isParticipating ?? false };
  },

  /**
   * 获取用户参与的项目 ID 列表
   */
  async getParticipatedProjectIds(userId: string): Promise<StorageResult<string[]>> {
    const result = await apiFetch<string[]>('/api/project-participations');
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ?? [] };
  },
};

// ==================== taskStorage 模块 ====================

export const taskStorage = {
  /**
   * 获取项目的所有任务
   */
  async getTasksByProject(projectId: string): Promise<StorageResult<Task[]>> {
    const result = await apiFetch<Record<string, unknown>[]>(`/api/tasks/${projectId}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const tasks = (result.data ?? []).map(mapDbTaskToTask);
    return { success: true, data: tasks };
  },

  /**
   * 创建任务
   */
  async createTask(projectId: string, task: Task): Promise<StorageResult<Task>> {
    const dbData = mapTaskToDb(task);
    const result = await apiFetch<Record<string, unknown>>(`/api/tasks/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(dbData),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbTaskToTask(result.data) : task };
  },

  /**
   * 更新任务
   */
  async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<StorageResult<Task>> {
    const dbData = mapTaskToDb(updates);
    const result = await apiFetch<Record<string, unknown>>(`/api/tasks/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ task_id: taskId, ...dbData }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbTaskToTask(result.data) : ({} as Task) };
  },

  /**
   * 删除任务
   */
  async deleteTask(projectId: string, taskId: string): Promise<StorageResult<void>> {
    const result = await apiFetch<unknown>(`/api/tasks/${projectId}?task_id=${taskId}`, {
      method: 'DELETE',
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  },

  /**
   * 重排序任务
   */
  async reorderTasks(projectId: string, taskIds: string[]): Promise<StorageResult<void>> {
    // 逐个更新每个任务的 order_index
    for (let i = 0; i < taskIds.length; i++) {
      const result = await apiFetch<unknown>(`/api/tasks/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ task_id: taskIds[i], order_index: i }),
      });
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }
    return { success: true };
  },

  /**
   * 获取所有已发布任务（聚合所有项目信息）
   */
  async getAllPublishedTasks(): Promise<StorageResult<(Task & { projectId: string; projectName: string; projectCategory: string })[]>> {
    const result = await apiFetch<Record<string, unknown>[]>('/api/tasks');
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const tasks = (result.data ?? []).map((row) => {
      // API 返回的数据中 projects 是 join 的关联对象
      const projectInfo = row.projects as Record<string, unknown> | null;
      const task = mapDbTaskToTask(row);
      return {
        ...task,
        projectId: (projectInfo?.id as string) ?? (row.project_id as string) ?? '',
        projectName: (projectInfo?.title as string) ?? '',
        projectCategory: (projectInfo?.category as string) ?? '',
      };
    });

    return { success: true, data: tasks };
  },
};

// ==================== taskAcceptanceStorage 模块 ====================

export const taskAcceptanceStorage = {
  /**
   * 接受任务
   */
  async acceptTask(taskId: string, userId: string): Promise<StorageResult<TaskAcceptance>> {
    const result = await apiFetch<Record<string, unknown>>('/api/task-acceptances', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbAcceptance(result.data) : ({} as TaskAcceptance) };
  },

  /**
   * 获取任务的所有接受记录
   */
  async getAcceptances(taskId: string): Promise<StorageResult<TaskAcceptance[]>> {
    const result = await apiFetch<Record<string, unknown>[]>(`/api/task-acceptances?task_id=${taskId}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const acceptances = (result.data ?? []).map(mapDbAcceptance);
    return { success: true, data: acceptances };
  },

  /**
   * 检查用户是否已接受任务
   */
  async hasUserAccepted(taskId: string, userId: string): Promise<StorageResult<boolean>> {
    const result = await apiFetch<Record<string, unknown>[]>(`/api/task-acceptances?task_id=${taskId}&user_id=${userId}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const hasAccepted = (result.data ?? []).length > 0;
    return { success: true, data: hasAccepted };
  },

  /**
   * 获取用户接受的所有任务 ID
   */
  async getUserAcceptedTaskIds(userId: string): Promise<StorageResult<string[]>> {
    const result = await apiFetch<Record<string, unknown>[]>(`/api/task-acceptances?user_id=${userId}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const taskIds = (result.data ?? []).map((row) => row.task_id as string);
    return { success: true, data: taskIds };
  },
};

// ==================== notificationStorage 模块 ====================

export const notificationStorage = {
  /**
   * 获取用户的所有通知
   */
  async getNotifications(userId: string): Promise<StorageResult<Notification[]>> {
    const result = await apiFetch<Record<string, unknown>[]>('/api/notifications');
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const notifications = (result.data ?? []).map(mapDbNotification);
    return { success: true, data: notifications };
  },

  /**
   * 创建通知
   */
  async createNotification(userId: string, notification: Notification): Promise<StorageResult<Notification>> {
    const result = await apiFetch<Record<string, unknown>>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        type: notification.type,
        message: notification.message,
        task_id: notification.taskId || null,
        project_id: notification.projectId || null,
      }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbNotification(result.data) : notification };
  },

  /**
   * 标记通知为已读
   */
  async markAsRead(userId: string, notificationId: string): Promise<StorageResult<void>> {
    const result = await apiFetch<unknown>('/api/notifications', {
      method: 'PUT',
      body: JSON.stringify({ notification_id: notificationId }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  },

  /**
   * 获取用户未读通知数量
   */
  async getUnreadCount(userId: string): Promise<StorageResult<number>> {
    const result = await apiFetch<Record<string, unknown>[]>('/api/notifications?unread_only=true');
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: (result.data ?? []).length };
  },
};

// ==================== achievementStorage 模块 ====================

export const achievementStorage = {
  /**
   * 创建成就记录
   */
  async createAchievement(achievement: Achievement): Promise<StorageResult<Achievement>> {
    const result = await apiFetch<Record<string, unknown>>('/api/achievements', {
      method: 'POST',
      body: JSON.stringify({
        task_id: achievement.taskId,
        task_name: achievement.taskName,
        contributor_name: achievement.contributorName,
        project_id: achievement.projectId,
        project_name: achievement.projectName,
        completed_at: achievement.completedAt,
      }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbAchievement(result.data) : achievement };
  },

  /**
   * 按项目获取成就记录
   */
  async getByProject(projectId: string): Promise<StorageResult<Achievement[]>> {
    const result = await apiFetch<Record<string, unknown>[]>(`/api/achievements?project_id=${projectId}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const achievements = (result.data ?? []).map(mapDbAchievement);
    return { success: true, data: achievements };
  },

  /**
   * 按贡献者获取成就记录
   */
  async getByContributor(contributorName: string): Promise<StorageResult<Achievement[]>> {
    const result = await apiFetch<Record<string, unknown>[]>(`/api/achievements?contributor_name=${encodeURIComponent(contributorName)}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const achievements = (result.data ?? []).map(mapDbAchievement);
    return { success: true, data: achievements };
  },
};

// ==================== feedbackStorage 模块 ====================

/**
 * 将数据库 snake_case 的 feedback 记录转换为前端 Feedback 类型
 */
function mapDbFeedback(row: Record<string, unknown>): Feedback {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    category: row.category as string,
    description: row.description as string,
    images: (row.images as string[]) ?? [],
    status: row.status as Feedback['status'],
    adminReply: (row.admin_reply as string) ?? null,
    createdAt: row.created_at as string,
    resolvedAt: (row.resolved_at as string) ?? null,
    userName: (row.user_name as string) ?? undefined,
    userEmail: (row.user_email as string) ?? undefined,
    userAvatar: (row.user_avatar as string) ?? undefined,
  };
}

export const feedbackStorage = {
  /**
   * 提交反馈
   */
  async submitFeedback(category: string, description: string, images: string[]): Promise<StorageResult<Feedback>> {
    const result = await apiFetch<Record<string, unknown>>('/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({ category, description, images }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbFeedback(result.data) : ({} as Feedback) };
  },

  /**
   * 获取反馈列表（管理员获取全部，普通用户获取自己的）
   */
  async getFeedbacks(status?: string): Promise<StorageResult<Feedback[]>> {
    const params = status ? `?status=${status}` : '';
    const result = await apiFetch<Record<string, unknown>[]>(`/api/feedbacks${params}`);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const feedbacks = (result.data ?? []).map(mapDbFeedback);
    return { success: true, data: feedbacks };
  },

  /**
   * 管理员处理反馈
   */
  async resolveFeedback(feedbackId: string, adminReply?: string): Promise<StorageResult<Feedback>> {
    const result = await apiFetch<Record<string, unknown>>('/api/feedbacks', {
      method: 'PUT',
      body: JSON.stringify({ feedback_id: feedbackId, admin_reply: adminReply }),
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data ? mapDbFeedback(result.data) : ({} as Feedback) };
  },
};

// ==================== clickTracker 模块 ====================

/**
 * 点击追踪器 API 客户端
 *
 * 替代 clickTracker.ts 的 localStorage 实现，
 * 通过 HTTP 调用 /api/click-events 端点实现点击追踪。
 * 接口与原 clickTracker.ts 保持一致（异步版本）。
 */
export const clickTracker = {
  /**
   * 记录一次点击事件
   * 服务端自动处理5分钟去重逻辑
   */
  async recordClick(projectId: string): Promise<void> {
    await apiFetch<unknown>('/api/click-events', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
    // 静默处理，不关心返回结果（与原接口行为一致）
  },

  /**
   * 获取指定项目在时间窗口内的点击次数
   * @param projectId 项目ID
   * @param hours 时间窗口（小时），默认24小时
   */
  async getClickCount(projectId: string, hours: number = 24): Promise<number> {
    const result = await apiFetch<{ count: number }>(
      `/api/click-events?project_id=${encodeURIComponent(projectId)}&hours=${hours}`
    );
    if (!result.success || !result.data) {
      return 0;
    }
    return result.data.count;
  },

  /**
   * 批量获取多个项目的点击次数
   * @param projectIds 项目ID数组
   * @param hours 时间窗口（小时），默认24小时
   */
  async getBatchClickCounts(
    projectIds: string[],
    hours: number = 24
  ): Promise<Record<string, number>> {
    if (projectIds.length === 0) {
      return {};
    }
    const idsParam = projectIds.map(id => encodeURIComponent(id)).join(',');
    const result = await apiFetch<Record<string, number>>(
      `/api/click-events?project_ids=${idsParam}&hours=${hours}`
    );
    if (!result.success || !result.data) {
      // 失败时返回所有项目计数为0
      const empty: Record<string, number> = {};
      for (const id of projectIds) {
        empty[id] = 0;
      }
      return empty;
    }
    return result.data;
  },

  /**
   * 清理旧点击记录
   * 服务端自动管理数据清理，此方法为空操作（保持接口兼容）
   */
  async cleanup(_maxAgeDays?: number): Promise<void> {
    // 清理由服务端自动处理，客户端无需操作
  },
};

// ==================== balanceStorage 模块 ====================

export interface BalanceInfo {
  balance_cents: number;
  balance_yuan: string;
  updated_at: string | null;
  task_publish_fee_cents: number;
  task_publish_fee_yuan: string;
}

export interface BalanceTransaction {
  id: string;
  amount_cents: number;
  amount_yuan: string;
  type: 'recharge' | 'task_publish';
  related_id: string | null;
  created_at: string;
}

export const balanceStorage = {
  async getBalance(): Promise<StorageResult<BalanceInfo>> {
    return apiFetch<BalanceInfo>('/api/balance');
  },

  async getTransactions(limit = 20, offset = 0): Promise<
    StorageResult<{ items: BalanceTransaction[] }>
  > {
    return apiFetch<{ items: BalanceTransaction[] }>(
      `/api/balance/transactions?limit=${limit}&offset=${offset}`
    );
  },
};

// ==================== rechargeStorage 模块 ====================

export interface RechargeOrderResult {
  order_id: string;
  out_trade_no: string;
  amount_cents: number;
  amount_yuan: string;
  payment_channel: string;
  mock_pay_url?: string;
  charge?: Record<string, unknown>;
  redirect_url?: string;
  code_url?: string;
}

export const rechargeStorage = {
  async createOrder(
    amountCents: number,
    channel?: string
  ): Promise<StorageResult<RechargeOrderResult>> {
    return apiFetch<RechargeOrderResult>('/api/recharge/create', {
      method: 'POST',
      body: JSON.stringify({ amount_cents: amountCents, channel: channel || 'alipay_pc' }),
    });
  },

  async getOrderStatus(outTradeNo: string): Promise<
    StorageResult<{ status: string; amount_cents?: number }>
  > {
    return apiFetch<{ status: string; amount_cents?: number }>(
      `/api/recharge/status?out_trade_no=${encodeURIComponent(outTradeNo)}`
    );
  },

  async mockConfirm(outTradeNo: string): Promise<StorageResult<{ message: string; new_balance_cents?: number }>> {
    const res = await fetch(`/api/recharge/mock-confirm?out_trade_no=${encodeURIComponent(outTradeNo)}`, {
      cache: 'no-store',
    });
    const body = await res.json();
    return body as StorageResult<{ message: string; new_balance_cents?: number }>;
  },
};
