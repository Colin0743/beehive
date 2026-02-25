'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function DynamicTitle() {
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    // 根据当前语言更新页面标题
    const title = t('site.title');
    const description = t('site.description');
    
    document.title = title;
    
    // 更新 meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [t, i18n.language]);

  return null;
}
