import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { RewardProgressView } from '../../lib/rewards'
import {
  buildAchievements,
  getAchievementCounts,
  getRecentAchievements,
} from '../../lib/achievements'
import AchievementCard from './AchievementCard'

interface BadgeGalleryProps {
  streak: number
  totalMastered: number
  totalTimeMs: number
  rewardProgress?: RewardProgressView | null
}

export default function BadgeGallery({ streak, totalMastered, totalTimeMs, rewardProgress }: BadgeGalleryProps) {
  const { t } = useTranslation()
  const achievements = buildAchievements({
    rewardProgress,
    streak,
    totalMastered,
    totalTimeMs,
  })
  const recentAchievements = getRecentAchievements(achievements, 2)
  const achievementCounts = getAchievementCounts(achievements)

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface">
            {t('progress.recent_achievements')}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {t('achievements.unlockedSummary', achievementCounts)}
          </p>
        </div>
        <Link
          to="/achievements"
          aria-label={t('achievements.viewAll')}
          className="text-primary hover:text-primary-container transition-colors"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      </div>

      {rewardProgress && (
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {rewardProgress.currentLevel.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">{t(rewardProgress.currentLevel.titleKey)}</p>
              <p className="text-xs text-on-surface-variant truncate">
                {t('rewards.totalXp', { xp: rewardProgress.totalXp })}
              </p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${rewardProgress.levelProgress}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {recentAchievements.map((achievement, idx) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            compact
            index={idx}
          />
        ))}
      </div>

      <Link
        to="/achievements"
        className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-container transition-colors"
      >
        {t('achievements.viewAll')}
        <span className="material-symbols-outlined text-base">chevron_right</span>
      </Link>
    </div>
  )
}
