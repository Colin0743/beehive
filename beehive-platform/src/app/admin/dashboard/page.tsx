'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { projectStorage, userStorage } from '@/lib/storage';
import { Project, User } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
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

  const loadStats = () => {
    setLoading(true);
    
    // 加载项目数据
    const projectsResult = projectStorage.getAllProjects();
    const projects = projectsResult.success ? (projectsResult.data || []) : [];
    
    // 加载用户数据
    const usersResult = userStorage.getAllUsers();
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
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

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">数据统计</h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📁</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">总项目数</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">活跃项目</dt>
                    <dd className="text-2xl font-semibold text-green-600">{stats.activeProjects}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">总用户数</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🐝</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">总参与人数</dt>
                    <dd className="text-2xl font-semibold text-yellow-600">{stats.totalParticipants}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 项目状态统计 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">已完成项目</div>
              <div className="text-2xl font-semibold text-blue-600">{stats.completedProjects}</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">已暂停项目</div>
              <div className="text-2xl font-semibold text-gray-600">{stats.pausedProjects}</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">总时长</div>
              <div className="text-2xl font-semibold text-purple-600">{formatDuration(stats.totalDuration)}</div>
            </div>
          </div>
        </div>

        {/* 最近项目和用户 */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* 最近项目 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">最近创建的项目</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentProjects.length === 0 ? (
                <div className="px-4 py-5 text-gray-500 text-center">暂无项目</div>
              ) : (
                recentProjects.map((project) => (
                  <div key={project.id} className="px-4 py-4 hover:bg-gray-50">
                    <Link href={`/projects/${project.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                          <p className="text-sm text-gray-500">
                            {project.creatorName} · {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status === 'active' ? '活跃' :
                             project.status === 'completed' ? '已完成' : '已暂停'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
            {recentProjects.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <Link href="/admin/projects" className="text-sm text-yellow-600 hover:text-yellow-800">
                  查看全部项目 →
                </Link>
              </div>
            )}
          </div>

          {/* 最近用户 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">最近注册的用户</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentUsers.length === 0 ? (
                <div className="px-4 py-5 text-gray-500 text-center">暂无用户</div>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="px-4 py-4 hover:bg-gray-50">
                    <Link href={`/admin/users/${user.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive !== false ? '活跃' : '已禁用'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
            {recentUsers.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <Link href="/admin/users" className="text-sm text-yellow-600 hover:text-yellow-800">
                  查看全部用户 →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

