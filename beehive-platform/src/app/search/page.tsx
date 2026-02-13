'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Project } from '@/types';
import { projectStorage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';

function Button({ children, variant = "primary", size = "medium", onClick, className = "" }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "text"; size?: "small" | "medium" | "large"; onClick?: () => void; className?: string;
}) {
  const baseStyles = "font-semibold rounded-lg transition-all active:scale-[0.98]";
  const variantStyles = {
    primary: "bg-[#FFD700] text-[#111827] hover:bg-[#E6C200] shadow-sm",
    secondary: "bg-transparent border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFF9E6]",
    text: "bg-transparent text-[#4A90E2] hover:underline",
  };
  const sizeStyles = { small: "h-9 px-4 text-sm", medium: "h-11 px-6 text-sm", large: "h-[52px] px-8 text-base" };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function ProjectCard({ project, daysLeft, t }: { project: Project; daysLeft: number; t: (key: string) => string }) {
  const categoryColors: { [key: string]: { bg: string; text: string } } = {
    电影: { bg: "#EDE9FE", text: "#5B21B6" },
    动画: { bg: "#FEF3C7", text: "#92400E" },
    商业制作: { bg: "#D1FAE5", text: "#065F46" },
    公益: { bg: "#DBEAFE", text: "#1E40AF" },
    其他: { bg: "#FCE7F3", text: "#831843" },
  };

  const categoryStyle = categoryColors[project.category] || categoryColors["其他"];
  const progress = Math.min((project.currentDuration / project.targetDuration) * 100, 100);
  const isCompleted = progress === 100;
  const plainDescription = project.description.replace(/<[^>]*>/g, '');

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group w-full bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
        <div className="relative h-48 flex items-center justify-center" style={{ backgroundColor: categoryStyle.bg }}>
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-6xl opacity-20">📹</div>
          )}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs" style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}>
            {project.category}
          </div>
          {isCompleted && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-md text-xs bg-[#10B981] text-white">{t('completedBadge')}</div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl text-[#111827] mb-2 truncate">{project.title}</h3>
          <p className="text-sm text-[#4B5563] mb-4 line-clamp-2 leading-relaxed">{plainDescription}</p>
          <div className="mb-1">
            <span className="text-3xl text-[#111827]">{project.currentDuration}</span>
            <span className="text-sm text-[#6B7280] ml-1">{t('seconds')}</span>
          </div>
          <div className="text-sm text-[#6B7280] mb-3">{t('target')} {project.targetDuration} {t('seconds')}</div>
          <div className="h-0.5 bg-neutral-200 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-[#10B981] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span>{project.participantsCount || 0} {t('supporters')}</span>
            <span>•</span>
            <span>{progress.toFixed(0)}% {t('completed')}</span>
            <span>•</span>
            <span>{daysLeft} {t('days')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SearchContent() {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 12;

  const categories = [
    { key: 'all', label: t('all'), value: '全部' },
    { key: 'film', label: t('film'), value: '电影' },
    { key: 'animation', label: t('animation'), value: '动画' },
    { key: 'commercial', label: t('commercial'), value: '商业制作' },
    { key: 'publicWelfare', label: t('publicWelfare'), value: '公益' },
    { key: 'other', label: t('other'), value: '其他' },
  ];
  const keyword = searchParams.get('keyword') || '';

  useEffect(() => {
    const loadProjects = async () => {
      const result = await projectStorage.getAllProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (keyword) {
      setSearchQuery(keyword);
    }
  }, [keyword]);

  useEffect(() => {
    let filtered = projects;

    if (keyword.trim()) {
      const query = keyword.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      const categoryObj = categories.find(c => c.key === selectedCategory);
      if (categoryObj) {
        filtered = filtered.filter(p => p.category === categoryObj.value);
      }
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [projects, keyword, selectedCategory]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getDaysLeft = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="h-16 flex items-center justify-between">
            <Link href="/"><Logo size="medium" /></Link>
            <div className="flex-1 max-w-[600px] mx-8">
              <form onSubmit={handleSearch} className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </form>
            </div>
            <div className="flex items-center gap-6">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
                    <img src={user?.avatar || '/default-avatar.svg'} alt={user?.name} className="w-8 h-8 rounded-full border-2 border-neutral-200" />
                    <span>{user?.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-neutral-600 hover:text-neutral-900">{t('logout')}</button>
                  <Link href="/projects/new"><Button variant="primary" size="medium">{t('startCreating')}</Button></Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-neutral-600 hover:text-neutral-900">{t('login')}</Link>
                  <Link href="/auth/register" className="text-sm text-neutral-600 hover:text-neutral-900">{t('register')}</Link>
                  <Link href="/projects/new"><Button variant="primary" size="medium">{t('startCreating')}</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl text-[#111827] mb-2">
            {t('searchResultsFor', { keyword })}
          </h1>
          <p className="text-sm text-[#6B7280]">
            {filteredProjects.length} {t('projects')}
          </p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === category.key
                  ? "bg-[#FFD700] text-[#111827]"
                  : "bg-white border border-neutral-300 text-neutral-600 hover:border-[#FFD700]"
                }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {filteredProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} daysLeft={getDaysLeft(project.createdAt)} t={t} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('previousPage')}
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                          ? 'bg-[#FFD700] text-[#111827]'
                          : 'border border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('nextPage')}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-30">🔍</div>
            <h3 className="text-xl text-[#111827] mb-2">{t('noSearchResults')}</h3>
            <p className="text-sm text-[#6B7280] mb-6">{t('noSearchResultsDesc')}</p>
            <Link href="/">
              <Button variant="primary" size="medium">{t('browseAllProjects')}</Button>
            </Link>
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-[1440px] mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500">{t('allRightsReserved')}</p>
            <div className="flex gap-6 text-sm text-neutral-500">
              <Link href="/privacy" className="hover:text-neutral-900">{t('privacyPolicy')}</Link>
              <Link href="/terms" className="hover:text-neutral-900">{t('termsOfService')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SearchPage() {
  const { t } = useTranslation('common');
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex justify-center items-center">
        <div className="text-neutral-500">{t('loading')}</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
