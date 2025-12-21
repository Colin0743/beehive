'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import { userStorage } from '@/lib/storage';
import { ErrorHandler } from '@/lib/errorHandler';
import { useToast } from '@/components/Toast';
import { FormErrors } from '@/types';
import { verifyPassword } from '@/lib/password';

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
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

    setLoading(true);
    setErrors({});

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = userStorage.findUserByEmail(formData.email.trim());
      
      if (!result.success) {
        const errorMsg = result.error || t('loginFailed');
        setErrors({ general: errorMsg });
        showToast('error', errorMsg);
        return;
      }

      if (!result.data) {
        const errorMsg = t('wrongCredentials');
        setErrors({ general: errorMsg });
        showToast('error', errorMsg);
        return;
      }

      const user = result.data;

      if (user.passwordHash) {
        const isValidPassword = await verifyPassword(formData.password, user.passwordHash);
        if (!isValidPassword) {
          const errorMsg = t('wrongCredentials');
          setErrors({ general: errorMsg });
          showToast('error', errorMsg);
          return;
        }
      } else {
        console.warn('User has no password hash, this is legacy data');
      }

      const { passwordHash, ...userWithoutPassword } = user;
      login(userWithoutPassword);
      showToast('success', t('loginSuccess'));
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
          <h2 className="text-2xl font-medium mb-2" style={{ color: '#111827' }}>{t('welcomeBack')}</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>{t('continueJourney')}</p>
        </div>

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
              <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>{t('email')}</label>
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
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

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>{t('password')}</label>
              <input
                type="password"
                placeholder={t('passwordPlaceholder')}
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
              {loading ? t('loggingIn') : t('login')}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {t('noAccount')}{' '}
              <Link 
                href="/auth/register" 
                className="font-medium transition-colors hover:underline"
                style={{ color: '#4A90E2' }}
              >
                {t('registerNow')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </LayoutSimple>
  );
}
