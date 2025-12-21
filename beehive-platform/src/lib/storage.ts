import type { Project, User, ProjectLog, ProjectParticipation, ProjectFollow, StorageResult } from '@/types';

// Storage键名常量
const STORAGE_KEYS = {
  USER: 'user',
  REGISTERED_USERS: 'registeredUsers',
  PROJECTS: 'projects',
  USER_PROJECTS: (userId: string) => `userProjects_${userId}`,
  FOLLOWED_PROJECTS: (userId: string) => `followedProjects_${userId}`,
  PARTICIPATED_PROJECTS: (userId: string) => `participatedProjects_${userId}`,
} as const;

// 存储配额检查（localStorage通常限制为5-10MB）
const STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB

/**
 * 检查localStorage可用空间
 */
function checkStorageQuota(): { available: boolean; used: number; limit: number } {
  try {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    return {
      available: used < STORAGE_LIMIT,
      used,
      limit: STORAGE_LIMIT,
    };
  } catch (error) {
    return { available: false, used: 0, limit: STORAGE_LIMIT };
  }
}

/**
 * 安全的localStorage操作
 */
function safeSetItem(key: string, value: string): StorageResult<void> {
  try {
    const quota = checkStorageQuota();
    const itemSize = key.length + value.length;
    
    if (!quota.available && quota.used + itemSize > STORAGE_LIMIT) {
      return {
        success: false,
        error: '存储空间不足，请清理浏览器数据或删除一些项目',
      };
    }

    localStorage.setItem(key, value);
    return { success: true };
  } catch (error: any) {
    if (error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: '存储空间不足，请清理浏览器数据',
      };
    }
    return {
      success: false,
      error: error.message || '存储操作失败',
    };
  }
}

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

function safeRemoveItem(key: string): StorageResult<void> {
  try {
    localStorage.removeItem(key);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '删除存储失败',
    };
  }
}

// ==================== 用户操作 ====================

export const userStorage = {
  /**
   * 获取当前登录用户
   */
  getCurrentUser(): StorageResult<User | null> {
    const result = safeGetItem(STORAGE_KEYS.USER);
    if (!result.success || !result.data) {
      return { success: true, data: null };
    }
    try {
      const user = JSON.parse(result.data) as User;
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: '用户数据格式错误' };
    }
  },

  /**
   * 保存当前登录用户
   */
  setCurrentUser(user: User): StorageResult<void> {
    const result = safeSetItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return result;
  },

  /**
   * 清除当前登录用户
   */
  clearCurrentUser(): StorageResult<void> {
    return safeRemoveItem(STORAGE_KEYS.USER);
  },

  /**
   * 获取所有注册用户
   */
  getAllUsers(): StorageResult<User[]> {
    const result = safeGetItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    try {
      const users = result.data ? (JSON.parse(result.data) as User[]) : [];
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: '用户列表数据格式错误' };
    }
  },

  /**
   * 注册新用户
   */
  registerUser(user: User): StorageResult<User> {
    const usersResult = this.getAllUsers();
    if (!usersResult.success) {
      return { success: false, error: usersResult.error };
    }

    const users = usersResult.data || [];
    
    // 检查邮箱是否已存在
    if (users.some(u => u.email === user.email)) {
      return { success: false, error: '该邮箱已被注册' };
    }

    users.push(user);
    const saveResult = safeSetItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return { success: true, data: user };
  },

  /**
   * 根据邮箱查找用户
   */
  findUserByEmail(email: string): StorageResult<User | null> {
    const usersResult = this.getAllUsers();
    if (!usersResult.success) {
      return { success: false, error: usersResult.error };
    }

    const users = usersResult.data || [];
    const user = users.find(u => u.email === email) || null;
    return { success: true, data: user };
  },

  /**
   * 根据ID查找用户
   */
  findUserById(userId: string): StorageResult<User | null> {
    const usersResult = this.getAllUsers();
    if (!usersResult.success) {
      return { success: false, error: usersResult.error };
    }

    const users = usersResult.data || [];
    const user = users.find(u => u.id === userId) || null;
    return { success: true, data: user };
  },

  /**
   * 更新用户信息
   */
  updateUser(userId: string, updates: Partial<User>): StorageResult<User> {
    const usersResult = this.getAllUsers();
    if (!usersResult.success) {
      return { success: false, error: usersResult.error };
    }

    const users = usersResult.data || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, error: '用户不存在' };
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    const saveResult = safeSetItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return { success: true, data: users[userIndex] };
  },

  /**
   * 删除用户
   */
  deleteUser(userId: string): StorageResult<void> {
    const usersResult = this.getAllUsers();
    if (!usersResult.success) {
      return { success: false, error: usersResult.error };
    }

    const users = usersResult.data || [];
    const filteredUsers = users.filter(u => u.id !== userId);
    
    const saveResult = safeSetItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(filteredUsers));
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return { success: true };
  },
};

