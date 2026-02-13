'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

export default function Footer() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const categories = [
    { key: 'film', label: t('film') },
    { key: 'animation', label: t('animation') },
    { key: 'commercial', label: t('commercial') },
    { key: 'publicWelfare', label: t('publicWelfare') },
  ];

  return (
    <footer className="border-t border-[var(--ink-border)] py-16 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <Logo size="medium" className="mb-4" />
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {t('footerDescription')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              <li><Link href="/about" className="hover:text-[var(--gold)] transition-colors">{t('aboutUs')}</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[var(--gold)] transition-colors">{t('howItWorks')}</Link></li>
              <li><Link href="/guide" className="hover:text-[var(--gold)] transition-colors">{t('creationGuide')}</Link></li>
              <li><Link href="/help" className="hover:text-[var(--gold)] transition-colors">{t('helpCenter')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t('projectCategories')}</h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              {categories.map(cat => (
                <li key={cat.key}>
                  <button onClick={() => router.push(`/?category=${cat.key}`)} className="hover:text-[var(--gold)] transition-colors">
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t('community')}</h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('blog')}</a></li>
              <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('creatorStories')}</a></li>
              <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('partners')}</a></li>
              <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('contactUs')}</a></li>
            </ul>
          </div>
        </div>
        <div className="divider my-12" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
          <p>{t('allRightsReserved')}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[var(--gold)] transition-colors">{t('privacyPolicy')}</Link>
            <Link href="/terms" className="hover:text-[var(--gold)] transition-colors">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
