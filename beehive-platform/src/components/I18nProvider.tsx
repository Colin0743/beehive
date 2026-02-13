'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  // 初始状态始终为 false，确保服务端和客户端首次渲染一致（避免 hydration mismatch）
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 客户端挂载后检查 i18n 状态
    if (i18n.isInitialized) {
      setIsReady(true);
      return;
    }

    const handleInitialized = () => {
      setIsReady(true);
    };
    i18n.on('initialized', handleInitialized);

    // 如果还没开始初始化，手动触发
    if (!i18n.isInitializing) {
      i18n.init().then(() => {
        setIsReady(true);
      });
    }

    return () => {
      i18n.off('initialized', handleInitialized);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[var(--ink)] flex justify-center items-center">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}