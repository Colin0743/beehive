'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // 页面切换时显示加载动画
    setLoading(true);
    setShowLoader(true);

    // 延迟隐藏加载动画，给用户看到动画效果
    const timer = setTimeout(() => {
      setLoading(false);
      // 再延迟一点隐藏loader，确保动画完成
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
        {/* Logo 脉冲动画 */}
        <div className="animate-pulse-slow">
          <Logo size="lg" showText={false} />
        </div>
        
        {/* 加载文字 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">加载中</span>
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

