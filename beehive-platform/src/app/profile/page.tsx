'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Project } from '@/types';
import { projectStorage, projectRelationStorage } from '@/lib/storage';
import { ErrorHandler } from '@/lib/errorHandler';

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'created' | 'participated'>('created');
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [participatedProjects, setParticipatedProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    loadUserProjects();
  }, [isLoggedIn, user]);

  const loadUserProjects = () => {
    if (!user) return;

    try {
      // 加载创建的项目
      const createdResult = projectStorage.getUserProjects(user.id);
      if (createdResult.success && createdResult.data) {
        setCreatedProjects(createdResult.data);
      }

      // 加载参与的项目
      const participatedIdsResult = projectRelationStorage.getParticipatedProjectIds(user.id);
      if (participatedIdsResult.success && participatedIdsResult.data) {
        const allProjectsResult = projectStorage.getAllProjects();
        if (allProjectsResult.success && allProjectsResult.data) {
          const participated = allProjectsResult.data.filter(p => 
            participatedIdsResult.data!.includes(p.id)
          );
          setParticipatedProjects(participated);
        }
      }
    } catch (error) {
      ErrorHandler.logError(error);
    }
  };

  // 分类颜色映射 - 来自 Figma 设计
  const categoryColors: { [key: string]: { bg: string; text: string } } = {
    '科幻': { bg: '#EDE9FE', text: '#5B21B6' },
    '动画': { bg: '#FEF3C7', text: '#92400E' },
    '纪录片': { bg: '#D1FAE5', text: '#065F46' },
    '教育': { bg: '#DBEAFE', text: '#1E40AF' },
    '其他': { bg: '#FCE7F3', text: '#831843' },
  };

  const renderProjectCard = (project: Project) => {
    const progress = Math.min((project.currentDuration / project.targetDuration) * 100, 100);
    const categoryStyle = categoryColors[project.category] || categoryColors['其他'];
    // 移除 HTML 标签获取纯文本描述
    const plainDescription = project.description.replace(/<[^>]*>/g, '');

    return (
      <div 
        key={project.id} 
        className="rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* 封面图片区域 */}
        <div 
          className="h-32 flex items-center justify-center relative"
          style={{ backgroundColor: categoryStyle.bg }}
        >
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl opacity-20" style={{ color: categoryStyle.text }}>📹</span>
          )}
          {/* 分类标签 */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}
          >
            {project.category}
          </div>
          {/* 完成标签 */}
          {progress === 100 && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-md text-xs font-medium bg-green-500 text-white">
              已完成
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-medium mb-2 truncate" style={{ color: '#111827' }}>
            {project.title}
          </h3>
          <p className="text-sm mb-4 line-clamp-2" style={{ color: '#4B5563', lineHeight: '1.5' }}>
            {plainDescription.substring(0, 80)}
            {plainDescription.length > 80 && '...'}
          </p>
          
          {/* 进度信息 */}
          <div className="mb-3">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-medium" style={{ color: '#111827' }}>{project.currentDuration}</span>
              <span className="text-xs" style={{ color: '#6B7280' }}>/ {project.targetDuration} 分钟</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: progress === 100 ? '#10B981' : '#10B981'
                }}
              />
            </div>
          </div>
          
          {/* 底部信息 */}
          <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
            <span className="text-xs" style={{ color: '#6B7280' }}>
              {project.participantsCount || 0} 支持者 • {progress.toFixed(0)}%
            </span>
            <Link
              href={`/projects/${project.id}`}
              className="text-xs font-medium transition-colors"
              style={{ color: '#4A90E2' }}
            >
              查看详情 →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = (message: string) => (
    <div className="text-center py-16">
      <div className="text-6xl mb-4 opacity-30">📁</div>
      <h3 className="text-xl font-medium mb-2" style={{ color: '#111827' }}>{message}</h3>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>开始创建你的第一个项目吧</p>
      <Link
        href="/projects/new"
        className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-sm transition-all"
        style={{ backgroundColor: '#FFD700', color: '#111827' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E6C200'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFD700'}
      >
        <span className="mr-2">+</span>
        创建项目
      </Link>
    </div>
  );

  if (!isLoggedIn || !user) {
    return null;
  }

  const tabs = [
    { id: 'created', label: `发起的项目 (${createdProjects.length})`, icon: '🚀' },
    { id: 'participated', label: `参与的项目 (${participatedProjects.length})`, icon: '👥' },
  ];

  const currentProjects = 
    activeTab === 'created' ? createdProjects : participatedProjects;

  return (
    <LayoutSimple>
      <div className="mb-8">
        {/* 用户信息 - Figma 设计风格 */}
        <div 
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
              style={{ 
                backgroundColor: '#FFF9E6',
                border: '3px solid #FFD700'
              }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-medium" style={{ color: '#111827' }}>{user.name}</h2>
              <p className="text-sm" style={{ color: '#6B7280' }}>{user.email}</p>
              <div className="flex gap-4 mt-2 text-xs" style={{ color: '#6B7280' }}>
                <span>{createdProjects.length} 个项目</span>
                <span>{participatedProjects.length} 次参与</span>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页 - Figma 设计风格 */}
        <div 
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex" style={{ borderBottom: '1px solid #E5E7EB' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex-1 px-6 py-4 font-medium text-sm transition-all relative"
                style={{
                  backgroundColor: activeTab === tab.id ? '#FFF9E6' : '#ffffff',
                  color: activeTab === tab.id ? '#111827' : '#6B7280',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: '#FFD700' }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {currentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProjects.map(renderProjectCard)}
              </div>
            ) : (
              renderEmptyState(
                activeTab === 'created' ? '你还没有发起任何项目' : '你还没有参与任何项目'
              )
            )}
          </div>
        </div>
      </div>
    </LayoutSimple>
  );
}
