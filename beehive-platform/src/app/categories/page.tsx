'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LayoutSimple from '@/components/LayoutSimple';
import Link from 'next/link';
import { Project } from '@/types';
import { projectStorage } from '@/lib/api';
import { ErrorHandler } from '@/lib/errorHandler';
import { useTranslation } from 'react-i18next';

function CategoriesContent() {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      const result = await projectStorage.getAllProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      } else if (!result.success) {
        ErrorHandler.logError(new Error(result.error || '加载项目失败'));
      }
    };
    loadProjects();
  }, []);

  // 从URL参数读取分类
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // 根据选中的分类筛选项目
  useEffect(() => {
    let filtered = projects;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    // 按创建时间倒序排列
    filtered = filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setFilteredProjects(filtered);
  }, [projects, selectedCategory]);

  const categories = [
    { key: 'all', text: t('all'), value: 'all', icon: '📁' },
    { key: '电影', text: t('film'), value: '电影', icon: '🎬' },
    { key: '动画', text: t('animation'), value: '动画', icon: '🎨' },
    { key: '商业制作', text: t('commercial'), value: '商业制作', icon: '💼' },
    { key: '公益', text: t('publicWelfare'), value: '公益', icon: '💚' },
    { key: '其他', text: t('other'), value: '其他', icon: '✨' },
  ];

  // 获取每个分类的精选项目（最多6个）
  const getFeaturedProjectsByCategory = (category: string) => {
    const categoryProjects = category === 'all'
      ? projects
      : projects.filter(p => p.category === category);

    return categoryProjects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  };

  // 计算剩余天数
  const getDaysLeft = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // 如果选择了特定分类，显示该分类的所有项目
  if (selectedCategory !== 'all') {
    const categoryInfo = categories.find(c => c.value === selectedCategory);

    return (
      <LayoutSimple>
        {/* 页面标题 */}
        <div className="mb-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {categoryInfo?.icon} {t('categoryProjectsTitle', { category: categoryInfo?.text })}
              </h1>
              <p className="text-gray-600">
                {t('foundProjectsCount', { count: filteredProjects.length })}
              </p>
            </div>
            <Link
              href="/categories"
              className="text-green-500 hover:text-green-600 text-sm font-medium"
              style={{ color: '#05CE78' }}
            >
              {t('backToCategories')}
            </Link>
          </div>

          {/* 分类标签 */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.key}
                href={`/categories?category=${category.value}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category.value
                    ? 'bg-yellow-400 text-gray-900 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.icon} {category.text}
              </Link>
            ))}
          </div>
        </div>

        {/* 项目列表 */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 px-4">
            {filteredProjects.map((project) => {
              const progress = Math.min((project.currentDuration / project.targetDuration) * 100, 100);
              const daysLeft = getDaysLeft(project.createdAt);

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block"
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* 项目封面 */}
                    <div
                      className="h-48 bg-gray-100 flex items-center justify-center relative"
                      style={{
                        backgroundImage: project.coverImage ? `url(${project.coverImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!project.coverImage && (
                        <span className="text-6xl">📹</span>
                      )}
                      {/* 状态标签 */}
                      {progress === 100 && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-green-500 text-white px-3 py-1 rounded text-xs font-medium" style={{ background: '#05CE78' }}>
                            {t('completedLabel')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      {/* 分类 */}
                      <div className="text-xs text-gray-500 mb-2">
                        📁 {project.category}
                      </div>

                      {/* 标题 */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                        {project.title}
                      </h3>

                      {/* 描述 */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      {/* 进度条 */}
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full transition-all"
                            style={{
                              width: `${progress}%`,
                              background: '#05CE78'
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {t('percentCompleted', { percent: progress.toFixed(0) })}
                        </div>
                      </div>

                      {/* 统计信息 */}
                      <div className="flex justify-between text-sm">
                        <div>
                          <div className="font-bold text-gray-900">{project.participantsCount || 0}</div>
                          <div className="text-xs text-gray-500">{t('supporters')}</div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{daysLeft}</div>
                          <div className="text-xs text-gray-500">{t('days')}</div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{progress.toFixed(0)}%</div>
                          <div className="text-xs text-gray-500">{t('progress')}</div>
                        </div>
                      </div>

                      {/* 底部信息 */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-1">👤</span>
                          <span>{project.creatorName}</span>
                        </div>
                        <div>
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg mx-4">
            <div className="text-8xl mb-4">{categoryInfo?.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('noCategoryProjectsTitle', { category: categoryInfo?.text })}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('noCategoryProjectsDesc', { category: categoryInfo?.text })}
            </p>
            <Link
              href="/projects/new"
              className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded font-medium transition-colors"
              style={{ background: '#05CE78' }}
            >
              {t('createFirstCategoryProject', { category: categoryInfo?.text })}
            </Link>
          </div>
        )}
      </LayoutSimple>
    );
  }

  // 显示所有分类的精选项目
  return (
    <LayoutSimple>
      {/* 页面标题 */}
      <div className="mb-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {t('categoryBrowseTitle')}
        </h1>
        <p className="text-gray-600">
          {t('categoryBrowseDesc')}
        </p>
      </div>

      {/* 分类标签 */}
      <div className="mb-8 px-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.key}
              href={`/categories?category=${category.value}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category.value
                  ? 'bg-yellow-400 text-gray-900 shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category.icon} {category.text}
            </Link>
          ))}
        </div>
      </div>

      {/* 各个分类的精选项目 */}
      <div className="space-y-12 px-4">
        {categories.filter(c => c.value !== 'all').map((category) => {
          const featuredProjects = getFeaturedProjectsByCategory(category.value);

          if (featuredProjects.length === 0) {
            return null;
          }

          return (
            <div key={category.key} className="mb-12">
              {/* 分类标题 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {t('categoryProjectsTitle', { category: category.text })}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {t('totalProjectsInCategory', { count: projects.filter(p => p.category === category.value).length })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/categories?category=${category.value}`}
                  className="text-green-500 hover:text-green-600 text-sm font-medium"
                  style={{ color: '#05CE78' }}
                >
                  {t('viewAll')}
                </Link>
              </div>

              {/* 项目网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => {
                  const progress = Math.min((project.currentDuration / project.targetDuration) * 100, 100);
                  const daysLeft = getDaysLeft(project.createdAt);

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {/* 项目封面 */}
                        <div
                          className="h-40 bg-gray-100 flex items-center justify-center relative"
                          style={{
                            backgroundImage: project.coverImage ? `url(${project.coverImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          {!project.coverImage && (
                            <span className="text-5xl">📹</span>
                          )}
                          {/* 状态标签 */}
                          {progress === 100 && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium" style={{ background: '#05CE78' }}>
                                {t('completedLabel')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          {/* 标题 */}
                          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
                            {project.title}
                          </h3>

                          {/* 描述 */}
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {project.description}
                          </p>

                          {/* 进度条 */}
                          <div className="mb-3">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-green-500 h-1 rounded-full transition-all"
                                style={{
                                  width: `${progress}%`,
                                  background: '#05CE78'
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {t('percentCompleted', { percent: progress.toFixed(0) })}
                            </div>
                          </div>

                          {/* 统计信息 */}
                          <div className="flex justify-between text-xs">
                            <div>
                              <div className="font-bold text-gray-900">{project.participantsCount || 0}</div>
                              <div className="text-gray-500">{t('supporters')}</div>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{daysLeft}</div>
                              <div className="text-gray-500">{t('days')}</div>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{progress.toFixed(0)}%</div>
                              <div className="text-gray-500">{t('progress')}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 如果没有项目 */}
      {projects.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-lg mx-4">
          <div className="text-8xl mb-4">📁</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {t('noProjects')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('firstProjectCTA')}
          </p>
          <Link
            href="/projects/new"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded font-medium transition-colors"
            style={{ background: '#05CE78' }}
          >
            {t('createFirstProject')}
          </Link>
        </div>
      )}
    </LayoutSimple>
  );
}

export default function CategoriesPage() {
  const { t } = useTranslation('common');
  return (
    <Suspense fallback={
      <LayoutSimple>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      </LayoutSimple>
    }>
      <CategoriesContent />
    </Suspense>
  );
}

