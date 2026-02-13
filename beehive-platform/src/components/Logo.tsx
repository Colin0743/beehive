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
  const goldColor = variant === 'light' ? '#c9a227' : '#c9a227';
  const textColor = variant === 'light' ? '#f5f3ef' : '#f5f3ef';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 六边形蜂巢图标 - 精致几何设计 */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 外层六边形 */}
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          stroke={goldColor}
          strokeWidth="1.5"
          fill="none"
        />
        {/* 内层六边形 */}
        <path
          d="M24 12L34 18V30L24 36L14 30V18L24 12Z"
          stroke={goldColor}
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
        {/* 中心点 */}
        <circle cx="24" cy="24" r="3" fill={goldColor} />
      </svg>

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
          <span 
            className={`${s.sub} font-medium tracking-[0.2em] uppercase`}
            style={{ color: goldColor }}
          >
            AI Studio
          </span>
        </div>
      )}
    </div>
  );
}
