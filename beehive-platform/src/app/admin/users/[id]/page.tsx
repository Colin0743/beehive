'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { userStorage, projectStorage } from '@/lib/storage';
import { User, Project } from '@/types';
import { useToast } from '@/components/Toast';
import { getUserRoleName } from '@/lib/admin';
import Link from 'next/link';

export default function UserDetailPage() {
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

  const loadUserData = () => {
    setLoading(true);
    const userResult = userStorage.findUserById(userId);
    if (userResult.success && userResult.data) {
      setUser(userResult.data);

      // 加载用户的项目
      const projectsResult = projectStorage.getAllProjects();
      if (projectsResult.success && projectsResult.data) {
        const userProjectsList = projectsResult.data.filter(p => p.creatorId === userId);
        setUserProjects(userProjectsList);
      }
    } else {
      showToast('error', '用户不存在');
      router.push('/admin/users');
    }
    setLoading(false);
  };

  const handleToggleActive = () => {
    if (!user) return;
    const result = userStorage.updateUser(userId, { isActive: !user.isActive });
    if (result.success && result.data) {
      setUser(result.data);
      showToast('success', '用户状态已更新');
    } else {
      showToast('error', result.error || '更新失败');
    }
  };

  const handleRoleChange = (newRole: User['role']) => {
    const result = userStorage.updateUser(userId, { role: newRole });
    if (result.success && result.data) {
      setUser(result.data);
      showToast('success', '用户角色已更新');
    } else {
      showToast('error', result.error || '更新失败');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">加载中...</div>
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
            className="text-yellow-600 hover:text-yellow-800 mb-4"
          >
            ← 返回用户列表
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* 用户基本信息 */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center">
              <img
                className="h-20 w-20 rounded-full"
                src={user.avatar}
                alt={user.name}
              />
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* 用户角色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户角色</label>
              <select
                value={user.role || 'user'}
                onChange={(e) => handleRoleChange(e.target.value as User['role'])}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
                <option value="super_admin">超级管理员</option>
              </select>
            </div>

            {/* 用户状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">账号状态</label>
              <button
                onClick={handleToggleActive}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  user.isActive !== false
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                {user.isActive !== false ? '✓ 活跃' : '✗ 已禁用'}
              </button>
            </div>

            {/* 注册时间 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">注册时间</label>
              <p className="text-gray-900">{new Date(user.createdAt).toLocaleString()}</p>
            </div>

            {/* 用户项目 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                创建的项目 ({userProjects.length})
              </label>
              {userProjects.length === 0 ? (
                <p className="text-gray-500">该用户还没有创建项目</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {userProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                            className="text-sm font-medium text-gray-900 hover:text-yellow-600"
                          >
                            {project.title}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {project.category} · {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'active' ? '活跃' :
                         project.status === 'completed' ? '已完成' : '已暂停'}
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

