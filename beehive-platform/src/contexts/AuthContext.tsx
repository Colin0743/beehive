'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { userStorage, projectStorage } from '@/lib/storage';
import { ErrorHandler } from '@/lib/errorHandler';
import { isAdmin } from '@/lib/admin';

// AuthContext接口定义
interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  isAdminUser: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isProjectOwner: (projectId: string) => boolean;
}

// 创建Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// AuthProvider组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 从localStorage恢复用户状态
  useEffect(() => {
    const result = userStorage.getCurrentUser();
    if (result.success && result.data) {
      setUser(result.data);
    } else if (!result.success) {
      ErrorHandler.logError(new Error(result.error || '恢复用户状态失败'));
    }
    setLoading(false);
  }, []);

  // 登录函数
  const login = (userData: User) => {
    const result = userStorage.setCurrentUser(userData);
    if (result.success) {
      setUser(userData);
    } else {
      ErrorHandler.logError(new Error(result.error || '登录失败'));
      throw new Error(result.error || '登录失败');
    }
  };

  // 登出函数
  const logout = () => {
    const result = userStorage.clearCurrentUser();
    if (result.success) {
      setUser(null);
    } else {
      ErrorHandler.logError(new Error(result.error || '登出失败'));
    }
  };

  // 更新用户信息
  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updatedData };
    const result = userStorage.setCurrentUser(updatedUser);
    if (result.success) {
      setUser(updatedUser);
    } else {
      ErrorHandler.logError(new Error(result.error || '更新用户信息失败'));
      throw new Error(result.error || '更新用户信息失败');
    }
  };

  // 检查是否为项目发起人
  const isProjectOwner = (projectId: string): boolean => {
    if (!user) return false;
    
    const result = projectStorage.getUserProjects(user.id);
    if (!result.success || !result.data) {
      return false;
    }
    
    return result.data.some((p) => p.id === projectId);
  };

  const value: AuthContextValue = {
    user,
    isLoggedIn: !!user,
    loading,
    isAdminUser: isAdmin(user),
    login,
    logout,
    updateUser,
    isProjectOwner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
