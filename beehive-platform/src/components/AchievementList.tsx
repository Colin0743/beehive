'use client';

import { useTranslation } from 'react-i18next';
import { Achievement } from '@/types';

interface AchievementListProps {
  achievements: Achievement[];
  mode: 'project' | 'contributor'; // 按项目展示 or 按贡献者展示
}

export default function AchievementList({ achievements, mode }: AchievementListProps) {
  const { t } = useTranslation('common');

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="mx-auto mb-3 opacity-50">
          <path d="M12 15l-2 5l9-11h-5l2-5l-9 11h5z" />
        </svg>
        <p className="text-sm text-[var(--text-muted)]">{t('noAchievements')}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1 opacity-70">{t('achievementDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {achievements.map((achievement, i) => (
        <div
          key={achievement.id}
          className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--ink-light)] border border-[var(--ink-border)] animate-fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* 成就图标 */}
          <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
              <path d="M12 15l-2 5l9-11h-5l2-5l-9 11h5z" />
            </svg>
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-primary)] font-medium truncate">
              {achievement.taskName}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {mode === 'project' ? (
                <>{t('completedBy')}: <span className="text-[var(--gold)]">{achievement.contributorName}</span></>
              ) : (
                <>{achievement.projectName}</>
              )}
            </p>
          </div>

          {/* 日期 */}
          <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
            {new Date(achievement.completedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  );
}
