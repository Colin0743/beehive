'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { userStorage, projectStorage } from '@/lib/api';
import { User, Project } from '@/types';
import { useToast } from '@/components/Toast';
import { getUserRoleName } from '@/lib/admin';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function AdminUsersPage() {
  const { t } = useTranslation('common');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [userProjects, setUserProjects] = useState<Record<string, Project[]>>({});
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    const result = await userStorage.getAllUsers();
    if (result.success && result.data) {
      const sortedUsers = result.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);

      // 加载每个用户的项目数
      const projectsResult = await projectStorage.getAllProjects();
      const projects = projectsResult.success ? (projectsResult.data || []) : [];
      const userProjectsMap: Record<string, Project[]> = {};
      sortedUsers.forEach(user => {
        userProjectsMap[user.id] = projects.filter(p => p.creatorId === user.id);
      });
      setUserProjects(userProjectsMap);
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    // 角色过滤
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(u => u.isActive !== false);
      } else {
        filtered = filtered.filter(u => u.isActive === false);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean | undefined) => {
    const result = await userStorage.updateUser(userId, { isActive: !currentStatus });
    if (result.success) {
      showToast('success', t('admin.userStatusUpdated'));
      await loadUsers();
    } else {
      showToast('error', result.error || t('admin.updateFailed'));
    }
  };

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    const result = await userStorage.updateUser(userId, { role: newRole });
    if (result.success) {
      showToast('success', t('admin.userRoleUpdated'));
      await loadUsers();
    } else {
      showToast('error', result.error || t('admin.updateFailed'));
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm(t('admin.confirmDeleteUser'))) {
      const result = await userStorage.deleteUser(userId);
      if (result.success) {
        showToast('success', t('admin.userDeleted'));
        await loadUsers();
      } else {
        showToast('error', result.error || t('admin.deleteFailed'));
      }
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

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
            {t('admin.userManagement')}
          </h1>
          <div className="text-sm text-[var(--text-secondary)]">
            {t('admin.totalUsersCount', { count: filteredUsers.length })}
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('admin.search')}</label>
              <input
                type="text"
                placeholder={t('admin.searchUsersPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('admin.role')}</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--ink-lighter)] border border-[var(--ink-border)] text-[var(--text-primary)] rounded-md focus:outline-none focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-muted)]"
              >
                <option value="all" className="bg-[var(--ink-lighter)]">{t('admin.allRoles')}</option>
                <option value="user" className="bg-[var(--ink-lighter)]">{t('admin.roleUser')}</option>
                <option value="admin" className="bg-[var(--ink-lighter)]">{t('admin.roleAdmin')}</option>
                <option value="super_admin" className="bg-[var(--ink-lighter)]">{t('admin.roleSuperAdmin')}</option>
              </select>
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
                <option value="inactive" className="bg-[var(--ink-lighter)]">{t('admin.statusDisabled')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="card overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="px-4 py-12 text-center text-[var(--text-muted)]">
              {t('admin.noUsersFound')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--ink-border)]">
                <thead className="bg-[var(--ink-lighter)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.userInfo')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.projectCount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.registrationTime')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ink-border)]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--ink-lighter)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar}
                              alt={user.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[var(--text-primary)]">{user.name}</div>
                            <div className="text-sm text-[var(--text-secondary)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                          className="text-sm px-2 py-1 bg-[var(--ink-lighter)] border border-[var(--ink-border)] text-[var(--text-primary)] rounded focus:outline-none focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_var(--gold-muted)]"
                        >
                          <option value="user" className="bg-[var(--ink-lighter)]">{t('admin.roleUser')}</option>
                          <option value="admin" className="bg-[var(--ink-lighter)]">{t('admin.roleAdmin')}</option>
                          <option value="super_admin" className="bg-[var(--ink-lighter)]">{t('admin.roleSuperAdmin')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive !== false
                              ? 'bg-[rgba(74,222,128,0.15)] text-[var(--success)]'
                              : 'bg-[rgba(248,113,113,0.15)] text-[var(--error)]'
                            }`}
                        >
                          {user.isActive !== false ? t('admin.statusActive') : t('admin.statusDisabled')}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        {userProjects[user.id]?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors"
                          >
                            {t('admin.details')}
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-[var(--error)] hover:opacity-80 transition-colors"
                          >
                            {t('admin.delete')}
                          </button>
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
