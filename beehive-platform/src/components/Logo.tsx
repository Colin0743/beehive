'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'light';
}

export default function Logo({ 
  size = 'medium', 
  showText = true, 
  className = '',
  variant = 'default'
}: LogoProps) {
  const { t } = useTranslation('common');
  
  const normalizedSize = size === 'sm' ? 'small' : size === 'md' ? 'medium' : size === 'lg' ? 'large' : size;
  
  const sizes = {
    small: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    medium: { icon: 36, text: 'text-xl', sub: 'text-[10px]' },
    large: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
  };

  const s = sizes[normalizedSize];
  const textColor = variant === 'light' ? '#f5f3ef' : '#f5f3ef';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo 图片 */}
      <img
        src="/logo.png"
        alt={t('appName')}
        width={s.icon}
        height={s.icon}
        data-testid="app-logo"
        style={{ objectFit: 'contain' }}
      />

      {showText && (
        <div className="flex flex-col">
          <span 
            className={`${s.text} font-medium tracking-tight`}
            style={{ 
              fontFamily: "'Playfair Display', serif",
              color: textColor,
            }}
          >
            {t('appName')}
          </span>
        </div>
      )}
    </div>
  );
}
