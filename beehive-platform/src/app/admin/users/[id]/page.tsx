'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { userStorage, projectStorage } from '@/lib/api';
import { User, Project } from '@/types';
import { useToast } from '@/components/Toast';
import { getUserRoleName } from '@/lib/admin';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function UserDetailPage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    const userResult = await userStorage.findUserById(userId);
    if (userResult.success && userResult.data) {
      setUser(userResult.data);

      // 加载用户的项目
      const projectsResult = await projectStorage.getAllProjects();
      if (projectsResult.success && projectsResult.data) {
        const userProjectsList = projectsResult.data.filter(p => p.creatorId === userId);
        setUserProjects(userProjectsList);
      }
    } else {
      showToast('error', t('admin.userNotFound'));
      router.push('/admin/users');
    }
    setLoading(false);
  };

  const handleToggleActive = async () => {
    if (!user) return;
    const result = await userStorage.updateUser(userId, { isActive: !user.isActive });
    if (result.success && result.data) {
      setUser(result.data);
      showToast('success', t('admin.userStatusUpdated'));
    } else {
      showToast('error', result.error || t('admin.updateFailed'));
    }
  };

  const handleRoleChange = async (newRole: User['role']) => {
    const result = await userStorage.updateUser(userId, { role: newRole });
    if (result.success && result.data) {
      setUser(result.data);
      showToast('success', t('admin.userRoleUpdated'));
    } else {
      showToast('error', result.error || t('admin.updateFailed'));
    }
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

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors mb-4"
          >
            {t('admin.backToUserList')}
          </button>
        </div>

        <div className="card overflow-hidden">
          {/* 用户基本信息 */}
          <div className="px-6 py-5 border-b border-[var(--ink-border)]">
            <div className="flex items-center">
              <img
                className="h-20 w-20 rounded-full border-2 border-[var(--gold-muted)]"
                src={user.avatar}
                alt={user.name}
              />
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>{user.name}</h1>
                <p className="text-[var(--text-secondary)]">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* 用户角色 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('admin.userRole')}</label>
              <select
                value={user.role || 'user'}
                onChange={(e) => handleRoleChange(e.target.value as User['role'])}
                className="w-full md:w-64 px-3 py-2 bg-[var(--ink-lighter)] border border-[var(--ink-border)] text-[var(--text-primary)] rounded-md focus:outline-none focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-muted)]"
              >
                <option value="user" className="bg-[var(--ink-lighter)]">{t('admin.roleUser')}</option>
                <option value="admin" className="bg-[var(--ink-lighter)]">{t('admin.roleAdmin')}</option>
                <option value="super_admin" className="bg-[var(--ink-lighter)]">{t('admin.roleSuperAdmin')}</option>
              </select>
            </div>

            {/* 用户状态 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('admin.accountStatus')}</label>
              <button
                onClick={handleToggleActive}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-opacity ${user.isActive !== false
                    ? 'bg-[rgba(74,222,128,0.15)] text-[var(--success)] hover:opacity-80'
                    : 'bg-[rgba(248,113,113,0.15)] text-[var(--error)] hover:opacity-80'
                  }`}
              >
                {user.isActive !== false ? t('admin.activeStatus') : t('admin.disabledStatus')}
              </button>
            </div>

            {/* 注册时间 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('admin.registrationTime')}</label>
              <p className="text-[var(--text-primary)]">{new Date(user.createdAt).toLocaleString()}</p>
            </div>

            {/* 用户项目 */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('admin.createdProjectsCount', { count: userProjects.length })}
              </label>
              {userProjects.length === 0 ? (
                <p className="text-[var(--text-muted)]">{t('admin.noUserProjects')}</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {userProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 bg-[var(--ink-lighter)] rounded-[var(--radius-lg)]"
                    >
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={project.coverImage || '/default-avatar.svg'}
                          alt={project.title}
                        />
                        <div className="ml-3">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors"
                          >
                            {project.title}
                          </Link>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {project.category} · {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-[rgba(74,222,128,0.15)] text-[var(--success)]' :
                          project.status === 'completed' ? 'tag tag-gold' :
                            'tag'
                        }`}>
                        {project.status === 'active' ? t('admin.statusActive') :
                          project.status === 'completed' ? t('admin.statusCompleted') : t('admin.statusPaused')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
