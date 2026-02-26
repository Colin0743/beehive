'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';

export default function TermsPage() {
  const { t } = useTranslation('common');

  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          {t('termsTitle')}
        </h1>
        <p className="text-[var(--text-muted)] mb-8">
          {t('termsLastUpdated')}
        </p>

        <div className="space-y-8 text-[var(--text-secondary)]">
          {/* Section 1: Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section1Title')}
            </h2>
            <p className="leading-relaxed">{t('terms.section1Content')}</p>
          </section>

          {/* Section 2: User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section2Title')}
            </h2>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>{t('terms.section2Item1')}</li>
              <li>{t('terms.section2Item2')}</li>
              <li>{t('terms.section2Item3')}</li>
              <li>{t('terms.section2Item4')}</li>
            </ul>
          </section>

          {/* Section 3: User Conduct */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section3Title')}
            </h2>
            <p className="mb-2">{t('terms.section3Intro')}</p>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>{t('terms.section3Item1')}</li>
              <li>{t('terms.section3Item2')}</li>
              <li>{t('terms.section3Item3')}</li>
              <li>{t('terms.section3Item4')}</li>
              <li>{t('terms.section3Item5')}</li>
            </ul>
          </section>

          {/* Section 4: Content Ownership */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section4Title')}
            </h2>
            <p className="leading-relaxed">{t('terms.section4Content')}</p>
          </section>

          {/* Section 5: Payment and Refunds */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section5Title')}
            </h2>
            <div className="space-y-4 leading-relaxed">
              <p>{t('terms.section5Content')}</p>
              <ul className="list-disc list-inside space-y-2">
                <li>{t('terms.section5Item1')}</li>
                <li>{t('terms.section5Item2')}</li>
                <li>{t('terms.section5Item3')}</li>
                <li>{t('terms.section5Item4')}</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Payment Processing */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section6Title')}
            </h2>
            <p className="leading-relaxed">{t('terms.section6Content')}</p>
          </section>

          {/* Section 7: Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section7Title')}
            </h2>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>{t('terms.section7Item1')}</li>
              <li>{t('terms.section7Item2')}</li>
              <li>{t('terms.section7Item3')}</li>
              <li>{t('terms.section7Item4')}</li>
            </ul>
          </section>

          {/* Section 8: Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section8Title')}
            </h2>
            <p className="leading-relaxed">{t('terms.section8Content')}</p>
          </section>

          {/* Section 9: Modification of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section9Title')}
            </h2>
            <p className="leading-relaxed">{t('terms.section9Content')}</p>
          </section>

          {/* Section 10: Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {t('terms.section10Title')}
            </h2>
            <p className="leading-relaxed">{t('terms.section10Content')}</p>
          </section>
        </div>
      </div>
    </LayoutSimple>
  );
}
