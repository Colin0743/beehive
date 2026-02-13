'use client';

import i18n from '@/lib/i18n';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = typeof window !== 'undefined' ? (localStorage.getItem('i18nextLng') || i18n.language || 'en') : 'en';
  const isZh = lang.startsWith('zh');

  return (
    <html>
      <body>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#fff'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{isZh ? '出错了' : 'Something went wrong'}</h2>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>{error.message}</p>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#d4a853',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              {isZh ? '重试' : 'Retry'}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
