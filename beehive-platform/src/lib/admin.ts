import { User, UserRole } from '@/types';
import { userStorage } from './storage';

/**
 * 检查用户是否为管理员
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'super_admin';
}

/**
 * 检查用户是否为超级管理员
 */
export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin';
}

/**
 * 检查用户账号是否激活
 */
export function isUserActive(user: User | null): boolean {
  if (!user) return false;
  return user.isActive !== false; // 默认为true
}

/**
 * 获取用户角色显示名称
 */
export function getUserRoleName(role?: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '超级管理员';
    case 'admin':
      return '管理员';
    case 'user':
    default:
      return '普通用户';
  }
}

/**
 * 初始化默认管理员账号
 * 如果不存在管理员账号，创建一个默认的超级管理员
 */
export function initDefaultAdmin(): void {
  const adminEmail = 'admin@beehive.local';
  const result = userStorage.findUserByEmail(adminEmail);
  
  if (!result.success || !result.data) {
    // 创建默认管理员账号
    const defaultAdmin: User = {
      id: 'admin_1',
      name: '系统管理员',
      email: adminEmail,
      avatar: '/default-avatar.svg',
      role: 'super_admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    
    // 注意：这里不设置passwordHash，管理员需要通过特殊方式设置密码
    userStorage.registerUser(defaultAdmin);
    console.log('默认管理员账号已创建:', adminEmail);
  }
}