// ==================== 项目操作 ====================

export const projectStorage = {
  /**
   * 获取所有项目
   */
  getAllProjects(): StorageResult<Project[]> {
    const result = safeGetItem(STORAGE_KEYS.PROJECTS);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    try {
      const projects = result.data ? (JSON.parse(result.data) as Project[]) : [];
      return { success: true, data: projects };
    } catch (error) {
      return { success: false, error: '项目列表数据格式错误' };
    }
  },

  /**
   * 根据ID获取项目
   */
  getProjectById(id: string): StorageResult<Project | null> {
    const projectsResult = this.getAllProjects();
    if (!projectsResult.success) {
      return { success: false, error: projectsResult.error };
    }

    const projects = projectsResult.data || [];
    const project = projects.find(p => p.id === id) || null;
    return { success: true, data: project };
  },

  /**
   * 创建项目
   */
  createProject(project: Project): StorageResult<Project> {
    const projectsResult = this.getAllProjects();
    if (!projectsResult.success) {
      return { success: false, error: projectsResult.error };
    }

    const projects = projectsResult.data || [];
    
    // 检查ID是否已存在
    if (projects.some(p => p.id === project.id)) {
      return { success: false, error: '项目ID已存在' };
    }

    projects.push(project);
    const saveResult = safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    // 更新用户项目列表
    const userProjectsResult = safeGetItem(STORAGE_KEYS.USER_PROJECTS(project.creatorId));
    if (userProjectsResult.success) {
      const userProjects = userProjectsResult.data 
        ? (JSON.parse(userProjectsResult.data) as Project[])
        : [];
      userProjects.push(project);
      safeSetItem(STORAGE_KEYS.USER_PROJECTS(project.creatorId), JSON.stringify(userProjects));
    }

    return { success: true, data: project };
  },

  /**
   * 更新项目
   */
  updateProject(id: string, updates: Partial<Project>): StorageResult<Project> {
    const projectsResult = this.getAllProjects();
    if (!projectsResult.success) {
      return { success: false, error: projectsResult.error };
    }

    const projects = projectsResult.data || [];
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      return { success: false, error: '项目不存在' };
    }

    projects[index] = { ...projects[index], ...updates };
    const saveResult = safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return { success: true, data: projects[index] };
  },

  /**
   * 添加项目日志
   */
  addProjectLog(projectId: string, log: ProjectLog): StorageResult<ProjectLog> {
    const projectResult = this.getProjectById(projectId);
    if (!projectResult.success || !projectResult.data) {
      return { success: false, error: '项目不存在' };
    }

    const project = projectResult.data;
    project.logs = [...(project.logs || []), log];

    const updateResult = this.updateProject(projectId, { logs: project.logs });
    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }

    return { success: true, data: log };
  },

  /**
   * 删除项目
   */
  deleteProject(id: string): StorageResult<void> {
    const projectsResult = this.getAllProjects();
    if (!projectsResult.success) {
      return { success: false, error: projectsResult.error };
    }

    const projects = projectsResult.data || [];
    const filteredProjects = projects.filter(p => p.id !== id);
    
    const saveResult = safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filteredProjects));
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return { success: true };
  },

  /**
   * 获取用户创建的项目
   */
  getUserProjects(userId: string): StorageResult<Project[]> {
    const result = safeGetItem(STORAGE_KEYS.USER_PROJECTS(userId));
    if (!result.success) {
      return { success: false, error: result.error };
    }
    try {
      const projects = result.data ? (JSON.parse(result.data) as Project[]) : [];
      return { success: true, data: projects };
    } catch (error) {
      return { success: false, error: '用户项目数据格式错误' };
    }
  },
};

// ==================== 项目关系操作 ====================

