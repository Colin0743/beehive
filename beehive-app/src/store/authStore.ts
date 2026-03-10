import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, mapDbProfile } from '../types';
import type { Session } from '@supabase/supabase-js';

import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    initialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    signInWithPassword: (email: string, password: string) => Promise<void>;
    signInWithOAuth: (provider: 'apple' | 'google') => Promise<void>;
    signUpWithPassword: (email: string, password: string, name: string) => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, token: string, type: 'magiclink' | 'signup') => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    loading: true,
    initialized: false,

    initialize: async () => {
        try {
            // 获取当前 session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const user = await fetchProfile(session);
                set({ user, session, loading: false, initialized: true });
            } else {
                set({ user: null, session: null, loading: false, initialized: true });
            }

            // 监听 auth 状态变化
            supabase.auth.onAuthStateChange(async (_event, session) => {
                if (session) {
                    const user = await fetchProfile(session);
                    set({ user, session, loading: false });
                } else {
                    set({ user: null, session: null, loading: false });
                }
            });
        } catch (error) {
            console.error('[AuthStore] initialize error:', error);
            set({ loading: false, initialized: true });
        }
    },

    signInWithPassword: async (email: string, password: string) => {
        set({ loading: true });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            set({ loading: false });
            throw error;
        }
        // onAuthStateChange 会自动更新 state
    },

    signInWithOAuth: async (provider: 'apple' | 'google') => {
        set({ loading: true });
        try {
            // 在 Web (Expo Web) 上，避免打开容易遇到跨站问题的 Popup，而是使用标准的原生重定向
            if (Platform.OS === 'web') {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider,
                    options: {
                        // 重定向回当前域名的根路径
                        redirectTo: window.location.origin,
                    },
                });
                if (error) {
                    set({ loading: false });
                    throw error;
                }
                // 注意：这里不要设置 loading: false，因为页面马上就会刷新跳走
                return;
            }

            // App 原生环境处理
            // makeRedirectUri will automatically figure out the correct exp:// or beehive:// url
            const redirectUrl = makeRedirectUri({
                scheme: 'beehive',
                path: 'auth/callback',
            });
            console.log(`[OAuth] Starting ${provider} login with generated redirectUrl:`, redirectUrl);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;
            if (!data?.url) throw new Error('No OAuth URL returned from Supabase');

            const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (res.type === 'success') {
                const { url } = res;
                const { params, errorCode } = QueryParams.getQueryParams(url);

                if (errorCode) throw new Error(errorCode);

                if (params?.access_token && params?.refresh_token) {
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: params.access_token,
                        refresh_token: params.refresh_token,
                    });
                    if (sessionError) throw sessionError;
                } else if (params?.code) {
                    // With PKCE flow, we exchange the code
                    const { error: codeError } = await supabase.auth.exchangeCodeForSession(params.code);
                    if (codeError) throw codeError;
                }
            } else {
                console.log('[OAuth] Browser auth session closed or failed', res);
            }
        } catch (error) {
            console.error('[OAuth] signInWithOAuth error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    signUpWithPassword: async (email: string, password: string, name: string) => {
        set({ loading: true });
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        if (error) {
            set({ loading: false });
            throw error;
        }
    },

    sendOtp: async (email: string) => {
        set({ loading: true });
        const { error } = await supabase.auth.signInWithOtp({
            email,
        });
        set({ loading: false });
        if (error) throw error;
    },

    verifyOtp: async (email: string, token: string, type: 'magiclink' | 'signup') => {
        set({ loading: true });
        const { data: { session }, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type,
        });

        if (error) {
            set({ loading: false });
            throw error;
        }

        if (session) {
            const user = await fetchProfile(session);
            set({ user, session, loading: false });
        } else {
            set({ loading: false });
        }
    },

    signOut: async () => {
        set({ loading: true });
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } finally {
            set({ user: null, session: null, loading: false });
        }
    },

    refreshProfile: async () => {
        const { session } = get();
        if (!session) return;
        const user = await fetchProfile(session);
        set({ user });
    },

    updateProfile: async (updates: { name?: string; avatar?: string }) => {
        const { user } = get();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) throw error;

        // 本地乐观更新
        set({
            user: {
                ...user,
                ...(updates.name !== undefined ? { name: updates.name } : {}),
                ...(updates.avatar !== undefined ? { avatar: updates.avatar } : {}),
            },
        });
    },
}));

/** 从 profiles 表拉取用户扩展信息并合并 session 基础信息 */
async function fetchProfile(session: Session): Promise<User> {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, avatar, role, is_active, created_at')
            .eq('id', session.user.id)
            .single();

        if (profile) {
            const user = mapDbProfile(profile);
            user.email = session.user.email ?? '';
            return user;
        }
    } catch {
        // profiles 查询失败时回退到 session 基础信息
    }

    const meta = session.user.user_metadata ?? {};
    return {
        id: session.user.id,
        name: (meta.name as string) || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        avatar: (meta.avatar as string) || '',
        role: 'user',
        isActive: true,
        createdAt: session.user.created_at,
    };
}
