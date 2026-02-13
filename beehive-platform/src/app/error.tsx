'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation('common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl text-[var(--text-primary)] mb-4">{t('somethingWentWrong')}</h2>
        <p className="text-[var(--text-muted)] mb-6">{error.message}</p>
        <button
          onClick={() => reset()}
          className="btn-primary"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  );
}
