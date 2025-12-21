'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

export default function Footer() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/?category=${category}`);
  };

  return (
    <footer className="bg-white border-t border-neutral-200 mt-16">
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="mb-4">
              <Logo size="medium" />
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {t('footerDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm text-neutral-900 mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/about" className="hover:text-neutral-900 transition-colors">{t('aboutUs')}</Link></li>
              <li><Link href="/how-it-works" className="hover:text-neutral-900 transition-colors">{t('howItWorks')}</Link></li>
              <li><Link href="/guide" className="hover:text-neutral-900 transition-colors">{t('creationGuide')}</Link></li>
              <li><Link href="/help" className="hover:text-neutral-900 transition-colors">{t('helpCenter')}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm text-neutral-900 mb-4">{t('projectCategories')}</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><button onClick={() => handleCategoryClick('sciFi')} className="hover:text-neutral-900 transition-colors">{t('sciFi')}</button></li>
              <li><button onClick={() => handleCategoryClick('animation')} className="hover:text-neutral-900 transition-colors">{t('animation')}</button></li>
              <li><button onClick={() => handleCategoryClick('documentary')} className="hover:text-neutral-900 transition-colors">{t('documentary')}</button></li>
              <li><button onClick={() => handleCategoryClick('education')} className="hover:text-neutral-900 transition-colors">{t('education')}</button></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm text-neutral-900 mb-4">{t('community')}</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><a href="#" className="hover:text-neutral-900 transition-colors">{t('blog')}</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">{t('creatorStories')}</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">{t('partners')}</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">{t('contactUs')}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            {t('allRightsReserved')}
          </p>
          <div className="flex gap-6 text-sm text-neutral-500">
            <Link href="/privacy" className="hover:text-neutral-900 transition-colors">{t('privacyPolicy')}</Link>
            <Link href="/terms" className="hover:text-neutral-900 transition-colors">{t('termsOfService')}</Link>
            <Link href="/cookies" className="hover:text-neutral-900 transition-colors">{t('cookieSettings')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
