'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Task } from '@/types';
import { validateDuration } from '@/lib/validators';
import { uploadFile } from '@/lib/upload';
import { balanceStorage } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';

// 任务表单属性接口
interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void | Promise<void>;
  initialData?: Task; // 编辑模式时传入
  mode: 'create' | 'edit';
  defaultCreatorEmail?: string;
}

// 表单数据接口
interface FormData {
  prompt: string;
  referenceImages: string[];
  requirements: string;
  creatorEmail: string;
  duration: number;
}

// 表单错误接口
interface FormErrors {
  prompt?: string;
  creatorEmail?: string;
  duration?: string;
}

// 邮箱格式校验
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  defaultCreatorEmail = '',
}: TaskFormProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 表单状态
  const [formData, setFormData] = useState<FormData>({
    prompt: '',
    referenceImages: [],
    requirements: '',
    creatorEmail: '',
    duration: 10,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [balanceYuan, setBalanceYuan] = useState<string>('0.00');
  const [publishFeeYuan, setPublishFeeYuan] = useState<string>('1.00');
  const [balanceCents, setBalanceCents] = useState<number>(0);
  const [feeCents, setFeeCents] = useState<number>(100);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 编辑模式时预填充数据
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        prompt: initialData.prompt || '',
        referenceImages: initialData.referenceImages || [],
        requirements: initialData.requirements || '',
        creatorEmail: initialData.creatorEmail || '',
        duration: initialData.duration ?? 10,
      });
      setErrors({});
    } else if (isOpen && mode === 'create') {
      // 创建模式：重置表单
      setFormData({
        prompt: '',
        referenceImages: [],
        requirements: '',
        creatorEmail: defaultCreatorEmail,
        duration: 10,
      });
      setErrors({});
    }
  }, [isOpen, mode, initialData, defaultCreatorEmail]);

  useEffect(() => {
    if (!isOpen || mode !== 'create') return;
    balanceStorage.getBalance().then((res) => {
      if (res.success && res.data) {
        setBalanceYuan(res.data.balance_yuan);
        setPublishFeeYuan(res.data.task_publish_fee_yuan);
        setBalanceCents(res.data.balance_cents);
        setFeeCents(res.data.task_publish_fee_cents);
      }
    });
  }, [isOpen, mode]);

  // 表单验证
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.prompt.trim()) {
      newErrors.prompt = t('promptRequired');
    }

    if (!formData.creatorEmail.trim()) {
      newErrors.creatorEmail = t('emailRequiredTask');
    } else if (!isValidEmail(formData.creatorEmail.trim())) {
      newErrors.creatorEmail = t('invalidEmailFormat');
    }

    const durationError = validateDuration(formData.duration);
    if (durationError) {
      newErrors.duration = durationError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理图片上传 - 上传到 Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remainingSlots = Math.max(0, 5 - formData.referenceImages.length);
    if (remainingSlots === 0) return;

    // 支持的格式：JPG、PNG（部分系统可能返回 image/jpg）
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (allowedTypes.includes(file.type)) validFiles.push(file);
    }
    if (validFiles.length === 0) {
      showToast('error', t('refImageFormatError', '请选择 JPG 或 PNG 格式的图片'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const newImages: string[] = [];
      const toAdd = Math.min(validFiles.length, remainingSlots);
      for (let i = 0; i < toAdd; i++) {
        const url = await uploadFile(validFiles[i]);
        newImages.push(url);
      }
      setFormData(prev => ({
        ...prev,
        referenceImages: [...prev.referenceImages, ...newImages],
      }));
    } catch (err) {
      showToast('error', t('fileProcessError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 删除参考图片
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index),
    }));
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validate()) return;

    // 创建模式：发布前校验余额
    if (mode === 'create') {
      if (balanceCents < feeCents) {
        setShowInsufficientModal(true);
        return;
      }
    }

    const taskData: Partial<Task> = {
      prompt: formData.prompt.trim(),
      referenceImages: formData.referenceImages,
      requirements: formData.requirements.trim(),
      creatorEmail: formData.creatorEmail.trim(),
      duration: formData.duration,
      // 创建模式直接发布
      ...(mode === 'create' && { status: 'published' }),
    };

    setSubmitting(true);
    try {
      await onSubmit(taskData);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div
        className="card max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-6 border-b border-[var(--ink-border)] flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl text-[var(--text-primary)]">
            {mode === 'create' ? t('createTask') : t('editTask')}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close"
          >
            {/* 关闭图标 SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 表单内容（可滚动） */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 提示词文本（必填） */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              {t('taskPrompt')} <span className="text-[var(--error)]">*</span>
            </label>
            <textarea
              value={formData.prompt}
              onChange={e => {
                setFormData(prev => ({ ...prev, prompt: e.target.value }));
                if (errors.prompt) setErrors(prev => ({ ...prev, prompt: undefined }));
              }}
              placeholder={t('taskPromptPlaceholder')}
              rows={3}
              className={`input resize-none py-3 h-auto min-h-[96px] text-base leading-relaxed ${errors.prompt ? 'input-error' : ''}`}
            />
            {errors.prompt && (
              <p className="text-sm text-[var(--error)] mt-1">{errors.prompt}</p>
            )}
          </div>

          {/* 参考图片上传 */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              {t('taskReferenceImages')}
            </label>

            {/* 图片预览区域 */}
            {formData.referenceImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {formData.referenceImages.map((img, index) => (
                  <div key={index} className="relative group rounded-[var(--radius-md)] overflow-hidden border border-[var(--ink-border)]">
                    <img
                      src={img}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 上传按钮 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || formData.referenceImages.length >= 5}
              className="w-full border border-dashed border-[var(--ink-border)] rounded-[var(--radius-md)] py-4 flex flex-col items-center gap-2 hover:border-[var(--gold)] transition-colors cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <span className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <LoadingSpinner size="sm" />
                  {t('loading')}
                </span>
              ) : (
                <>
                  {/* 上传图标 SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 8L12 3L7 8" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 3V15" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm text-[var(--text-muted)]">{t('clickToUploadRef')}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {t('refImageRequirements')} ({formData.referenceImages.length}/5)
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* 任务需求说明 */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              {t('taskRequirements')}
            </label>
            <textarea
              value={formData.requirements}
              onChange={e => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder={t('taskRequirementsPlaceholder')}
              rows={3}
              className="input resize-none py-3 h-auto"
            />
          </div>

          {/* 任务时长（秒） */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              {t('taskDurationLabel')} <span className="text-[var(--error)]">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.duration}
                onChange={e => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  setFormData(prev => ({ ...prev, duration: isNaN(val) ? 0 : val }));
                  if (errors.duration) setErrors(prev => ({ ...prev, duration: undefined }));
                }}
                min={5}
                max={30}
                step={1}
                className={`input w-32 ${errors.duration ? 'input-error' : ''}`}
              />
              <span className="text-sm text-[var(--text-muted)]">{t('taskDurationHint')}</span>
            </div>
            {errors.duration && (
              <p className="text-sm text-[var(--error)] mt-1">{errors.duration}</p>
            )}
          </div>

          {/* 创建者邮箱 */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              {t('creatorEmail')} <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="email"
              value={formData.creatorEmail}
              onChange={e => {
                setFormData(prev => ({ ...prev, creatorEmail: e.target.value }));
                if (errors.creatorEmail) setErrors(prev => ({ ...prev, creatorEmail: undefined }));
              }}
              placeholder={t('emailPlaceholderTask')}
              className={`input ${errors.creatorEmail ? 'input-error' : ''}`}
            />
            {errors.creatorEmail && (
              <p className="text-sm text-[var(--error)] mt-1">{errors.creatorEmail}</p>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 border-t border-[var(--ink-border)] flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary flex-1">
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex-1 disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                {t('loading')}
              </>
            ) : (
              mode === 'create' ? t('publishTaskWithFee', { fee: publishFeeYuan }) : t('save')
            )}
          </button>
        </div>
      </div>

      {/* 余额不足弹窗 */}
      {showInsufficientModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowInsufficientModal(false)}>
          <div className="card max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('insufficientBalanceTitle')}</h3>
              <button
                onClick={() => { setShowInsufficientModal(false); router.push('/recharge'); }}
                className="btn-primary w-full"
              >
                {t('goToRecharge')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