export const projectRelationStorage = {
  /**
   * 关注项目
   */
  followProject(userId: string, projectId: string): StorageResult<void> {
    const key = STORAGE_KEYS.FOLLOWED_PROJECTS(userId);
    const result = safeGetItem(key);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const follows = result.data ? (JSON.parse(result.data) as ProjectFollow[]) : [];
    
    if (follows.some(f => f.id === projectId)) {
      return { success: false, error: '已经关注过该项目' };
    }

    follows.push({ id: projectId, followedAt: new Date().toISOString() });
    return safeSetItem(key, JSON.stringify(follows));
  },

  /**
   * 取消关注项目
   */
  unfollowProject(userId: string, projectId: string): StorageResult<void> {
    const key = STORAGE_KEYS.FOLLOWED_PROJECTS(userId);
    const result = safeGetItem(key);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const follows = result.data ? (JSON.parse(result.data) as ProjectFollow[]) : [];
    const updated = follows.filter(f => f.id !== projectId);
    
    return safeSetItem(key, JSON.stringify(updated));
  },

  /**
   * 检查是否关注项目
   */
  isFollowing(userId: string, projectId: string): StorageResult<boolean> {
    const key = STORAGE_KEYS.FOLLOWED_PROJECTS(userId);
    const result = safeGetItem(key);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const follows = result.data ? (JSON.parse(result.data) as ProjectFollow[]) : [];
    const isFollowing = follows.some(f => f.id === projectId);
    
    return { success: true, data: isFollowing };
  },

  /**
   * 获取用户关注的项目ID列表
   */
  getFollowedProjectIds(userId: string): StorageResult<string[]> {
    const key = STORAGE_KEYS.FOLLOWED_PROJECTS(userId);
    const result = safeGetItem(key);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const follows = result.data ? (JSON.parse(result.data) as ProjectFollow[]) : [];
    return { success: true, data: follows.map(f => f.id) };
  },

  /**
   * 参与项目
   */
  participateInProject(
    userId: string,
    projectId: string,
    role: 'worker_bee' // 只有工蜂角色
  ): StorageResult<void> {
    const key = STORAGE_KEYS.PARTICIPATED_PROJECTS(userId);
    const result = safeGetItem(key);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const participations = result.data 
      ? (JSON.parse(result.data) as ProjectParticipation[])
      : [];
    
    if (participations.some(p => p.id === projectId)) {
      return { success: false, error: '已经参与过该项目' };
    }

    participations.push({
      id: projectId,
      role,
      joinedAt: new Date().toISOString(),
    });

    const saveResult = safeSetItem(key, JSON.stringify(participations));
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    // 更新项目参与者计数
    const projectResult = projectStorage.getProjectById(projectId);
    if (projectResult.success && projectResult.data) {
      const project = projectResult.data;
      projectStorage.updateProject(projectId, {
        participantsCount: (project.participantsCount || 0) + 1,
      });
    }

    return { success: true };
  },

  /**
   * 检查是否参与项目
   */
  isParticipating(userId: string, projectId: string): StorageResult<boolean> {
    const key = STORAGE_KEYS.PARTICIPATED_PROJECTS(userId);
    const result = safeGetItem(key);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const participations = result.data 
      ? (JSON.parse(result.data) as ProjectParticipation[])
      : [];
    const isParticipating = participations.some(p => p.id === projectId);
    
    return { success: true, data: isParticipating };
  },

  /**
   * 获取用户参与的项目ID列表
   */
  getParticipatedProjectIds(userId: string): StorageResult<string[]> {
    const key = STORAGE_KEYS.PARTICIPATED_PROJECTS(userId);
    const result = safeGetItem(key);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const participations = result.data 
      ? (JSON.parse(result.data) as ProjectParticipation[])
      : [];
    return { success: true, data: participations.map(p => p.id) };
  },
};

// ==================== 存储工具函数 ====================

export const storageUtils = {
  /**
   * 检查存储配额
   */
  checkQuota: checkStorageQuota,

  /**
   * 清理所有数据（危险操作）
   */
  clearAll(): StorageResult<void> {
    try {
      localStorage.clear();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || '清理失败' };
    }
  },

  /**
   * 导出所有数据
   */
  exportAll(): StorageResult<Record<string, any>> {
    try {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value;
            }
          }
        }
      }
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || '导出失败' };
    }
  },
};

