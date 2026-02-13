'use client';

import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';

export default function TermsPage() {
  const { t } = useTranslation('common');

  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium text-[#111827] mb-8">{t('termsTitle')}</h1>
        
        <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-6 text-[#4B5563]">
          <p className="text-sm">{t('termsLastUpdated')}</p>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">{t('terms.section1Title')}</h2>
            <p className="leading-relaxed">{t('terms.section1Content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">{t('terms.section2Title')}</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>{t('terms.section2Item1')}</li>
              <li>{t('terms.section2Item2')}</li>
              <li>{t('terms.section2Item3')}</li>
              <li>{t('terms.section2Item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">{t('terms.section3Title')}</h2>
            <p className="leading-relaxed mb-2">{t('terms.section3Intro')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>{t('terms.section3Item1')}</li>
              <li>{t('terms.section3Item2')}</li>
              <li>{t('terms.section3Item3')}</li>
              <li>{t('terms.section3Item4')}</li>
              <li>{t('terms.section3Item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">{t('terms.section4Title')}</h2>
            <p className="leading-relaxed">{t('terms.section4Content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">{t('terms.section5Title')}</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>{t('terms.section5Item1')}</li>
              <li>{t('terms.section5Item2')}</li>
              <li>{t('terms.section5Item3')}</li>
              <li>{t('terms.section5Item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">{t('terms.section6Title')}</h2>
            <p className="leading-relaxed">{t('terms.section6Content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">{t('terms.section7Title')}</h2>
            <p className="leading-relaxed">{t('terms.section7Content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#111827] mb-3">{t('terms.section8Title')}</h2>
            <p className="leading-relaxed">{t('terms.section8Content')}</p>
          </section>
        </div>
      </div>
    </LayoutSimple>
  );
}
