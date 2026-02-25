'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import { Project, FormErrors } from '@/types';
import { projectStorage } from '@/lib/api';
import { ErrorHandler } from '@/lib/errorHandler';
import { useToast } from '@/components/Toast';
import RichTextEditor from '@/components/RichTextEditor';
import { scrollToFirstError } from '@/lib/scrollToError';
import { uploadFile } from '@/lib/upload';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function NewProjectPage() {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', targetDuration: '',
    telegramGroup: '', coverImage: '', videoFile: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push('/auth/login');
  }, [authLoading, isLoggedIn, router]);

  const categories = [
    { value: '', label: t('selectCategory') },
    { value: '电影', label: t('film') },
    { value: '动画', label: t('animation') },
    { value: '商业制作', label: t('commercial') },
    { value: '公益', label: t('publicWelfare') },
    { value: '其他', label: t('other') },
  ];

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = t('titleRequired');
    else if (formData.title.trim().length < 5) newErrors.title = t('titleMinLength');

    const textContent = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!textContent) newErrors.description = t('descriptionRequired');
    else if (textContent.length < 20) newErrors.description = t('descriptionMinLength');

    if (!formData.category) newErrors.category = t('categoryRequired');

    const duration = parseInt(formData.targetDuration);
    if (!formData.targetDuration) newErrors.targetDuration = t('durationRequired');
    else if (isNaN(duration) || duration <= 0) newErrors.targetDuration = t('invalidDuration');
    else if (duration > 300) newErrors.targetDuration = t('durationTooLong');

    if (!formData.coverImage) newErrors.coverImage = t('coverRequired');
    if (!agreedToTerms) newErrors.terms = t('termsRequired');
    return newErrors;
  };

  // 文件上传：调用 uploadFile 上传到 Supabase Storage，获取公开 URL
  const handleFileUpload = async (file: File, type: 'cover' | 'video') => {
    const fieldKey = type === 'cover' ? 'coverImage' : 'videoFile';
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setFormData(p => ({ ...p, [fieldKey]: url }));
      if (type === 'cover') {
        setCoverPreview(url);
      } else {
        setVideoPreview(url);
      }
      setErrors(p => ({ ...p, [fieldKey]: undefined }));
    } catch (err) {
      const message = err instanceof Error ? err.message : '上传失败，请重试';
      setErrors(p => ({ ...p, [fieldKey]: message }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      scrollToFirstError(Object.keys(validationErrors));
      return;
    }

    setLoading(true);
    try {
      const newProject = {
        id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: formData.title.trim(),
        description: formData.description,
        category: formData.category,
        targetDuration: parseInt(formData.targetDuration),
        currentDuration: 0,
        telegramGroup: formData.telegramGroup.trim() || undefined,
        coverImage: formData.coverImage,
        videoFile: formData.videoFile || undefined,
        creatorId: user!.id,
        creatorName: user!.name,
        createdAt: new Date().toISOString(),
        status: 'active',
        participantsCount: 0,
        logs: []
      } as Project;

      const result = await projectStorage.createProject(newProject);
      if (result.success && result.data) {
        showToast('success', t('projectCreated'));
        router.push(`/projects/${result.data.id}`);
      } else {
        throw new Error(result.error || 'Failed to create project');
      }
    } catch (err) {
      const errorMsg = ErrorHandler.handleError(err);
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  if (authLoading || !isLoggedIn) return null;

  return (
    <LayoutSimple>
      <div className="max-w-3xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl lg:text-5xl text-[var(--text-primary)] mb-4">{t('createNewProject')}</h1>
          <p className="text-lg text-[var(--text-muted)]">{t('createProjectDesc')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="card p-8 animate-fade-up delay-1">
            <h2 className="text-xl text-[var(--text-primary)] mb-6">{t('basicInfo')}</h2>

            {/* 标题 */}
            <div className="mb-6">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('projectTitle')} *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder={t('projectTitlePlaceholder')}
                className={`input ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className="text-red-400 text-sm mt-2">{errors.title}</p>}
            </div>

            {/* 分类 */}
            <div className="mb-6">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('category')} *</label>
              <select
                name="category"
                value={formData.category}
                onChange={e => handleInputChange('category', e.target.value)}
                className={`input ${errors.category ? 'border-red-500' : ''}`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-2">{errors.category}</p>}
            </div>

            {/* 目标时长 */}
            <div className="mb-6">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('targetDuration')} *</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="targetDuration"
                  value={formData.targetDuration}
                  onChange={e => handleInputChange('targetDuration', e.target.value)}
                  placeholder="90"
                  min="1"
                  className={`input flex-1 ${errors.targetDuration ? 'border-red-500' : ''}`}
                />
                <span className="text-[var(--text-muted)]">{t('seconds')}</span>
              </div>
              {errors.targetDuration && <p className="text-red-400 text-sm mt-2">{errors.targetDuration}</p>}
            </div>

            {/* 联系群号 */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('contactGroupLabel')}</label>
              <input
                type="text"
                name="telegramGroup"
                value={formData.telegramGroup}
                onChange={e => handleInputChange('telegramGroup', e.target.value)}
                placeholder={t('contactGroupPlaceholder')}
                className="input"
              />
              <p className="text-xs text-[var(--text-muted)] mt-2">{t('contactGroupHint')}</p>
            </div>
          </div>

          {/* 描述 */}
          <div className="card p-8 animate-fade-up delay-2" data-field="description">
            <h2 className="text-xl text-[var(--text-primary)] mb-6">{t('projectDescription')} *</h2>
            <RichTextEditor
              value={formData.description}
              onChange={val => handleInputChange('description', val)}
              placeholder={t('projectDescriptionPlaceholder')}
            />
            {errors.description && <p className="text-red-400 text-sm mt-2">{errors.description}</p>}
          </div>

          {/* 媒体 */}
          <div className="card p-8 animate-fade-up delay-3">
            <h2 className="text-xl text-[var(--text-primary)] mb-6">{t('mediaFiles')}</h2>

            {/* 封面 */}
            <div className="mb-8" data-field="coverImage">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('coverImage')} *</label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer hover:border-[var(--gold)] ${errors.coverImage ? 'border-red-500' : 'border-[var(--ink-border)]'}`}
                onClick={() => document.getElementById('cover-input')?.click()}
              >
                {coverPreview ? (
                  <div className="relative">
                    <img src={coverPreview} alt="Cover preview" className="max-h-64 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setCoverPreview(''); setFormData(p => ({ ...p, coverImage: '' })); }}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : uploading ? (
                  <div className="text-[var(--text-muted)] py-4 flex flex-col items-center gap-2">
                    <LoadingSpinner size="lg" />
                    <p>{t('uploadingPleaseWait')}</p>
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)]">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mb-2">{t('clickToUploadCover')}</p>
                    <p className="text-xs">{t('coverRequirements')}</p>
                  </div>
                )}
              </div>
              <input
                id="cover-input"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
                className="hidden"
              />
              {errors.coverImage && <p className="text-red-400 text-sm mt-2">{errors.coverImage}</p>}
            </div>

            {/* 视频 */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('videoFile')}</label>
              
              {videoPreview ? (
                <div className="relative rounded-lg overflow-hidden bg-black/5 border border-[var(--ink-border)]">
                  <video 
                    src={videoPreview} 
                    controls 
                    className="max-h-64 mx-auto w-full object-contain bg-black" 
                  />
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => document.getElementById('video-input')?.click()}
                      className="bg-white/90 text-black px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white transition-colors shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('replace', '更换')}
                    </button>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => { 
                        setVideoPreview(''); 
                        setFormData(p => ({ ...p, videoFile: '' })); 
                        // 重置 input value 允许重复选择同一文件
                        const input = document.getElementById('video-input') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      className="bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('delete', '删除')}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer hover:border-[var(--gold)] ${errors.videoFile ? 'border-red-500' : 'border-[var(--ink-border)]'}`}
                  onClick={() => document.getElementById('video-input')?.click()}
                >
                  {uploading ? (
                    <div className="text-[var(--text-muted)] py-4 flex flex-col items-center gap-2">
                      <LoadingSpinner size="lg" />
                      <p>{t('uploadingPleaseWait')}</p>
                    </div>
                  ) : (
                    <div className="text-[var(--text-muted)]">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="mb-2">{t('clickToUploadVideo')}</p>
                      <p className="text-xs">{t('videoRequirements')}</p>
                    </div>
                  )}
                </div>
              )}
              
              <input
                id="video-input"
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                className="hidden"
              />
              {errors.videoFile && <p className="text-red-400 text-sm mt-2">{errors.videoFile}</p>}
            </div>
          </div>

          {/* 条款 */}
          <div className="card p-8 animate-fade-up delay-4" data-field="terms">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => {
                  setAgreedToTerms(e.target.checked);
                  if (errors.terms) setErrors(p => ({ ...p, terms: undefined }));
                }}
                className="mt-1 w-5 h-5 rounded border-[var(--ink-border)] text-[var(--gold)] focus:ring-[var(--gold)] cursor-pointer"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                {t('projectTermsText')}
              </span>
            </label>
            {errors.terms && <p className="text-red-400 text-sm mt-2">{errors.terms}</p>}
          </div>

          {/* 提交 */}
          <div className="flex gap-4 animate-fade-up delay-5">
            <button type="button" onClick={() => router.back()} className="btn-secondary flex-1 h-14">
              {t('cancel')}
            </button>
            <button type="submit" disabled={loading || uploading} className="btn-primary flex-1 h-14 disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  {t('creating')}
                </>
              ) : uploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  {t('uploadingText')}
                </>
              ) : (
                t('createProject')
              )}
            </button>
          </div>
        </form>
      </div>
    </LayoutSimple>
  );
}
