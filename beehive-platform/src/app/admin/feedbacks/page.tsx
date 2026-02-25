'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { feedbackStorage } from '@/lib/api';
import { Feedback } from '@/types';
import { useToast } from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function AdminFeedbacksPage() {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbacks();
  }, [statusFilter]);

  const loadFeedbacks = async () => {
    setLoading(true);
    const result = await feedbackStorage.getFeedbacks(statusFilter || undefined);
    if (result.success && result.data) {
      setFeedbacks(result.data);
    }
    setLoading(false);
  };

  const handleResolve = async (feedbackId: string) => {
    setProcessing(true);
    const result = await feedbackStorage.resolveFeedback(
      feedbackId,
      replyText.trim() || undefined
    );
    if (result.success) {
      showToast('success', t('admin.feedbackResolved'));
      setReplyingId(null);
      setReplyText('');
      loadFeedbacks();
    } else {
      showToast('error', result.error || t('admin.updateFailed'));
    }
    setProcessing(false);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-[var(--text-secondary)]">{t('loading')}</div>
        </div>
      </AdminLayout>
    );
  }

  const pendingCount = feedbacks.filter(f => f.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-3xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('admin.feedbackManagement')}
          </h1>
          {pendingCount > 0 && (
            <span className="tag tag-gold">
              {t('admin.pendingFeedbacks', { count: pendingCount })}
            </span>
          )}
        </div>

        {/* 状态筛选 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              !statusFilter
                ? 'bg-[var(--gold)] text-[var(--ink)]'
                : 'bg-[var(--ink-lighter)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('admin.allStatuses')}
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              statusFilter === 'pending'
                ? 'bg-[var(--gold)] text-[var(--ink)]'
                : 'bg-[var(--ink-lighter)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('admin.statusPending')}
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-[var(--gold)] text-[var(--ink)]'
                : 'bg-[var(--ink-lighter)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('admin.statusResolved')}
          </button>
        </div>

        {/* 反馈列表 */}
        {feedbacks.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-[var(--text-muted)]">{t('admin.noFeedbacks')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="card overflow-hidden">
                <div className="p-5">
                  {/* 头部：用户信息 + 状态 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={feedback.userAvatar || '/default-avatar.svg'}
                        alt=""
                        className="w-10 h-10 rounded-full border border-[var(--ink-border)]"
                      />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {feedback.userName || '未知用户'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {feedback.userEmail} · {formatTime(feedback.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`tag ${
                        feedback.status === 'pending'
                          ? 'tag-gold'
                          : ''
                      }`}
                      style={
                        feedback.status === 'resolved'
                          ? { background: 'rgba(74,222,128,0.15)', borderColor: 'transparent', color: 'var(--success)' }
                          : undefined
                      }
                    >
                      {feedback.status === 'pending' ? t('admin.statusPending') : t('admin.statusResolved')}
                    </span>
                  </div>

                  {/* 问题类型 */}
                  <div className="mb-3">
                    <span className="text-xs text-[var(--text-muted)]">{t('feedback.categoryLabel')}：</span>
                    <span className="text-sm text-[var(--gold)] font-medium">{feedback.category}</span>
                  </div>

                  {/* 问题描述 */}
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap mb-3">
                    {feedback.description}
                  </p>

                  {/* 反馈图片 */}
                  {feedback.images && feedback.images.length > 0 && (
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {feedback.images.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setPreviewImage(url)}
                          className="block"
                        >
                          <img
                            src={url}
                            alt={`feedback-image-${index}`}
                            className="w-24 h-24 object-cover rounded-lg border border-[var(--ink-border)] hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 管理员回复 */}
                  {feedback.adminReply && (
                    <div className="p-3 rounded-lg bg-[var(--ink-lighter)] border border-[var(--ink-border)] mb-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">{t('admin.adminReply')}：</p>
                      <p className="text-sm text-[var(--text-secondary)]">{feedback.adminReply}</p>
                    </div>
                  )}

                  {/* 处理操作 */}
                  {feedback.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-[var(--ink-border)]">
                      {replyingId === feedback.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t('admin.replyPlaceholder')}
                            className="w-full px-4 py-2.5 rounded-lg bg-[var(--ink-lighter)] border border-[var(--ink-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm resize-none"
                            rows={3}
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleResolve(feedback.id)}
                              disabled={processing}
                              className="btn btn-primary text-sm disabled:opacity-50"
                            >
                              {processing ? t('feedback.submitting') : t('admin.markResolved')}
                            </button>
                            <button
                              onClick={() => { setReplyingId(null); setReplyText(''); }}
                              className="btn btn-secondary text-sm"
                            >
                              {t('cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingId(feedback.id)}
                          className="btn btn-primary text-sm"
                        >
                          {t('admin.processFeedback')}
                        </button>
                      )}
                    </div>
                  )}

                  {/* 处理时间 */}
                  {feedback.resolvedAt && (
                    <p className="text-xs text-[var(--text-muted)] mt-3">
                      {t('admin.resolvedAt')}：{formatTime(feedback.resolvedAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 图片预览模态框 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </AdminLayout>
  );
}
