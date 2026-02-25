'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LayoutSimple from '@/components/LayoutSimple';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Project, Achievement } from '@/types';
import { projectStorage, achievementStorage } from '@/lib/api';
import AchievementList from '@/components/AchievementList';
import { ProjectGridSkeleton } from '@/components/SkeletonCard';

export default function MyProjectsPage() {
  const { t } = useTranslation('common');
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'created' | 'achievements'>('created');
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/auth/login'); return; }
    if (!user) return;

    const loadData = async () => {
      try {
        const [allProjects, achResult] = await Promise.all([
          projectStorage.getAllProjects(),
          achievementStorage.getByContributor(user.name),
        ]);
        if (allProjects.success && allProjects.data) {
          setCreatedProjects(allProjects.data.filter(p => p.creatorId === user.id));
        }
        if (achResult.success && achResult.data) setAchievements(achResult.data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoggedIn, user]);

  if (!isLoggedIn || !user) return null;

  const tabs = [
    { id: 'created' as const, label: t('myProjects'), count: createdProjects.length },
    { id: 'achievements' as const, label: t('myAchievements'), count: achievements.length },
  ];

  return (
    <LayoutSimple>
      <div className="max-w-5xl mx-auto">
        {/* 用户信息卡片 */}
        <div className="card p-8 mb-8 animate-fade-up">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--ink-border)]">
              <img src={user.avatar || '/default-avatar.svg'} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl text-[var(--text-primary)] mb-1">{user.name}</h1>
              <p className="text-[var(--text-muted)] mb-4">{user.email}</p>
              <div className="flex gap-8 text-sm">
                <div>
                  <span className="text-2xl font-medium text-[var(--text-primary)]">{createdProjects.length}</span>
                  <span className="text-[var(--text-muted)] ml-2">{t('projects')}</span>
                </div>
                <div>
                  <span className="text-2xl font-medium text-[var(--gold)]">{achievements.length}</span>
                  <span className="text-[var(--text-muted)] ml-2">{t('achievements')}</span>
                </div>
              </div>
            </div>
            <Link href="/projects/new">
              <button className="btn-primary">{t('createProject')}</button>
            </Link>
          </div>
        </div>

        {/* 标签页 */}
        <div className="card overflow-hidden animate-fade-up delay-1">
          <div className="flex border-b border-[var(--ink-border)]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
              >
                {tab.label} ({tab.count})
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--gold)]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'created' && (
              loading ? (
                <ProjectGridSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
              ) : createdProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdProjects.map((project, i) => {
                    const progress = Math.min((project.currentDuration / project.targetDuration) * 100, 100);
                    const plainDesc = project.description.replace(/<[^>]*>/g, '');
                    return (
                      <Link href={`/projects/${project.id}`} key={project.id}>
                        <article className="card group cursor-pointer overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="aspect-[16/10] bg-[var(--ink-lighter)] overflow-hidden">
                            {project.coverImage ? (
                              <img src={project.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <div className="tag mb-3">{project.category}</div>
                            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-[var(--gold)] transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{plainDesc}</p>
                            <div className="progress-track mb-2">
                              <div className="progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-[var(--text-muted)]">
                              <span>{project.currentDuration} / {project.targetDuration} {t('seconds')}</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-[var(--text-muted)] mb-6">{t('noCreatedProjects')}</p>
                  <Link href="/projects/new">
                    <button className="btn-primary">{t('createProject')}</button>
                  </Link>
                </div>
              )
            )}

            {activeTab === 'achievements' && (
              <AchievementList achievements={achievements} mode="contributor" />
            )}
          </div>
        </div>
      </div>
    </LayoutSimple>
  );
}