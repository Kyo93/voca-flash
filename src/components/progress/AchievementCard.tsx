import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { AchievementView } from '../../lib/achievements'

interface AchievementCardProps {
  achievement: AchievementView
  compact?: boolean
  index?: number
}

export default function AchievementCard({ achievement, compact = false, index = 0 }: AchievementCardProps) {
  const { t } = useTranslation()
  const displayedCurrent = Math.min(achievement.current, achievement.target)
  const progressText = t(achievement.unitKey, {
    current: displayedCurrent.toLocaleString(),
    target: achievement.target.toLocaleString(),
  })

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.06, 0.24) }}
        className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
          achievement.unlocked
            ? 'bg-primary/5 border border-primary/10 hover:bg-primary/10'
            : 'border border-dashed border-outline-variant bg-surface-container-lowest/40 opacity-80'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            achievement.unlocked
              ? 'bg-primary text-white shadow-inner'
              : 'bg-surface-dim text-on-surface-variant'
          }`}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={achievement.unlocked ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {achievement.unlocked ? achievement.icon : 'lock'}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className={`text-sm font-medium truncate ${achievement.unlocked ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {t(achievement.titleKey)}
            </p>
            <span className="text-xs font-medium text-on-surface-variant shrink-0">{achievement.progress}%</span>
          </div>
          <p className="text-xs text-on-surface-variant truncate">{progressText}</p>
          <div className="mt-2 h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${achievement.progress}%` }} />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.24) }}
      className={`flex items-center gap-4 rounded-lg transition-colors ${
        compact ? 'p-4' : 'p-5'
      } ${
        achievement.unlocked
          ? 'bg-primary/5 border border-primary/10 hover:bg-primary/10'
          : 'border-2 border-dashed border-outline-variant bg-surface-container-lowest/40 opacity-80'
      }`}
    >
      <div
        className={`rounded-full flex items-center justify-center shrink-0 ${
          compact ? 'w-12 h-12' : 'w-14 h-14'
        } ${
          achievement.unlocked
            ? 'bg-primary text-white shadow-inner'
            : 'bg-surface-dim text-on-surface-variant'
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={achievement.unlocked ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {achievement.unlocked ? achievement.icon : 'lock'}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`font-medium truncate ${achievement.unlocked ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {t(achievement.titleKey)}
            </p>
            <p className="text-sm text-on-surface-variant line-clamp-2">
              {t(achievement.descriptionKey)}
            </p>
          </div>
          {!compact && (
            <span className={`text-xs font-medium rounded-full px-3 py-1 shrink-0 ${
              achievement.unlocked
                ? 'bg-primary-container/20 text-primary'
                : 'bg-surface-container text-on-surface-variant'
            }`}>
              {t(achievement.unlocked ? 'achievements.statusUnlocked' : 'achievements.statusLocked')}
            </span>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-xs font-medium text-on-surface-variant">{progressText}</span>
            <span className="text-xs font-medium text-on-surface-variant">{achievement.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${achievement.progress}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
