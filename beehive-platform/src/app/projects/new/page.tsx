'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import { Project, FormErrors } from '@/types';
import { projectStorage, storageUtils } from '@/lib/storage';
import { ErrorHandler } from '@/lib/errorHandler';
import { useToast } from '@/components/Toast';
import RichTextEditor from '@/components/RichTextEditor';

interface FormData {
  title: string;
  description: string;
  category: string;
  targetDuration: string;
  telegramGroup: string;
  coverImage: string;
  videoFile: string;
}

export default function NewProjectPage() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    targetDuration: '',
    telegramGroup: '',
    coverImage: '',
    videoFile: ''
  });
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  const categories = [
    { value: '', label: '请选择分类' },
    { value: '科幻', label: '科幻' },
    { value: '动画', label: '动画' },
    { value: '纪录片', label: '纪录片' },
    { value: '教育', label: '教育' },
    { value: '其他', label: '其他' },
  ];

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入项目标题';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = '标题至少需要5个字符';
    }

    // 移除HTML标签后检查纯文本长度
    const textContent = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      newErrors.description = '请输入项目描述';
    } else if (textContent.length < 20) {
      newErrors.description = '描述至少需要20个字符（不包括格式）';
    }

    if (!formData.category) {
      newErrors.category = '请选择项目分类';
    }

    const duration = parseInt(formData.targetDuration);
    if (!formData.targetDuration) {
      newErrors.targetDuration = '请输入目标时长';
    } else if (isNaN(duration) || duration <= 0) {
      newErrors.targetDuration = '请输入有效的时长（分钟）';
    }

    if (!formData.coverImage) {
      newErrors.coverImage = '请上传项目封面图片';
    }

    return newErrors;
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 限制最大尺寸为 1200px
          const maxSize = 1200;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 压缩质量为 0.7
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File, type: 'cover' | 'video') => {
    const maxSize = type === 'cover' ? 5 * 1024 * 1024 : 20 * 1024 * 1024; // 5MB for images, 20MB for videos
    const allowedTypes = type === 'cover' 
      ? ['image/jpeg', 'image/png', 'image/gif']
      : ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

    if (!allowedTypes.includes(file.type)) {
      const errorMsg = type === 'cover' 
        ? '请上传JPG、PNG或GIF格式的图片'
        : '请上传MP4、MOV或AVI格式的视频';
      setErrors(prev => ({ ...prev, [type === 'cover' ? 'coverImage' : 'videoFile']: errorMsg }));
      return;
    }

    if (file.size > maxSize) {
      const errorMsg = type === 'cover' 
        ? '图片大小不能超过5MB'
        : '视频大小不能超过20MB（localStorage限制）';
      setErrors(prev => ({ ...prev, [type === 'cover' ? 'coverImage' : 'videoFile']: errorMsg }));
      return;
    }

    try {
      if (type === 'cover') {
        // 压缩图片
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, coverImage: compressedBase64 }));
        setCoverPreview(compressedBase64);
        setErrors(prev => ({ ...prev, coverImage: undefined }));
      } else {
        // 视频文件 - 警告用户
        if (file.size > 10 * 1024 * 1024) {
          const confirmed = window.confirm(
            '视频文件较大，可能会导致存储问题。建议使用较小的视频文件（<10MB）。是否继续？'
          );
          if (!confirmed) return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData(prev => ({ ...prev, videoFile: base64String }));
          setVideoPreview(base64String);
          setErrors(prev => ({ ...prev, videoFile: undefined }));
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('文件处理失败:', error);
      setErrors(prev => ({ 
        ...prev, 
        [type === 'cover' ? 'coverImage' : 'videoFile']: '文件处理失败，请重试' 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // 检查存储配额
      const quota = storageUtils.checkQuota();
      const estimatedSize = JSON.stringify(formData).length;
      
      if (!quota.available && quota.used + estimatedSize > quota.limit) {
        if (formData.videoFile) {
          const confirmed = window.confirm(
            '存储空间不足。是否创建项目但不保存视频文件？'
          );
          if (!confirmed) {
            throw ErrorHandler.handleStorageError('存储空间不足，请删除视频文件或清理浏览器存储');
          }
          formData.videoFile = '';
        } else {
          throw ErrorHandler.handleStorageError('存储空间不足，请清理浏览器存储后重试');
        }
      }

      const newProject: Project = {
        id: `project_${Date.now()}`,
        title: formData.title.trim(),
        description: formData.description, // 保留HTML格式
        category: formData.category,
        targetDuration: parseInt(formData.targetDuration),
        currentDuration: 0,
        telegramGroup: formData.telegramGroup.trim(),
        coverImage: formData.coverImage,
        videoFile: formData.videoFile || undefined,
        creatorId: user.id,
        creatorName: user.name,
        participantsCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        logs: []
      };

      const result = projectStorage.createProject(newProject);
      
      if (!result.success) {
        const errorMsg = result.error || '创建项目失败，请重试';
        setErrors({ general: errorMsg });
        showToast('error', errorMsg);
        return;
      }

      showToast('success', '项目创建成功');
      router.push(`/projects/${newProject.id}`);
    } catch (error: any) {
      const errorMsg = ErrorHandler.handleError(error);
      ErrorHandler.logError(error);
      setErrors({ general: errorMsg });
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <LayoutSimple title="创建新项目">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {errors.general}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">项目标题 *</label>
              <input
                type="text"
                placeholder="例如：科幻短片：未来城市"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3 text-lg">项目描述 *</label>
              <p className="text-sm text-gray-600 mb-3">
                使用富文本编辑器添加标题、章节、加粗文字和图片，让项目描述更加丰富生动
              </p>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="详细描述你的项目创意、目标和需求..."
                error={!!errors.description}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-2">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                提示：支持标题、加粗、列表、图片等功能。图片会自动压缩并嵌入到内容中。
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">项目分类 *</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">目标时长（分钟）*</label>
              <input
                type="number"
                placeholder="例如：5"
                value={formData.targetDuration}
                onChange={(e) => handleInputChange('targetDuration', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.targetDuration ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
              />
              {errors.targetDuration && (
                <p className="text-red-500 text-sm mt-1">{errors.targetDuration}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">项目封面图片 *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {coverPreview ? (
                  <div className="relative">
                    <img 
                      src={coverPreview} 
                      alt="封面预览" 
                      className="max-h-48 mx-auto rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, coverImage: '' }));
                        setCoverPreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-2">
                      <label className="cursor-pointer text-sm" style={{ color: '#FFD700' }}>
                        <span className="hover:underline">点击上传</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'cover');
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-gray-500"> 或拖拽文件到此处</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">支持JPG、PNG、GIF格式，最大5MB</p>
                  </div>
                )}
              </div>
              {errors.coverImage && (
                <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">项目视频（可选）</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {videoPreview ? (
                  <div className="relative">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="max-h-48 mx-auto rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, videoFile: '' }));
                        setVideoPreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v30.764a1 1 0 01-1.447.894L15 38M15 10v28M15 10l-4.553-2.276A1 1 0 009 8.618v30.764a1 1 0 001.447.894L15 38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-2">
                      <label className="cursor-pointer text-sm" style={{ color: '#FFD700' }}>
                        <span className="hover:underline">点击上传</span>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/x-msvideo"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'video');
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-gray-500"> 或拖拽文件到此处</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">支持MP4、MOV、AVI格式，建议小于10MB</p>
                    <p className="text-xs text-yellow-600 mt-1">⚠️ 由于localStorage限制，大文件可能无法保存</p>
                  </div>
                )}
              </div>
              {errors.videoFile && (
                <p className="text-red-500 text-sm mt-1">{errors.videoFile}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Telegram群组链接（可选）</label>
              <input
                type="text"
                placeholder="https://t.me/your_group"
                value={formData.telegramGroup}
                onChange={(e) => handleInputChange('telegramGroup', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'cursor-not-allowed'
                    : 'hover:opacity-90'
                }`}
                style={loading 
                  ? { background: '#E5E5E5', color: '#999999' }
                  : { background: '#FFD700', color: '#333333' }
                }
              >
                {loading ? '创建中...' : '创建项目'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </LayoutSimple>
  );
}
