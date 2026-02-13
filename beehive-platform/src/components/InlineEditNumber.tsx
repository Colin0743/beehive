'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface InlineEditNumberProps {
  value: number;
  onSave: (newValue: number) => Promise<boolean>;
  canEdit: boolean;
  min?: number;
  max?: number;
  suffix?: string; // 如 "秒"
  validate?: (value: number) => string | null;
}

export default function InlineEditNumber({
  value,
  onSave,
  canEdit,
  min,
  max,
  suffix,
  validate,
}: InlineEditNumberProps) {
  const { t } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当外部 value 变化时同步本地值（非编辑状态下）
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(String(value));
    }
  }, [value, isEditing]);

  // 进入编辑模式时自动聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 进入编辑模式
  const handleStartEdit = useCallback(() => {
    if (!canEdit) return;
    setLocalValue(String(value));
    setError(null);
    setIsEditing(true);
  }, [canEdit, value]);

  // 取消编辑：恢复原始值并退出编辑模式
  const handleCancel = useCallback(() => {
    setLocalValue(String(value));
    setError(null);
    setIsEditing(false);
  }, [value]);

  // 保存编辑
  const handleSave = useCallback(async () => {
    // 将输入值解析为整数
    const parsed = parseInt(localValue, 10);

    // 处理 NaN 情况
    if (isNaN(parsed)) {
      setError(t('invalidNumber'));
      return;
    }

    // 检查 min/max 范围
    if (min !== undefined && parsed < min) {
      setError(t('valueTooSmall', { min }));
      return;
    }
    if (max !== undefined && parsed > max) {
      setError(t('valueTooLarge', { max }));
      return;
    }

    // 执行自定义验证
    if (validate) {
      const validationError = validate(parsed);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    setSaving(true);

    try {
      const success = await onSave(parsed);
      if (success) {
        setIsEditing(false);
      }
      // 如果 onSave 返回 false，保留编辑状态不丢失用户输入
    } catch {
      // 保存失败时保留编辑状态
    } finally {
      setSaving(false);
    }
  }, [localValue, min, max, validate, onSave]);

  // 键盘快捷键：Enter 保存，Escape 取消
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  // 展示模式
  if (!isEditing) {
    return (
      <div className="group inline-flex items-center gap-2">
        <span className="text-[var(--text-primary)]">
          {value}
          {suffix && (
            <span className="text-[var(--text-muted)] ml-1">{suffix}</span>
          )}
        </span>
        {canEdit && (
          <button
            onClick={handleStartEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[var(--text-muted)] hover:text-[var(--gold)] p-1 rounded"
            aria-label={t('edit')}
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

  // 编辑模式
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            // 输入时清除错误提示
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          disabled={saving}
          className={`input h-10 w-32 ${error ? 'input-error' : ''}`}
        />
        {suffix && (
          <span className="text-[var(--text-muted)] text-sm flex-shrink-0">
            {suffix}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary h-10 px-3 text-sm flex-shrink-0 disabled:opacity-50"
        >
          {saving ? (
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
          ) : (
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
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="btn-secondary h-10 px-3 text-sm flex-shrink-0 disabled:opacity-50"
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
        </button>
      </div>
      {error && (
        <p className="text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
