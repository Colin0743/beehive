'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import { userStorage } from '@/lib/storage';
import { ErrorHandler } from '@/lib/errorHandler';
import { useToast } from '@/components/Toast';
import { FormErrors } from '@/types';
import { hashPassword } from '@/lib/password';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '姓名至少需要2个字符';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // 检查邮箱是否已存在
    const emailCheck = userStorage.findUserByEmail(formData.email.trim());
    if (emailCheck.success && emailCheck.data) {
      setErrors({ email: '该邮箱已被注册' });
      showToast('error', '该邮箱已被注册');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // 加密密码
      const passwordHashValue = await hashPassword(formData.password);

      const newUser = {
        id: `user_${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        avatar: '/default-avatar.svg',
        passwordHash: passwordHashValue, // 存储密码哈希
        role: 'user' as const, // 默认角色为普通用户
        isActive: true, // 默认激活
        createdAt: new Date().toISOString()
      };

      const result = userStorage.registerUser(newUser);
      
      if (!result.success) {
        const errorMsg = result.error || '注册失败，请重试';
        setErrors({ general: errorMsg });
        showToast('error', errorMsg);
        return;
      }

      // 创建不包含passwordHash的用户对象用于前端存储（安全考虑）
      const { passwordHash: _, ...userWithoutPassword } = result.data!;
      login(userWithoutPassword);
      showToast('success', '注册成功');
      router.push('/');
    } catch (error) {
      const errorMsg = ErrorHandler.handleError(error);
      ErrorHandler.logError(error);
      setErrors({ general: errorMsg });
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <LayoutSimple>
      <div className="max-w-md mx-auto">
        {/* 标题区域 - Figma 设计风格 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
              <path
                d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z"
                stroke="#FFD700"
                strokeWidth="2.5"
                fill="#FFD700"
                fillOpacity="0.1"
              />
              <circle cx="10" cy="10" r="1.5" fill="#FFD700" />
              <circle cx="14" cy="10" r="1.5" fill="#FFD700" />
              <circle cx="10" cy="14" r="1.5" fill="#FFD700" />
              <circle cx="14" cy="14" r="1.5" fill="#FFD700" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-2" style={{ color: '#111827' }}>加入蜂巢</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>开始你的AI视频创作之旅</p>
        </div>

        {/* 表单卡片 - Figma 设计风格 */}
        <div 
          className="rounded-xl p-8"
          style={{ 
            backgroundColor: '#ffffff',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div 
                className="px-4 py-3 rounded-lg mb-4 text-sm"
                style={{ 
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FECACA',
                  color: '#991B1B'
                }}
              >
                {errors.general}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>姓名</label>
              <input
                type="text"
                placeholder="请输入您的姓名"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full h-11 px-4 rounded-lg text-sm transition-all"
                style={{
                  border: errors.name ? '1px solid #EF4444' : '1px solid #D1D5DB',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.name) {
                    e.currentTarget.style.border = '2px solid #FFD700';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = errors.name ? '1px solid #EF4444' : '1px solid #D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>邮箱</label>
              <input
                type="email"
                placeholder="请输入您的邮箱"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full h-11 px-4 rounded-lg text-sm transition-all"
                style={{
                  border: errors.email ? '1px solid #EF4444' : '1px solid #D1D5DB',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.currentTarget.style.border = '2px solid #FFD700';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = errors.email ? '1px solid #EF4444' : '1px solid #D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>密码</label>
              <input
                type="password"
                placeholder="请输入密码（至少6个字符）"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full h-11 px-4 rounded-lg text-sm transition-all"
                style={{
                  border: errors.password ? '1px solid #EF4444' : '1px solid #D1D5DB',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.currentTarget.style.border = '2px solid #FFD700';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = errors.password ? '1px solid #EF4444' : '1px solid #D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.password}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>确认密码</label>
              <input
                type="password"
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full h-11 px-4 rounded-lg text-sm transition-all"
                style={{
                  border: errors.confirmPassword ? '1px solid #EF4444' : '1px solid #D1D5DB',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) {
                    e.currentTarget.style.border = '2px solid #FFD700';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = errors.confirmPassword ? '1px solid #EF4444' : '1px solid #D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {errors.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: loading ? '#D1D5DB' : '#FFD700',
                color: loading ? '#9CA3AF' : '#111827',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#E6C200';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#FFD700';
                }
              }}
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm" style={{ color: '#6B7280' }}>
              已有账户？{' '}
              <Link 
                href="/auth/login" 
                className="font-medium transition-colors hover:underline"
                style={{ color: '#4A90E2' }}
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </LayoutSimple>
  );
}
