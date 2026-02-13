'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { projectStorage } from '@/lib/api';
import { Project } from '@/types';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function AdminProjectsPage() {
  const { t } = useTranslation('common');
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  const loadProjects = async () => {
    setLoading(true);
    const result = await projectStorage.getAllProjects();
    if (result.success && result.data) {
      const sortedProjects = result.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setProjects(sortedProjects);
      setFilteredProjects(sortedProjects);
    }
    setLoading(false);
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.creatorName.toLowerCase().includes(query)
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // 分类过滤
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleDelete = async (projectId: string) => {
    const result = await projectStorage.deleteProject(projectId);
    if (result.success) {
      showToast('success', t('admin.projectDeleted'));
      await loadProjects();
      setDeleteConfirm(null);
    } else {
      showToast('error', result.error || t('admin.deleteFailed'));
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: Project['status']) => {
    const result = await projectStorage.updateProject(projectId, { status: newStatus });
    if (result.success) {
      showToast('success', t('admin.projectStatusUpdated'));
      await loadProjects();
    } else {
      showToast('error', result.error || t('admin.updateFailed'));
    }
  };

  const categories = Array.from(new Set(projects.map(p => p.category)));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-[var(--text-secondary)]">{t('loading')}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
            {t('admin.projectManagement')}
          </h1>
          <div className="text-sm text-[var(--text-secondary)]">
            {t('admin.totalProjectsCount', { count: filteredProjects.length })}
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('admin.search')}</label>
              <input
                type="text"
                placeholder={t('admin.searchProjectsPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('admin.status')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--ink-lighter)] border border-[var(--ink-border)] text-[var(--text-primary)] rounded-md focus:outline-none focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-muted)]"
              >
                <option value="all" className="bg-[var(--ink-lighter)]">{t('admin.allStatuses')}</option>
                <option value="active" className="bg-[var(--ink-lighter)]">{t('admin.statusActive')}</option>
                <option value="completed" className="bg-[var(--ink-lighter)]">{t('admin.statusCompleted')}</option>
                <option value="paused" className="bg-[var(--ink-lighter)]">{t('admin.statusPaused')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('admin.category')}</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--ink-lighter)] border border-[var(--ink-border)] text-[var(--text-primary)] rounded-md focus:outline-none focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-muted)]"
              >
                <option value="all" className="bg-[var(--ink-lighter)]">{t('admin.allCategories')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[var(--ink-lighter)]">{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="card overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="px-4 py-12 text-center text-[var(--text-muted)]">
              {t('admin.noProjectsFound')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--ink-border)]">
                <thead className="bg-[var(--ink-lighter)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.projectInfo')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.creator')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.participantsCountLabel')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.createdTime')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ink-border)]">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-[var(--ink-lighter)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={project.coverImage || '/default-avatar.svg'}
                              alt={project.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              <Link href={`/projects/${project.id}`} className="hover:text-[var(--gold)] transition-colors">
                                {project.title}
                              </Link>
                            </div>
                            <div className="text-sm text-[var(--text-secondary)]">{project.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-primary)]">{project.creatorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project.id, e.target.value as Project['status'])}
                          className="text-sm px-2 py-1 bg-[var(--ink-lighter)] border border-[var(--ink-border)] text-[var(--text-primary)] rounded focus:outline-none focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-muted)]"
                        >
                          <option value="active" className="bg-[var(--ink-lighter)]">{t('admin.statusActive')}</option>
                          <option value="completed" className="bg-[var(--ink-lighter)]">{t('admin.statusCompleted')}</option>
                          <option value="paused" className="bg-[var(--ink-lighter)]">{t('admin.statusPaused')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        {project.participantsCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors"
                          >
                            {t('admin.view')}
                          </Link>
                          <Link
                            href={`/projects/edit/${project.id}`}
                            className="text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors"
                          >
                            {t('admin.edit')}
                          </Link>
                          {deleteConfirm === project.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="text-[var(--error)] hover:opacity-80 transition-colors"
                              >
                                {t('admin.confirmAction')}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                              >
                                {t('admin.cancelAction')}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(project.id)}
                              className="text-[var(--error)] hover:opacity-80 transition-colors"
                            >
                              {t('admin.delete')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
