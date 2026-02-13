'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

export default function PageLoader() {
  const pathname = usePathname();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 首次渲染不显示加载动画（避免遮挡页面内容）
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 后续页面切换时显示加载动画
    setLoading(true);
    setShowLoader(true);

    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => {
        setShowLoader(false);
      }, 300);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!showLoader) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300 ${
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse-slow">
          <Logo size="lg" showText={false} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">{t('loadingText')}</span>
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

