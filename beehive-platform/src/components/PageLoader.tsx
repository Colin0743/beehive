'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const goldColor = '#c9a227';

/** 独立的六边形蜂巢 SVG 图标，不依赖 Logo 组件 */
function HexagonIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

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
          <HexagonIcon size={48} />
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

