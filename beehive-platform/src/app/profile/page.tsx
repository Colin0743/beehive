'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile } from '@/lib/upload';
import { balanceStorage } from '@/lib/api';

export default function ProfilePage() {
  const { t } = useTranslation('common');
  const { user, isLoggedIn, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [balanceYuan, setBalanceYuan] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn && user) {
      balanceStorage.getBalance().then((r) => {
        if (r.success && r.data) setBalanceYuan(r.data.balance_yuan);
      });
    }
  }, [isLoggedIn, user]);

  // 未登录重定向
  if (!isLoggedIn || !user) {
    if (typeof window !== 'undefined') router.push('/auth/login');
    return null;
  }

  // 处理头像文件选择 - 上传到 Supabase Storage
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const url = await uploadFile(file);
      setAvatarPreview(url);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '头像上传失败，请重试' });
    } finally {
      setUploading(false);
    }
  };

  // 保存修改
  const handleSave = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: '昵称不能为空' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const updateData: Record<string, string> = {};
      if (name !== user.name) updateData.name = name.trim();
      if (avatarPreview !== user.avatar) updateData.avatar = avatarPreview;

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'success', text: '没有需要保存的修改' });
        setSaving(false);
        return;
      }

      await updateUser(updateData);
      setMessage({ type: 'success', text: '个人信息已更新' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '保存失败，请稍后重试' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutSimple>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl text-[var(--text-primary)] mb-8 animate-fade-up">个人设置</h1>

        {/* 余额卡片 */}
        <div className="card p-6 mb-8 animate-fade-up flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">{t('balance')}</p>
            <p className="text-2xl font-semibold text-[var(--gold)]">¥{balanceYuan ?? '0.00'}</p>
          </div>
          <Link href="/recharge" className="btn-primary">
            {t('recharge')}
          </Link>
        </div>

        <div className="card p-8 animate-fade-up delay-1">
          {/* 头像编辑 */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--ink-border)] cursor-pointer hover:border-[var(--gold)] transition-colors relative group"
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <img
                src={avatarPreview || '/default-avatar.svg'}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <span className="text-white text-xs">上传中...</span>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs">上传中...</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              onClick={() => !uploading && fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-3 text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors disabled:opacity-50"
            >
              {uploading ? t('uploadingText') : t('clickToChangeAvatar')}
            </button>
          </div>

          {/* 昵称编辑 */}
          <div className="mb-6">
            <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('nickname')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder={t('enterNickname')}
              maxLength={30}
            />
          </div>

          {/* 邮箱（只读） */}
          <div className="mb-8">
            <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('email')}</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="input w-full opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">{t('emailNotEditable')}</p>
          </div>

          {/* 提示消息 */}
          {message && (
            <div className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {message.text}
            </div>
          )}

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="btn-primary w-full"
          >
            {saving ? '保存中...' : uploading ? '头像上传中...' : '保存修改'}
          </button>
        </div>
      </div>
    </LayoutSimple>
  );
}