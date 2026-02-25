'use client';

import LayoutSimple from '@/components/LayoutSimple';
import FeedbackModal from '@/components/FeedbackModal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function HelpPage() {
  const { t } = useTranslation('common');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const faqs = [
    {
      question: t('help.q1'),
      answer: t('help.a1'),
    },
    {
      question: t('help.q2'),
      answer: t('help.a2'),
    },
    {
      question: t('help.q3'),
      answer: t('help.a3'),
    },
    {
      question: t('help.q4'),
      answer: t('help.a4'),
    },
    {
      question: t('help.q5'),
      answer: t('help.a5'),
    },
    {
      question: t('help.q6'),
      answer: t('help.a6'),
    },
    {
      question: t('help.q7'),
      answer: t('help.a7'),
    },
  ];

  return (
    <LayoutSimple>
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-3xl font-medium text-[var(--text-primary)] mb-8 animate-fade-up"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('faq')}
        </h1>

        <div className="card p-8">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-[var(--ink-border)] rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center hover:bg-[var(--ink-lighter)] transition-colors"
                >
                  <span className="font-medium text-[var(--text-primary)]">{faq.question}</span>
                  <span className="text-[var(--text-muted)] text-xl">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-4 text-[var(--text-secondary)] text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 反馈入口 */}
          <div className="mt-8 p-6 rounded-xl" style={{ background: 'var(--gold-muted)' }}>
            <h3 className="font-medium text-[var(--text-primary)] mb-2">{t('help.moreQuestions')}</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {t('help.moreQuestionsDesc')}
            </p>
            <button
              onClick={() => setFeedbackOpen(true)}
              className="btn btn-primary"
            >
              {t('feedback.entry')}
            </button>
          </div>
        </div>
      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </LayoutSimple>
  );
}
