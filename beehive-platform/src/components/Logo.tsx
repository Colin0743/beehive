'use client';

import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

// 基于 Figma 设计的 Logo 组件
export default function Logo({ size = 'medium', showText = true, className = '' }: LogoProps) {
  // 统一尺寸映射
  const normalizedSize = size === 'sm' ? 'small' : size === 'md' ? 'medium' : size === 'lg' ? 'large' : size;
  
  const sizes = {
    small: { icon: 20, text: 'text-base' },
    medium: { icon: 28, text: 'text-xl' },
    large: { icon: 40, text: 'text-3xl' },
  };

  const currentSize = sizes[normalizedSize];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 六边形蜂巢 Logo - 来自 Figma 设计 */}
      <div className="relative">
        {/* 外层六边形 */}
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-110"
        >
          {/* 六边形轮廓 */}
          <path
            d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z"
            stroke="#FFD700"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFD700"
            fillOpacity="0.1"
          />
          {/* 内部蜂巢图案 - 4个点 */}
          <circle cx="10" cy="10" r="1.5" fill="#FFD700" />
          <circle cx="14" cy="10" r="1.5" fill="#FFD700" />
          <circle cx="10" cy="14" r="1.5" fill="#FFD700" />
          <circle cx="14" cy="14" r="1.5" fill="#FFD700" />
        </svg>
      </div>

      {/* Logo 文字 */}
      {showText && (
        <span className={`${currentSize.text} font-semibold`} style={{ color: '#FFD700' }}>
          蜂巢
        </span>
      )}
    </div>
  );
}
