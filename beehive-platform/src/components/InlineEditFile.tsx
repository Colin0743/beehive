'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface InlineEditFileProps {
  value: string;
  onSave: (newValue: string) => Promise<boolean>;
  canEdit: boolean;
  accept: string; // 如 "image/jpeg,image/png,image/gif"
  fileType: 'image' | 'video';
}

// 图片压缩：最大 1200px，JPEG quality 0.7
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const max = 1200;
        if (w > h && w > max) {
          h = (h * max) / w;
          w = max;
        } else if (h > max) {
          w = (w * max) / h;
          h = max;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 读取文件为 data URL
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function InlineEditFile({
  value,
  onSave,
  canEdit,
  accept,
  fileType,
}: InlineEditFileProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation('common');

  // 文件大小限制：图片 5MB，视频 20MB
  const maxSize = fileType === 'image' ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
  const maxSizeLabel = fileType === 'image' ? '5MB' : '20MB';

  // 点击触发文件选择
  const handleClick = useCallback(() => {
    if (!canEdit || saving) return;
    fileInputRef.current?.click();
  }, [canEdit, saving]);

  // 处理文件选择
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 重置 input 以便可以重复选择同一文件
      e.target.value = '';

      // 验证文件类型
      const allowedTypes = accept.split(',').map((t) => t.trim());
      if (!allowedTypes.includes(file.type)) {
        setError(
          fileType === 'image'
            ? t('unsupportedImageFormat')
            : t('unsupportedVideoFormat'),
        );
        return;
      }

      // 验证文件大小
      if (file.size > maxSize) {
        setError(t('fileSizeExceeded', { size: maxSizeLabel }));
        return;
      }

      setError(null);
      setSaving(true);

      try {
        let dataUrl: string;

        if (fileType === 'image') {
          // 图片：压缩后保存
          dataUrl = await compressImage(file);
        } else {
          // 视频：直接读取为 data URL
          dataUrl = await readFileAsDataURL(file);
        }

        // 先显示预览
        setPreview(dataUrl);

        // 调用 onSave 保存
        const success = await onSave(dataUrl);
        if (!success) {
          // 保存失败，恢复预览
          setPreview(null);
          setError(t('saveFailed'));
        }
      } catch {
        setPreview(null);
        setError(t('fileProcessFailed'));
      } finally {
        setSaving(false);
      }
    },
    [accept, fileType, maxSize, maxSizeLabel, onSave],
  );

  // 当前显示的值：优先使用预览（刚上传的），否则使用传入的 value
  const displayValue = preview || value;

  // 渲染媒体预览
  const renderPreview = () => {
    if (!displayValue) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
          {fileType === 'image' ? (
            <svg
              className="w-12 h-12 mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ) : (
            <svg
              className="w-12 h-12 mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
          <p className="text-sm">
            {fileType === 'image' ? t('noCoverImage') : t('noVideo')}
          </p>
          {canEdit && (
            <p className="text-xs mt-1">{t('clickToUploadInline')}</p>
          )}
        </div>
      );
    }

    if (fileType === 'image') {
      return (
        <img
          src={displayValue}
          alt={t('coverPreview')}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }

    return (
      <video
        src={displayValue}
        controls
        className="w-full h-full object-cover rounded-lg"
      />
    );
  };

  return (
    <div className="space-y-2">
      <div
        className={`group relative rounded-lg overflow-hidden border-2 border-dashed transition-colors ${
          canEdit
            ? 'cursor-pointer hover:border-[var(--gold)]'
            : 'cursor-default'
        } ${error ? 'border-[var(--error)]' : 'border-[var(--ink-border)]'}`}
        onClick={handleClick}
      >
        {/* 媒体预览 */}
        {renderPreview()}

        {/* 编辑覆盖层：hover 时显示更换图标 */}
        {canEdit && displayValue && !saving && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center text-white">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-sm mt-1">
                {fileType === 'image' ? t('changeImage') : t('changeVideo')}
              </span>
            </div>
          </div>
        )}

        {/* 保存中加载指示器 */}
        {saving && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center text-white">
              <svg
                className="animate-spin h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M4 12a8 8 0 0 1 8-8" opacity="0.75" />
              </svg>
              <span className="text-sm mt-2">{t('uploadingText')}</span>
            </div>
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 错误提示 */}
      {error && (
        <p className="text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
