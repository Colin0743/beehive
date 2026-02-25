'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: string;
  cover_image: string;
  creator_name: string;
  created_at: string;
  review_status: string;
}

interface TaskItem {
  id: string;
  prompt: string;
  reference_images: string[];
  requirements: string;
  created_at: string;
  review_status: string;
  projects: { id: string; title: string };
}

export default function ReviewPage() {
  const { t } = useTranslation('common');
  const { isLoggedIn, isAdminUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  // 权限检查
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !isAdminUser) {
      router.push('/');
    }
  }, [authLoading, isLoggedIn, isAdminUser, router]);

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      const res = await fetch(`/api/admin/review?type=${activeTab}&status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        if (activeTab === 'projects') {
          setProjects(data.data.items || []);
        } else {
          setTasks(data.data.items || []);
        }
      }
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => {
    if (isLoggedIn && isAdminUser) {
      loadData();
    }
  }, [isLoggedIn, isAdminUser, loadData]);

  // 审核操作
  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab === 'projects' ? 'project' : 'task',
          id,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', status === 'approved' ? '审核通过' : '已拒绝');
        loadData();
      } else {
        showToast('error', data.error || '操作失败');
      }
    } catch {
      showToast('error', '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 批量审核
  const handleBatchReview = async (status: 'approved' | 'rejected') => {
    if (selectedIds.size === 0) {
      showToast('error', '请先选择要审核的项目');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          ids: Array.from(selectedIds),
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `已${status === 'approved' ? '通过' : '拒绝'} ${data.data.count} 项`);
        loadData();
      } else {
        showToast('error', data.error || '操作失败');
      }
    } catch {
      showToast('error', '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 选择项
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    const items = activeTab === 'projects' ? projects : tasks;
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  };

  if (authLoading || !isLoggedIn || !isAdminUser) {
    return null;
  }

  const items = activeTab === 'projects' ? projects : tasks;

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-6">内容审核</h1>

        {/* 标签切换 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'projects'
                ? 'bg-[var(--gold)] text-[var(--ink)]'
                : 'bg-[var(--ink-lighter)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            项目
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-[var(--gold)] text-[var(--ink)]'
                : 'bg-[var(--ink-lighter)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            任务
          </button>
        </div>

        {/* 状态筛选 */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[var(--text-muted)]">状态:</span>
          {(['pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-[var(--gold-muted)] text-[var(--gold)]'
                  : 'bg-[var(--ink-lighter)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {status === 'pending' ? '待审核' : status === 'approved' ? '已通过' : '已拒绝'}
            </button>
          ))}
        </div>

        {/* 批量操作栏 */}
        {statusFilter === 'pending' && items.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-[var(--ink-lighter)] rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === items.length && items.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                全选 ({selectedIds.size}/{items.length})
              </span>
            </label>
            <div className="flex-1" />
            <button
              onClick={() => handleBatchReview('approved')}
              disabled={actionLoading || selectedIds.size === 0}
              className="px-4 py-1.5 rounded text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              批量通过
            </button>
            <button
              onClick={() => handleBatchReview('rejected')}
              disabled={actionLoading || selectedIds.size === 0}
              className="px-4 py-1.5 rounded text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              批量拒绝
            </button>
          </div>
        )}

        {/* 列表 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            暂无{statusFilter === 'pending' ? '待审核' : statusFilter === 'approved' ? '已通过' : '已拒绝'}的{activeTab === 'projects' ? '项目' : '任务'}
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'projects' ? (
              projects.map(project => (
                <div key={project.id} className="card p-4 flex gap-4">
                  {statusFilter === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(project.id)}
                      onChange={() => toggleSelect(project.id)}
                      className="w-5 h-5 rounded mt-1"
                    />
                  )}
                  {project.cover_image && (
                    <img
                      src={project.cover_image}
                      alt=""
                      className="w-24 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--text-primary)] truncate">{project.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                      {project.description.replace(/<[^>]*>/g, '').slice(0, 100)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                      <span>分类: {project.category}</span>
                      <span>创建者: {project.creator_name}</span>
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {statusFilter === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReview(project.id, 'approved')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => handleReview(project.id, 'rejected')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        拒绝
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              tasks.map(task => (
                <div key={task.id} className="card p-4 flex gap-4">
                  {statusFilter === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(task.id)}
                      onChange={() => toggleSelect(task.id)}
                      className="w-5 h-5 rounded mt-1"
                    />
                  )}
                  {task.reference_images?.[0] && (
                    <img
                      src={task.reference_images[0]}
                      alt=""
                      className="w-24 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--text-primary)] truncate">
                      {task.prompt.slice(0, 50)}...
                    </h3>
                    {task.requirements && (
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                        {task.requirements.slice(0, 100)}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                      <span>所属项目: {task.projects?.title || '-'}</span>
                      <span>{new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {statusFilter === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReview(task.id, 'approved')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => handleReview(task.id, 'rejected')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        拒绝
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
