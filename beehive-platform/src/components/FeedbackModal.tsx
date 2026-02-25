'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackStorage } from '@/lib/api';
import { useToast } from '@/components/Toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // 上传图片
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= 3) {
      showToast('warning', t('feedback.maxImages'));
      return;
    }

    const file = files[0];

    // 验证文件类型
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      showToast('error', t('unsupportedImageFormat'));
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', t('imageSizeError'));
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.success && result.data?.url) {
        setImages(prev => [...prev, result.data.url]);
      } else {
        showToast('error', t('fileProcessFailed'));
      }
    } catch {
      showToast('error', t('fileProcessFailed'));
    } finally {
      setUploading(false);
      // 重置 input 以便再次选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // 提交反馈
  const handleSubmit = async () => {
    if (!category.trim()) {
      showToast('warning', t('feedback.categoryRequired'));
      return;
    }
    if (!description.trim()) {
      showToast('warning', t('feedback.descriptionRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const result = await feedbackStorage.submitFeedback(
        category.trim(),
        description.trim(),
        images
      );

      if (result.success) {
        showToast('success', t('feedback.submitSuccess'));
        // 重置表单
        setCategory('');
        setDescription('');
        setImages([]);
        onClose();
      } else {
        showToast('error', result.error || t('feedback.submitFailed'));
      }
    } catch {
      showToast('error', t('feedback.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  // 关闭模态框
  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 模态框内容 */}
      <div className="relative w-full max-w-lg mx-4 card shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--ink-border)]">
          <h2
            className="text-lg font-medium text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('feedback.title')}
          </h2>
          <button
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 表单区 */}
        <div className="p-5 space-y-5">
          {/* 问题类型 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('feedback.categoryLabel')}
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t('feedback.categoryPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--ink-lighter)] border border-[var(--ink-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm"
              maxLength={50}
            />
          </div>

          {/* 问题描述 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('feedback.descriptionLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('feedback.descriptionPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--ink-lighter)] border border-[var(--ink-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm resize-none"
              rows={5}
              maxLength={1000}
            />
            <div className="text-xs text-[var(--text-muted)] mt-1 text-right">
              {description.length}/1000
            </div>
          </div>

          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('feedback.imagesLabel')}
            </label>

            {/* 已上传的图片预览 */}
            {images.length > 0 && (
              <div className="flex gap-3 mb-3 flex-wrap">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`feedback-${index}`}
                      className="w-20 h-20 object-cover rounded-lg border border-[var(--ink-border)]"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--error)] text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 上传按钮 */}
            {images.length < 3 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[var(--ink-border)] text-sm text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('uploadingText')}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    {t('feedback.addImage')}
                  </>
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />

            <p className="text-xs text-[var(--text-muted)] mt-2">
              {t('feedback.imagesHint', { count: 3 - images.length })}
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-5 border-t border-[var(--ink-border)]">
          <button
            onClick={handleSubmit}
            disabled={submitting || !category.trim() || !description.trim()}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('feedback.submitting') : t('feedback.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
