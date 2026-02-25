'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { projectStorage, userStorage } from '@/lib/api';
import { Project, User } from '@/types';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function AdminDashboard() {
  const { t } = useTranslation('common');
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pausedProjects: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalParticipants: 0,
    totalDuration: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);

    // 并行加载项目和用户数据
    const [projectsResult, usersResult] = await Promise.all([
      projectStorage.getAllProjects(),
      userStorage.getAllUsers(),
    ]);
    const projects = projectsResult.success ? (projectsResult.data || []) : [];
    const users = usersResult.success ? (usersResult.data || []) : [];

    // 计算统计数据
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const pausedProjects = projects.filter(p => p.status === 'paused').length;
    const activeUsers = users.filter(u => u.isActive !== false).length;
    const totalParticipants = projects.reduce((sum, p) => sum + (p.participantsCount || 0), 0);
    const totalDuration = projects.reduce((sum, p) => sum + (p.currentDuration || 0), 0);

    setStats({
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      pausedProjects,
      totalUsers: users.length,
      activeUsers,
      totalParticipants,
      totalDuration,
    });

    // 最近的项目（按创建时间排序）
    const sortedProjects = [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setRecentProjects(sortedProjects);

    // 最近的用户（按注册时间排序）
    const sortedUsers = [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setRecentUsers(sortedUsers);

    setLoading(false);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return t('admin.durationSeconds', { count: seconds });
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0
      ? t('admin.durationMinSec', { min: minutes, sec: secs })
      : t('admin.durationMinutes', { min: minutes });
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

  // 计算项目完成进度百分比
  const completionPercent = stats.totalProjects > 0
    ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
    : 0;

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1
          className="text-3xl font-bold text-[var(--text-primary)] mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('admin.dashboard')}
        </h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="card overflow-hidden animate-fade-up delay-1">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📁</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      {t('admin.totalProjects')}
                    </dt>
                    <dd className="text-2xl font-semibold text-[var(--text-primary)]">
                      {stats.totalProjects}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden animate-fade-up delay-2">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      {t('admin.activeProjects')}
                    </dt>
                    <dd className="text-2xl font-semibold text-[var(--success)]">
                      {stats.activeProjects}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden animate-fade-up delay-3">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      {t('admin.totalUsers')}
                    </dt>
                    <dd className="text-2xl font-semibold text-[var(--text-primary)]">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden animate-fade-up delay-4">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🐝</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[var(--text-secondary)] truncate">
                      {t('admin.totalParticipants')}
                    </dt>
                    <dd className="text-2xl font-semibold text-[var(--gold)]">
                      {stats.totalParticipants}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 项目状态统计 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="card overflow-hidden animate-fade-up delay-1">
            <div className="p-5">
              <div className="text-sm font-medium text-[var(--text-secondary)]">
                {t('admin.completedProjects')}
              </div>
              <div className="text-2xl font-semibold text-[var(--gold)]">
                {stats.completedProjects}
              </div>
              {/* 完成进度条 */}
              <div className="mt-3">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  {completionPercent}%
                </div>
              </div>
            </div>
          </div>
          <div className="card overflow-hidden animate-fade-up delay-2">
            <div className="p-5">
              <div className="text-sm font-medium text-[var(--text-secondary)]">
                {t('admin.pausedProjects')}
              </div>
              <div className="text-2xl font-semibold text-[var(--text-primary)]">
                {stats.pausedProjects}
              </div>
            </div>
          </div>
          <div className="card overflow-hidden animate-fade-up delay-3">
            <div className="p-5">
              <div className="text-sm font-medium text-[var(--text-secondary)]">
                {t('admin.totalDuration')}
              </div>
              <div className="text-2xl font-semibold text-[var(--text-primary)]">
                {formatDuration(stats.totalDuration)}
              </div>
            </div>
          </div>
        </div>

        {/* 最近项目和用户 */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* 最近项目 */}
          <div className="card overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-[var(--ink-border)]">
              <h3
                className="text-lg leading-6 font-medium text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('admin.recentProjects')}
              </h3>
            </div>
            <div>
              {recentProjects.length === 0 ? (
                <div className="px-4 py-5 text-[var(--text-muted)] text-center">
                  {t('admin.noProjectsYet')}
                </div>
              ) : (
                recentProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className={`px-4 py-4 hover:bg-[var(--ink-lighter)] transition-colors ${index < recentProjects.length - 1 ? 'border-b border-[var(--ink-border)]' : ''
                      }`}
                  >
                    <Link href={`/projects/${project.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {project.title}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {project.creatorName} · {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4">
                          {project.status === 'active' ? (
                            <span className="tag tag-gold">
                              {t('admin.statusActive')}
                            </span>
                          ) : project.status === 'completed' ? (
                            <span className="tag" style={{ background: 'rgba(74,222,128,0.15)', borderColor: 'transparent', color: 'var(--success)' }}>
                              {t('admin.statusCompleted')}
                            </span>
                          ) : (
                            <span className="tag">
                              {t('admin.statusPaused')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
            {recentProjects.length > 0 && (
              <div className="px-4 py-3 border-t border-[var(--ink-border)]">
                <Link href="/admin/projects" className="text-sm text-[var(--gold)] hover:text-[var(--gold-light)]">
                  {t('admin.viewAllProjects')} →
                </Link>
              </div>
            )}
          </div>

          {/* 最近用户 */}
          <div className="card overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-[var(--ink-border)]">
              <h3
                className="text-lg leading-6 font-medium text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('admin.recentUsers')}
              </h3>
            </div>
            <div>
              {recentUsers.length === 0 ? (
                <div className="px-4 py-5 text-[var(--text-muted)] text-center">
                  {t('admin.noUsersYet')}
                </div>
              ) : (
                recentUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`px-4 py-4 hover:bg-[var(--ink-lighter)] transition-colors ${index < recentUsers.length - 1 ? 'border-b border-[var(--ink-border)]' : ''
                      }`}
                  >
                    <Link href={`/admin/users/${user.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                          </div>
                        </div>
                        <div className="ml-4">
                          {user.isActive !== false ? (
                            <span className="tag" style={{ background: 'rgba(74,222,128,0.15)', borderColor: 'transparent', color: 'var(--success)' }}>
                              {t('admin.statusActive')}
                            </span>
                          ) : (
                            <span className="tag" style={{ background: 'rgba(248,113,113,0.15)', borderColor: 'transparent', color: 'var(--error)' }}>
                              {t('admin.statusDisabled')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
            {recentUsers.length > 0 && (
              <div className="px-4 py-3 border-t border-[var(--ink-border)]">
                <Link href="/admin/users" className="text-sm text-[var(--gold)] hover:text-[var(--gold-light)]">
                  {t('admin.viewAllUsers')} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
