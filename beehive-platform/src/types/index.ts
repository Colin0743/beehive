// 用户角色类型
export type UserRole = 'user' | 'admin' | 'super_admin';

// 用户相关类型
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  passwordHash?: string; // 密码哈希（注册时设置，登录时验证）
  role?: UserRole; // 用户角色，默认为'user'
  isActive?: boolean; // 账号是否激活，默认为true
  createdAt: string;
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

