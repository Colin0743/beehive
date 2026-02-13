'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@/types';
import { createClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';
import type { Session } from '@supabase/supabase-js';

// AuthContext 接口定义
interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  isAdminUser: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  isProjectOwner: (projectId: string) => boolean;
}

// 创建 Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 将 Supabase session + profile 数据映射为应用层 User 对象
 */
function mapSessionToUser(session: Session, profile?: Record<string, unknown> | null): User {
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    name: (profile?.name as string) || (meta.name as string) || session.user.email?.split('@')[0] || '用户',
    email: session.user.email || '',
    avatar: (profile?.avatar as string) || (meta.avatar as string) || '/default-avatar.svg',
    role: (profile?.role as User['role']) || 'user',
    isActive: true,
    createdAt: session.user.created_at,
  };
}

// AuthProvider 组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 根据 session 获取/刷新用户信息
  const refreshUser = useCallback(async (session: Session | null) => {
    if (!session) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // 尝试从 profiles 表获取扩展信息
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar, role')
        .eq('id', session.user.id)
        .single();

      setUser(mapSessionToUser(session, profile));
    } catch {
      // profiles 表查询失败时，仍使用 session 基本信息
      setUser(mapSessionToUser(session, null));
    }

    setLoading(false);
  }, [supabase]);

  // 初始化：获取当前 session 并监听变化
  useEffect(() => {
    // 获取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      refreshUser(session);
    });

    // 监听 auth 状态变化（登录、登出、token 刷新等）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        refreshUser(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser, supabase]);

  // 发送 Magic Link (邮箱登录链接)
  const sendMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  }, [supabase]);

  // 兼容旧的 login 方法（直接设置 user 对象）
  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  // 登出
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, [supabase]);

  // 更新用户信息（写入 Supabase profiles 表）
  const updateUser = useCallback(async (updatedData: Partial<User>) => {
    if (!user) return;

    const profileUpdate: Record<string, unknown> = {};
    if (updatedData.name !== undefined) profileUpdate.name = updatedData.name;
    if (updatedData.avatar !== undefined) profileUpdate.avatar = updatedData.avatar;

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (error) throw new Error(error.message);
    }

    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  }, [user, supabase]);

  // 检查是否为项目发起人
  const isProjectOwner = useCallback((projectId: string): boolean => {
    // 简单版本：仅做本地检查，真实权限由后端 RLS 控制
    return false;
    // TODO: 可按需求从项目列表或缓存中判断
  }, []);

  const value: AuthContextValue = {
    user,
    isLoggedIn: !!user,
    loading,
    isAdminUser: isAdmin(user),
    login,
    logout,
    sendMagicLink,
    updateUser,
    isProjectOwner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
