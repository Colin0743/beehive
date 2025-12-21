'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import { FormErrors } from '@/types';
import { projectStorage } from '@/lib/storage';
import { ErrorHandler } from '@/lib/errorHandler';
import { useToast } from '@/components/Toast';
import RichTextEditor from '@/components/RichTextEditor';

interface FormData {
  title: string;
  description: string;
  category: string;
  targetDuration: string;
  currentDuration: string;
  telegramGroup: string;
  coverImage: string;
  videoFile: string;
}

export default function EditProjectPage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    title: '', description: '', category: '', targetDuration: '', currentDuration: '', telegramGroup: '', coverImage: '', videoFile: ''
  });
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const projectId = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) { router.push('/auth/login'); return; }
    loadProject();
  }, [isLoggedIn, projectId]);

  const loadProject = () => {
    const result = projectStorage.getProjectById(projectId);
    if (!result.success || !result.data) { router.push('/'); return; }
    const project = result.data;
    if (user && project.creatorId !== user.id) { router.push(`/projects/${projectId}`); return; }
    setFormData({
      title: project.title, description: project.description, category: project.category,
      targetDuration: project.targetDuration.toString(), currentDuration: project.currentDuration.toString(),
      telegramGroup: project.telegramGroup || '', coverImage: project.coverImage || '', videoFile: project.videoFile || ''
    });
    setCoverPreview(project.coverImage || '');
    setVideoPreview(project.videoFile || '');
    setInitialLoading(false);
  };

  const categories = [
    { value: '科幻', label: t('sciFi') },
    { value: '动画', label: t('animation') },
    { value: '纪录片', label: t('documentary') },
    { value: '教育', label: t('education') },
    { value: '其他', label: t('other') },
  ];

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) { newErrors.title = t('titleRequired'); }
    else if (formData.title.trim().length < 5) { newErrors.title = t('titleMinLength'); }
    const textContent = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!textContent) { newErrors.description = t('descriptionRequired'); }
    else if (textContent.length < 20) { newErrors.description = t('descriptionMinLength'); }
    if (!formData.category) { newErrors.category = t('categoryRequired'); }
    const targetDuration = parseInt(formData.targetDuration);
    if (!formData.targetDuration) { newErrors.targetDuration = t('durationRequired'); }
    else if (isNaN(targetDuration) || targetDuration <= 0) { newErrors.targetDuration = t('invalidDuration'); }
    const currentDuration = parseInt(formData.currentDuration);
    if (formData.currentDuration && (isNaN(currentDuration) || currentDuration < 0)) { newErrors.currentDuration = t('currentDurationError'); }
    if (currentDuration > targetDuration) { newErrors.currentDuration = t('currentDurationExceedsTarget'); }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) { setErrors(formErrors); return; }
    setLoading(true); setErrors({});
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = projectStorage.updateProject(projectId, {
        title: formData.title.trim(), description: formData.description, category: formData.category,
        targetDuration: parseInt(formData.targetDuration), currentDuration: parseInt(formData.currentDuration),
        telegramGroup: formData.telegramGroup.trim(), coverImage: formData.coverImage, videoFile: formData.videoFile || undefined,
      });
      if (!result.success) { const errorMsg = result.error || t('updateFailed'); setErrors({ general: errorMsg }); showToast('error', errorMsg); return; }
      showToast('success', t('updateSuccess'));
      router.push(`/projects/${projectId}`);
    } catch (error: unknown) {
      const errorMsg = ErrorHandler.handleError(error); ErrorHandler.logError(error);
      setErrors({ general: errorMsg }); showToast('error', errorMsg);
    } finally { setLoading(false); }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width, height = img.height;
          const maxSize = 1200;
          if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
          else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject; img.src = e.target?.result as string;
      };
      reader.onerror = reject; reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File, type: 'cover' | 'video') => {
    const maxSize = type === 'cover' ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
    const allowedTypes = type === 'cover' ? ['image/jpeg', 'image/png', 'image/gif'] : ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = type === 'cover' ? t('imageUploadError') : t('videoUploadError');
      setErrors(prev => ({ ...prev, [type === 'cover' ? 'coverImage' : 'videoFile']: errorMsg })); showToast('error', errorMsg); return;
    }
    if (file.size > maxSize) {
      const errorMsg = type === 'cover' ? t('imageSizeError') : t('videoSizeError');
      setErrors(prev => ({ ...prev, [type === 'cover' ? 'coverImage' : 'videoFile']: errorMsg })); showToast('error', errorMsg); return;
    }
    try {
      if (type === 'cover') {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, coverImage: compressedBase64 })); setCoverPreview(compressedBase64);
        setErrors(prev => ({ ...prev, coverImage: undefined })); showToast('success', t('coverUploadSuccess'));
      } else {
        if (file.size > 10 * 1024 * 1024) { if (!window.confirm(t('storageFullVideoConfirm'))) return; }
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData(prev => ({ ...prev, videoFile: base64String })); setVideoPreview(base64String);
          setErrors(prev => ({ ...prev, videoFile: undefined })); showToast('success', t('videoUploadSuccess'));
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('File processing failed:', error);
      setErrors(prev => ({ ...prev, [type === 'cover' ? 'coverImage' : 'videoFile']: t('fileProcessError') }));
      showToast('error', t('fileProcessError'));
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors) { setErrors(prev => ({ ...prev, [field]: undefined })); }
  };

  if (initialLoading) { return <LayoutSimple><div className="text-center py-12">{t('loading')}</div></LayoutSimple>; }

  return (
    <LayoutSimple title={t('editProjectTitle')}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            {errors.general && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{errors.general}</div>)}

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">{t('projectTitle')} *</label>
              <input type="text" placeholder={t('projectTitlePlaceholder')} value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`} />
              {errors.title && (<p className="text-red-500 text-sm mt-1">{errors.title}</p>)}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3 text-lg">{t('projectDescriptionLabel')} *</label>
              <p className="text-sm text-gray-600 mb-3">{t('projectDescriptionHelp')}</p>
              <RichTextEditor value={formData.description} onChange={(value) => handleInputChange('description', value)} placeholder={t('projectDescriptionPlaceholder')} error={!!errors.description} />
              {errors.description && (<p className="text-red-500 text-sm mt-2">{errors.description}</p>)}
              <p className="text-xs text-gray-500 mt-2">{t('projectDescriptionTip')}</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">{t('projectCategory')} *</label>
              <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}>
                {categories.map(cat => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
              </select>
              {errors.category && (<p className="text-red-500 text-sm mt-1">{errors.category}</p>)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">{t('currentDurationLabel')} *</label>
                <input type="number" placeholder="0" value={formData.currentDuration} onChange={(e) => handleInputChange('currentDuration', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.currentDuration ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`} />
                {errors.currentDuration && (<p className="text-red-500 text-sm mt-1">{errors.currentDuration}</p>)}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">{t('targetDurationLabel')} *</label>
                <input type="number" placeholder={t('targetDurationPlaceholder')} value={formData.targetDuration} onChange={(e) => handleInputChange('targetDuration', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.targetDuration ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`} />
                {errors.targetDuration && (<p className="text-red-500 text-sm mt-1">{errors.targetDuration}</p>)}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">{t('coverImage')} *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {coverPreview ? (
                  <div className="relative">
                    <img src={coverPreview} alt="Cover preview" className="max-h-48 mx-auto rounded" />
                    <button type="button" onClick={() => { setFormData(prev => ({ ...prev, coverImage: '' })); setCoverPreview(''); }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">{t('removeFile')}</button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-2">
                      <label className="cursor-pointer text-sm" style={{ color: '#FFD700' }}>
                        <span className="hover:underline">{t('clickToUpload')}</span>
                        <input type="file" accept="image/jpeg,image/png,image/gif" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file, 'cover'); }} className="hidden" />
                      </label>
                      <span className="text-gray-500"> {t('orDragFile')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('imageFormats')}</p>
                  </div>
                )}
              </div>
              {errors.coverImage && (<p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>)}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">{t('projectVideo')}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {videoPreview ? (
                  <div className="relative">
                    <video src={videoPreview} controls className="max-h-48 mx-auto rounded" />
                    <button type="button" onClick={() => { setFormData(prev => ({ ...prev, videoFile: '' })); setVideoPreview(''); }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">{t('removeFile')}</button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v30.764a1 1 0 01-1.447.894L15 38M15 10v28M15 10l-4.553-2.276A1 1 0 009 8.618v30.764a1 1 0 001.447.894L15 38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-2">
                      <label className="cursor-pointer text-sm" style={{ color: '#FFD700' }}>
                        <span className="hover:underline">{t('clickToUpload')}</span>
                        <input type="file" accept="video/mp4,video/quicktime,video/x-msvideo" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file, 'video'); }} className="hidden" />
                      </label>
                      <span className="text-gray-500"> {t('orDragFile')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('videoFormats')}</p>
                    <p className="text-xs text-yellow-600 mt-1">{t('videoStorageWarning')}</p>
                  </div>
                )}
              </div>
              {errors.videoFile && (<p className="text-red-500 text-sm mt-1">{errors.videoFile}</p>)}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">{t('telegramGroupLabel')}</label>
              <input type="text" placeholder={t('telegramGroupPlaceholder')} value={formData.telegramGroup} onChange={(e) => handleInputChange('telegramGroup', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${loading ? 'cursor-not-allowed' : 'hover:opacity-90'}`}
                style={loading ? { background: '#E5E5E5', color: '#999999' } : { background: '#FFD700', color: '#333333' }}>
                {loading ? t('saving') : t('saveChanges')}
              </button>
              <button type="button" onClick={() => router.push(`/projects/${projectId}`)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </LayoutSimple>
  );
}
