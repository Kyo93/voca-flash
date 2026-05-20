import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_TITLE_KEYS,
  type AchievementView,
} from '../../lib/achievements'
import type { RewardProgressView } from '../../lib/rewards'

interface MobileAchievementsViewProps {
  achievements: AchievementView[]
  achievementCounts: {
    unlocked: number
    total: number
  }
  rewardProgress: RewardProgressView | null
}

function getProgressWidth(progress: number) {
  if (!Number.isFinite(progress)) return 0
  return Math.min(100, Math.max(0, Math.round(progress)))
}

export default function MobileAchievementsView({
  achievements,
  achievementCounts,
  rewardProgress,
}: MobileAchievementsViewProps) {
  const { t } = useTranslation()

  return (
    <main data-mobile-achievements className="min-h-full bg-surface px-4 pb-6 pt-3">
      <Link
        to="/progress"
        className="mb-3 inline-flex min-h-10 items-center gap-1 rounded-full bg-surface-container-low px-3 text-xs font-bold text-primary"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">chevron_left</span>
        {t('achievements.backToProgress')}
      </Link>

      <section className="rounded-3xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-outline-variant/30">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
          {t('profileMobile.hubEyebrow')}
        </p>
        <h1 className="mt-1 text-xl font-bold leading-tight text-on-surface">
          {t('achievements.title')}
        </h1>
        <p className="mt-2 text-sm font-medium leading-5 text-on-surface-variant">
          {t('achievements.subtitle')}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-primary-container p-3 text-on-primary-container">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">{t('achievements.totalBadges')}</p>
            <p className="mt-2 text-xl font-bold tabular-nums">
              {t('achievements.unlockedSummary', achievementCounts)}
            </p>
          </div>
          <div className="rounded-2xl bg-secondary-container p-3 text-on-secondary-container">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">{t('achievements.nextFocus')}</p>
            <p className="mt-2 line-clamp-2 text-sm font-bold leading-5">
              {rewardProgress?.nextBadge ? t(rewardProgress.nextBadge.titleKey) : t('achievements.allXpUnlocked')}
            </p>
          </div>
        </div>
      </section>

      {rewardProgress && (
        <section className="mt-4 rounded-3xl bg-secondary text-on-secondary p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-on-secondary/15">
              <span className="material-symbols-outlined" aria-hidden="true">{rewardProgress.currentLevel.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">{t('achievements.currentLevel')}</p>
              <h2 className="truncate text-base font-bold">{t(rewardProgress.currentLevel.titleKey)}</h2>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-on-secondary/20">
            <div className="h-full rounded-full bg-on-secondary" style={{ width: `${rewardProgress.levelProgress}%` }} />
          </div>
          <p className="mt-2 text-xs font-medium opacity-80">
            {rewardProgress.nextLevel
              ? t('rewards.progressToNext', {
                current: rewardProgress.xpIntoLevel.toLocaleString(),
                target: rewardProgress.xpForNextLevel.toLocaleString(),
              })
              : t('rewards.maxLevel')}
          </p>
        </section>
      )}

      <section className="mt-4 space-y-5">
        {ACHIEVEMENT_CATEGORIES.map(category => {
          const categoryAchievements = achievements.filter(achievement => achievement.category === category)

          return (
            <section key={category} className="space-y-2">
              <h2 className="px-1 text-sm font-bold text-on-surface">
                {t(ACHIEVEMENT_CATEGORY_TITLE_KEYS[category])}
              </h2>

              <div className="space-y-2">
                {categoryAchievements.map(achievement => {
                  const progress = getProgressWidth(achievement.progress)

                  return (
                    <article
                      key={achievement.id}
                      data-mobile-achievement-card={achievement.id}
                      className="rounded-2xl bg-surface-container-lowest p-3 shadow-sm ring-1 ring-outline-variant/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          achievement.unlocked ? 'bg-primary-container text-primary' : 'bg-surface-container-low text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-xl" aria-hidden="true">{achievement.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="line-clamp-1 text-sm font-bold text-on-surface">{t(achievement.titleKey)}</h3>
                            <span className="shrink-0 text-xs font-bold tabular-nums text-on-surface-variant">{progress}%</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-on-surface-variant">
                            {t(achievement.descriptionKey)}
                          </p>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-high">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </section>
    </main>
  )
}
