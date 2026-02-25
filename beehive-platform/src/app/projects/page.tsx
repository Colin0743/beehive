'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { Project } from '@/types';
import { projectStorage, clickTracker } from '@/lib/api';
import { sortingEngine, SortOption } from '@/lib/sortingEngine';
import { ProjectGridSkeleton } from '@/components/SkeletonCard';

// SVG 图标
const Icons = {
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  play: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
};

// 项目卡片组件
function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const { t } = useTranslation('common');
  const progress = Math.min((project.currentDuration / project.targetDuration) * 100, 100);
  const plainDescription = project.description.replace(/<[^>]*>/g, '');

  const getDaysLeft = () => {
    const created = new Date(project.createdAt);
    const now = new Date();
    const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - created.getTime());
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <article
        className="card group cursor-pointer overflow-hidden animate-fade-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--ink-lighter)]">
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">{Icons.play}</div>
          )}
          <div className="absolute top-4 left-4"><span className="tag">{project.category}</span></div>
          {progress >= 100 && <div className="absolute top-4 right-4"><span className="tag tag-gold">{t('completedBadge')}</span></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent opacity-60" />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-[var(--gold)] transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2 leading-relaxed">{plainDescription}</p>
          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-medium text-[var(--text-primary)]">
                {project.currentDuration}
                <span className="text-sm text-[var(--text-muted)] ml-1">/ {project.targetDuration} {t('seconds')}</span>
              </span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">{Icons.users}{project.participantsCount || 0}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <span className="flex items-center gap-1.5">{Icons.clock}{getDaysLeft()} {t('days')}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// 分页组件
function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation('common');
  if (totalPages <= 1) return null;

  // 计算显示的页码范围
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button
        onClick={() => { onPageChange(currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        disabled={currentPage === 1}
        className="btn-secondary h-10 px-4 text-sm disabled:opacity-40"
      >
        {t('previousPage')}
      </button>
      <div className="flex gap-1">
        {getPageNumbers().map((page, idx) => (
          typeof page === 'number' ? (
            <button
              key={idx}
              onClick={() => { onPageChange(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-10 h-10 rounded-md text-sm font-medium transition-all ${currentPage === page ? 'bg-[var(--gold)] text-[var(--ink)]' : 'text-[var(--text-secondary)] hover:bg-[var(--ink-lighter)]'
                }`}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)]">...</span>
          )
        ))}
      </div>
      <button
        onClick={() => { onPageChange(currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        disabled={currentPage === totalPages}
        className="btn-secondary h-10 px-4 text-sm disabled:opacity-40"
      >
        {t('nextPage')}
      </button>
    </div>
  );
}

// 主内容组件
function ProjectsContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation('common');
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>('hot');
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const projectsPerPage = 12;

  const categories = [
    { key: 'all', label: t('all'), value: '全部' },
    { key: 'film', label: t('film'), value: '电影' },
    { key: 'animation', label: t('animation'), value: '动画' },
    { key: 'commercial', label: t('commercial'), value: '商业制作' },
    { key: 'publicWelfare', label: t('publicWelfare'), value: '公益' },
    { key: 'other', label: t('other'), value: '其他' },
  ];

  // 排序选项配置（支持 i18n，带中文回退）
  const sortOptions = [
    { key: 'hot' as SortOption, label: t('sortHot') },
    { key: 'newest' as SortOption, label: t('sortNewest') },
    { key: 'fastest' as SortOption, label: t('sortFastest') },
    { key: 'mostParticipants' as SortOption, label: t('sortMostParticipants') },
  ];

  // 切换排序时重置到第1页
  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort);
    setCurrentPage(1);
  };

  // 并行加载项目数据和点击数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await projectStorage.getAllProjects();
        if (result.success && result.data) {
          setProjects(result.data);
          setLoading(false);

          // 延迟加载点击数据（不阻塞项目渲染）
          if (result.data.length > 0) {
            const projectIds = result.data.map(p => p.id);
            clickTracker.getBatchClickCounts(projectIds).then(setClickCounts);
          }
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 从 URL 读取分类和排序参数
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      const mapping: { [key: string]: string } = {
        'all': 'all', 'film': 'film', 'animation': 'animation',
        'commercial': 'commercial', 'publicWelfare': 'publicWelfare', 'other': 'other',
      };
      setSelectedCategory(mapping[categoryFromUrl] || 'all');
    }

    // 从 URL 读取排序参数
    const sortFromUrl = searchParams.get('sort');
    if (sortFromUrl && ['hot', 'newest', 'fastest', 'mostParticipants'].includes(sortFromUrl)) {
      setSortOption(sortFromUrl as SortOption);
    }
  }, [searchParams]);

  // 过滤并排序项目
  useEffect(() => {
    let filtered = projects;
    if (selectedCategory !== 'all') {
      const categoryValue = categories.find(cat => cat.key === selectedCategory)?.value || '';
      filtered = filtered.filter(p => p.category === categoryValue);
    }

    // 过滤后按当前排序选项排序
    filtered = sortingEngine.sortProjects(filtered, sortOption, clickCounts);

    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [projects, selectedCategory, sortOption, clickCounts]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const pageTitle = selectedCategory !== 'all'
    ? t('categoryProjects', { category: categories.find(c => c.key === selectedCategory)?.label })
    : t('allProjectsTitle');

  return (
    <LayoutSimple>
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl text-[var(--text-primary)]">{pageTitle}</h1>
          <span className="text-sm text-[var(--text-muted)]">
            {filteredProjects.length} {t('projects')}
          </span>
        </div>

        {/* 分类筛选 */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={cat.key === 'all' ? '/projects' : `/projects?category=${cat.key}`}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedCategory === cat.key
                  ? 'bg-[var(--gold)] text-[var(--ink)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] border border-[var(--ink-border)]'
                }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* 排序选项 */}
        <div className="flex items-center gap-2 mb-8">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSortChange(opt.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${sortOption === opt.key
                  ? 'bg-[var(--gold)] text-[var(--ink)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--ink-lighter)]'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 项目列表 */}
        {loading ? (
          <ProjectGridSkeleton count={12} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        ) : currentProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-[var(--text-muted)] mb-6">{Icons.play}</div>
            <h3 className="text-xl text-[var(--text-primary)] mb-3">{t('noCategoryProjects')}</h3>
            <p className="text-[var(--text-muted)] mb-8">{t('tryOtherCategories')}</p>
            <Link href="/projects">
              <button className="btn-secondary">{t('viewAllProjects')}</button>
            </Link>
          </div>
        )}
      </div>
    </LayoutSimple>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
