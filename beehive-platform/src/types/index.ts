// 用户角色类型
export type UserRole = 'user' | 'admin' | 'super_admin';

// 用户相关类型
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: UserRole; // 用户角色，默认为'user'
  isActive?: boolean; // 账号是否激活，默认为true
  createdAt: string;
}

// 任务状态类型
export type TaskStatus = 'draft' | 'published' | 'completed';

// 任务接口
export interface Task {
  id: string;
  prompt: string;           // 提示词文本
  referenceImages: string[]; // 参考图片 base64 数组
  requirements: string;      // 任务需求说明
  creatorEmail: string;      // 创建者邮箱（用于接收提交）
  status: TaskStatus;        // 任务状态
  contributorName?: string;  // 完成者名称（completed 时填写）
  duration: number;          // 任务时长（5-30秒），表示该任务对项目进度的贡献量
  order: number;             // 排序序号
  createdAt: string;         // ISO 时间戳
  updatedAt: string;         // ISO 时间戳
}

// 任务接受记录接口
export interface TaskAcceptance {
  id: string;
  taskId: string;
  userId: string;
  acceptedAt: string;  // ISO 时间戳
}

// 站内通知接口
export interface Notification {
  id: string;
  type: 'task_completed' | 'contribution_accepted' | 'feedback_replied';
  message: string;
  taskId: string;
  projectId: string;
  isRead: boolean;
  createdAt: string;  // ISO 时间戳
}

// 用户反馈接口
export type FeedbackStatus = 'pending' | 'resolved';

export interface Feedback {
  id: string;
  userId: string;
  category: string;
  description: string;
  images: string[];
  status: FeedbackStatus;
  adminReply: string | null;
  createdAt: string;  // ISO 时间戳
  resolvedAt: string | null;
  // 管理员查看时可能包含用户信息
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

// 成就记录接口
export interface Achievement {
  id: string;
  taskId: string;
  taskName: string;
  contributorName: string;
  projectId: string;
  projectName: string;
  completedAt: string;  // ISO 时间戳
}

// 项目相关类型
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDuration: number;
  currentDuration: number;
  telegramGroup: string;
  coverImage: string;
  videoFile?: string;
  creatorId: string;
  creatorName: string;
  participantsCount: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  logs: ProjectLog[];
  tasks?: Task[];  // 任务数组
}

// 项目日志类型
export interface ProjectLog {
  id: string;
  type: 'update' | 'milestone' | 'announcement';
  content: string;
  createdAt: string;
  creatorName: string;
}

// 项目参与关系类型
export interface ProjectParticipation {
  id: string;
  role: 'worker_bee'; // 只有工蜂角色
  joinedAt: string;
}

// 项目关注关系类型
export interface ProjectFollow {
  id: string;
  followedAt: string;
}

// 表单错误类型
export interface FormErrors {
  [key: string]: string | undefined;
}

// 存储操作结果类型
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 错误类型枚举
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  STORAGE = 'STORAGE',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

// 应用错误类
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

