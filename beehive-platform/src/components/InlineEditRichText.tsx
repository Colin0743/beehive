'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import RichTextEditor from './RichTextEditor';

interface InlineEditRichTextProps {
  value: string;
  onSave: (newValue: string) => Promise<boolean>;
  canEdit: boolean;
}

export default function InlineEditRichText({
  value,
  onSave,
  canEdit,
}: InlineEditRichTextProps) {
  const { t } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [saving, setSaving] = useState(false);

  // 当外部 value 变化时同步本地值（非编辑状态下）
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // 进入编辑模式
  const handleStartEdit = useCallback(() => {
    if (!canEdit) return;
    setLocalValue(value);
    setIsEditing(true);
  }, [canEdit, value]);

  // 取消编辑：恢复原始值并退出编辑模式
  const handleCancel = useCallback(() => {
    setLocalValue(value);
    setIsEditing(false);
  }, [value]);

  // 保存编辑
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const success = await onSave(localValue);
      if (success) {
        setIsEditing(false);
      }
      // 如果 onSave 返回 false，保留编辑状态不丢失用户输入
    } catch {
      // 保存失败时保留编辑状态
    } finally {
      setSaving(false);
    }
  }, [localValue, onSave]);

  // 展示模式：通过 dangerouslySetInnerHTML 渲染 HTML + hover 时显示编辑图标
  if (!isEditing) {
    return (
      <div className="group relative">
        <div
          className="prose prose-invert max-w-none text-[var(--text-secondary)]"
          dangerouslySetInnerHTML={{ __html: value || `<p class="text-[var(--text-muted)] italic">${t('noDescription')}</p>` }}
        />
        {canEdit && (
          <button
            onClick={handleStartEdit}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[var(--text-muted)] hover:text-[var(--gold)] p-1 rounded"
            aria-label={t('editDescription')}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // 编辑模式：显示 RichTextEditor + 保存/取消按钮
  return (
    <div className="space-y-3">
      <RichTextEditor
        value={localValue}
        onChange={setLocalValue}
        placeholder={t('inputDescPlaceholder')}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary h-10 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M4 12a8 8 0 0 1 8-8" opacity="0.75" />
              </svg>
              {t('savingText')}
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('save')}
            </>
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="btn-secondary h-10 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}
