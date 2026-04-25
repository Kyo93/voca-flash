import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAnalytics } from '../hooks/useAnalytics'
import { useAuth } from '../contexts/AuthContext'
import { useRewardProgress } from '../hooks/useRewardProgress'
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_TITLE_KEYS,
  buildAchievements,
  getAchievementCounts,
} from '../lib/achievements'
import AchievementCard from '../components/progress/AchievementCard'

export default function AchievementsPage() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAnalytics()
  const { user } = useAuth()
  const { rewardProgress, isLoadingRewards } = useRewardProgress(user?.id)

  const achievements = useMemo(() => {
    if (!data) return []

    return buildAchievements({
      rewardProgress,
      streak: data.streak_days,
      totalMastered: data.mastered_count,
      totalTimeMs: data.total_time_ms,
    })
  }, [data, rewardProgress])

  const achievementCounts = getAchievementCounts(achievements)

  if (isLoading || (isLoadingRewards && !rewardProgress)) {
    return <div className="p-12 animate-pulse text-on-surface-variant font-medium">{t('progress.loading')}</div>
  }

  if (error) {
    return <div className="p-12 text-error">{t('progress.error')}</div>
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <Link
              to="/progress"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-container transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
              {t('achievements.backToProgress')}
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-on-surface mb-3">
              {t('achievements.title')}
            </h1>
            <p className="max-w-2xl text-lg text-on-surface-variant">
              {t('achievements.subtitle')}
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 min-w-64 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)]">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              {t('achievements.totalBadges')}
            </p>
            <p className="text-4xl font-black text-on-surface">
              {t('achievements.unlockedSummary', achievementCounts)}
            </p>
          </div>
        </section>

        {rewardProgress && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)]">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {rewardProgress.currentLevel.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface-variant">
                    {t('achievements.currentLevel')}
                  </p>
                  <h2 className="text-2xl font-black text-on-surface">
                    {t(rewardProgress.currentLevel.titleKey)}
                  </h2>
                </div>
              </div>

              <div className="h-3 rounded-full bg-surface-container overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${rewardProgress.levelProgress}%` }} />
              </div>
              <div className="flex items-center justify-between gap-4 mt-3 text-sm text-on-surface-variant">
                <span>{t('rewards.totalXp', { xp: rewardProgress.totalXp.toLocaleString() })}</span>
                <span>
                  {rewardProgress.nextLevel
                    ? t('rewards.progressToNext', {
                      current: rewardProgress.xpIntoLevel.toLocaleString(),
                      target: rewardProgress.xpForNextLevel.toLocaleString(),
                    })
                    : t('rewards.maxLevel')}
                </span>
              </div>
            </div>

            <div className="bg-primary text-white rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)]">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
                {t('achievements.nextFocus')}
              </p>
              <p className="text-2xl font-black leading-tight">
                {rewardProgress.nextBadge
                  ? t(rewardProgress.nextBadge.titleKey)
                  : t('achievements.allXpUnlocked')}
              </p>
              <p className="mt-3 text-sm opacity-80">
                {rewardProgress.nextBadge
                  ? t('rewards.unlockAt', { xp: rewardProgress.nextBadge.minXp.toLocaleString() })
                  : t('achievements.keepGoing')}
              </p>
            </div>
          </section>
        )}

        <section className="space-y-8">
          {ACHIEVEMENT_CATEGORIES.map(category => {
            const categoryAchievements = achievements.filter(achievement => achievement.category === category)

            return (
              <section key={category} className="space-y-4">
                <h2 className="text-2xl font-black text-on-surface">
                  {t(ACHIEVEMENT_CATEGORY_TITLE_KEYS[category])}
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {categoryAchievements.map((achievement, idx) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      index={idx}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </section>
      </main>
    </div>
  )
}
