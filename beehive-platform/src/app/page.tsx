'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Project, Task } from '@/types';
import { projectStorage, taskStorage, clickTracker } from '@/lib/api';
import { sortingEngine } from '@/lib/sortingEngine';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/NotificationBell';
import UserDropdown from '@/components/UserDropdown';
import Logo from '@/components/Logo';

const Icons = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
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

const CATEGORIES = [
  { key: 'film', value: '电影' },
  { key: 'animation', value: '动画' },
  { key: 'commercial', value: '商业制作' },
  { key: 'publicWelfare', value: '公益' },
  { key: 'other', value: '其他' },
];

function getDaysLeft(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - created.getTime());
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

function ProjectCard({ project, index = 0, compact = false }: { project: Project; index?: number; compact?: boolean }) {
  const { t } = useTranslation('common');
  const progress = Math.min((project.currentDuration / project.targetDuration) * 100, 100);
  const plainDescription = project.description.replace(/<[^>]*>/g, '');
  const daysLeft = getDaysLeft(project.createdAt);

  if (compact) {
    return (
      <Link href={`/projects/${project.id}`}>
        <article className="card group cursor-pointer overflow-hidden animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--ink-lighter)]">
            {project.coverImage ? (
              <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">{Icons.play}</div>
            )}
            <div className="absolute top-2 left-2"><span className="tag text-[10px] px-2 py-0.5">{project.category}</span></div>
            {progress >= 100 && <div className="absolute top-2 right-2"><span className="tag tag-gold text-[10px] px-2 py-0.5">{t('completedBadge')}</span></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent opacity-50" />
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1.5 line-clamp-1 group-hover:text-[var(--gold)] transition-colors">{project.title}</h3>
            <div className="mb-2">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-base font-medium text-[var(--text-primary)]">
                  {project.currentDuration}
                  <span className="text-xs text-[var(--text-muted)] ml-0.5">/ {project.targetDuration} {t('seconds')}</span>
                </span>
              </div>
              <div className="progress-track h-1.5"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1">{Icons.users}{project.participantsCount || 0} {progress.toFixed(0)}%</span>
              <span className="flex items-center gap-1">{Icons.clock}{daysLeft} {t('days')}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/projects/${project.id}`}>
      <article className="card group cursor-pointer overflow-hidden animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--ink-lighter)]">
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">{Icons.play}</div>
          )}
          <div className="absolute top-4 left-4"><span className="tag">{project.category}</span></div>
          {progress >= 100 && <div className="absolute top-4 right-4"><span className="tag tag-gold">{t('completedBadge')}</span></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent opacity-60" />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-[var(--gold)] transition-colors">{project.title}</h3>
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
            <span className="flex items-center gap-1.5">{Icons.clock}{daysLeft} {t('days')}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function TaskPreviewCard({ task }: { task: Task & { projectId: string; projectName: string; projectCategory: string } }) {
  const thumbnail = task.referenceImages?.[0];
  return (
    <Link href="/tasks">
      <div className="flex gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--ink-light)] border border-[var(--ink-border)] hover:border-[var(--gold)]/30 transition-colors group cursor-pointer">
        <div className="w-14 h-14 flex-shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--ink-lighter)]">
          {thumbnail ? (
            <img src={thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="opacity-40">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="tag text-xs">{task.projectCategory}</span>
            <span className="text-xs text-[var(--text-muted)] truncate">{task.projectName}</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--gold)] transition-colors leading-snug">
            {task.prompt.length > 40 ? task.prompt.slice(0, 40) + '...' : task.prompt}
          </p>
        </div>
      </div>
    </Link>
  );
}

function HomeContent() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const { t } = useTranslation('common');
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [recentTasks, setRecentTasks] = useState<(Task & { projectId: string; projectName: string; projectCategory: string })[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await projectStorage.getAllProjects();
        if (result.success && result.data) {
          setProjects(result.data);
          if (result.data.length > 0) {
            const projectIds = result.data.map(p => p.id);
            const counts = await clickTracker.getBatchClickCounts(projectIds);
            setClickCounts(counts);
          }
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
      try {
        const tasksResult = await taskStorage.getAllPublishedTasks();
        if (tasksResult.success && tasksResult.data) {
          const sorted = tasksResult.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentTasks(sorted.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };
    loadData();
  }, []);

  const featuredProjects = sortingEngine.getFeaturedProjects(projects, clickCounts, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ink)]">
      <div className="film-grain" />
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-[var(--ink)]/95 backdrop-blur-md border-b border-[var(--ink-border)]">
        <div className="container">
          <div className="h-16 flex items-center justify-between">
            <Link href="/"><Logo size="medium" /></Link>
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">{Icons.search}</span>
                <input type="text" placeholder={t('searchPlaceholder')} value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10" />
              </div>
            </form>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {isLoggedIn && user && <NotificationBell userId={user.id} />}
              {isLoggedIn ? (
                <>
                  <UserDropdown
                    user={{ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' }}
                    onLogout={() => { logout(); router.push('/'); }}
                  />
                  <Link href="/projects/new"><button className="btn-primary">{t('startCreating')}</button></Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="nav-link">{t('login')}</Link>
                  <Link href="/auth/register"><button className="btn-primary">{t('register')}</button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* 分类导航栏 */}
      <div className="sticky top-16 z-40 bg-[var(--ink)]/95 backdrop-blur-md border-b border-[var(--ink-border)]">
        <div className="container">
          <div className="flex gap-1 py-3 overflow-x-auto">
            <Link href="/projects" className="px-4 py-2 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] transition-all">
              {t('all')}
            </Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat.key} href={`/projects?category=${cat.key}`}
                className="px-4 py-2 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--ink-lighter)] transition-all">
                {t(cat.key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="glow -top-40 -left-40" />
        <div className="glow -bottom-40 -right-40" style={{ opacity: 0.3 }} />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] mb-6 animate-fade-up">{t('heroTitle')}</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-10 animate-fade-up delay-1">{t('heroSubtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-2">
              <Link href="/projects/new"><button className="btn-primary h-14 px-8 text-base">{t('startCreating')}</button></Link>
              <Link href="/tasks"><button className="btn-secondary h-14 px-8 text-base">{t('taskHall')}</button></Link>
            </div>
          </div>
        </div>
      </section>
      {/* 我的作品 */}
      {isLoggedIn && user && (() => {
        const myProjects = projects.filter(p => p.creatorId === user.id);
        if (myProjects.length === 0) return null;
        return (
          <section className="py-12 border-b border-[var(--ink-border)]">
            <div className="container">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-[var(--text-primary)]">{t('myWorks')}</h2>
                <Link href="/profile" className="text-xl text-[var(--gold)] hover:underline">{t('viewAllWorks')}</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {myProjects.slice(0, 6).map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} compact />
                ))}
              </div>
            </div>
          </section>
        );
      })()}
      {/* 项目内容区域 */}
      <div className="container">
        <div className="flex gap-8 py-12">
          {/* 左侧：精选项目 + 各分类板块 */}
          <div className="flex-1 min-w-0">
            {/* 精选项目 */}
            <section className="py-12 border-b border-[var(--ink-border)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-[var(--text-primary)]">{t('featuredProjects')}</h2>
                <Link href="/projects" className="text-xl text-[var(--gold)] hover:underline">{t('viewAllProjects')}</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {featuredProjects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>
              {featuredProjects.length === 0 && (
                <div className="text-center py-16 text-[var(--text-muted)]"><p>{t('noProjects')}</p></div>
              )}
            </section>

            {/* 各分类板块 */}
            {CATEGORIES.map((cat) => {
              const catFiltered = projects.filter(p => p.category === cat.value);
              const catProjects = sortingEngine.getCategoryMixedProjects(catFiltered, clickCounts, 6);
              if (catProjects.length === 0) return null;
              return (
                <section key={cat.key} className="py-12 border-b border-[var(--ink-border)]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl text-[var(--text-primary)]">{t(cat.key)}</h2>
                    <Link href={`/projects?category=${cat.key}`} className="text-xl md:text-2xl text-[var(--gold)] hover:underline">{t('viewAllProjects')}</Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catProjects.map((project, i) => (
                      <ProjectCard key={project.id} project={project} index={i} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* 最新任务 - sticky 侧边栏 */}
          {recentTasks.length > 0 && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-36">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-[var(--text-primary)]">{t('recentTasks')}</h2>
                  <Link href="/tasks" className="text-xl text-[var(--gold)] hover:underline">{t('viewAllTasks')}</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {recentTasks.map((task) => (
                    <TaskPreviewCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 页脚 */}
      <footer className="border-t border-[var(--ink-border)] py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <Logo size="medium" className="mb-4" />
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{t('footerDescription')}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t('quickLinks')}</h4>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                <li><Link href="/about" className="hover:text-[var(--gold)] transition-colors">{t('aboutUs')}</Link></li>
                <li><Link href="/how-it-works" className="hover:text-[var(--gold)] transition-colors">{t('howItWorks')}</Link></li>
                <li><Link href="/guide" className="hover:text-[var(--gold)] transition-colors">{t('creationGuide')}</Link></li>
                <li><Link href="/help" className="hover:text-[var(--gold)] transition-colors">{t('helpCenter')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t('projectCategories')}</h4>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                {CATEGORIES.map(cat => (
                  <li key={cat.key}>
                    <Link href={`/projects?category=${cat.key}`} className="hover:text-[var(--gold)] transition-colors">{t(cat.key)}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t('community')}</h4>
              <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('blog')}</a></li>
                <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('creatorStories')}</a></li>
                <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('partners')}</a></li>
                <li><a href="#" className="hover:text-[var(--gold)] transition-colors">{t('contactUs')}</a></li>
              </ul>
            </div>
          </div>
          <div className="divider my-12" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
            <p>{t('allRightsReserved')}</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-[var(--gold)] transition-colors">{t('privacyPolicy')}</Link>
              <Link href="/terms" className="hover:text-[var(--gold)] transition-colors">{t('termsOfService')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--ink)] flex items-center justify-center text-[var(--text-muted)]">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
