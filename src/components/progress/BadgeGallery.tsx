import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface BadgeGalleryProps {
  streak: number
  totalMastered: number
  totalTimeMs: number
}

export default function BadgeGallery({ streak, totalMastered }: BadgeGalleryProps) {
  const { t } = useTranslation()

  const badges = [
    {
      id: 'persistent_scholar',
      icon: 'emoji_events',
      unlocked: streak >= 100,
      label: t('progress.badges_v2.persistent.label', { defaultValue: 'Học giả Kiên trì' }),
      description: t('progress.badges_v2.persistent.desc', { defaultValue: 'Hoàn thành 100 ngày liên tiếp' }),
      gradient: 'from-[#8B6914] to-[#6B4F10]',
      textColor: 'text-white',
    },
    {
      id: 'vocab_master',
      icon: 'military_tech',
      unlocked: totalMastered >= 4000,
      label: t('progress.badges_v2.vocab_master.label', { defaultValue: 'Bậc thầy Từ vựng' }),
      description: t('progress.badges_v2.vocab_master.desc', { defaultValue: 'Vượt mốc 4,000 từ' }),
      gradient: 'from-[#546435] to-[#3C4C20]',
      textColor: 'text-white',
    },
    {
      id: 'c1_peak',
      icon: 'lock',
      unlocked: false,
      label: t('progress.badges_v2.c1_peak.label', { defaultValue: 'Đỉnh cao C1' }),
      description: t('progress.badges_v2.c1_peak.desc', { defaultValue: 'Hoàn thành bài kiểm tra cuối kỳ' }),
      gradient: '',
      textColor: 'text-on-surface-variant',
    },
  ]

  return (
    <div className="bg-surface-container-lowest rounded-xl p-7 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)]">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-on-surface">
          {t('progress.recent_achievements', { defaultValue: 'Thành tựu gần đây' })}
        </h3>
        <button className="text-primary hover:text-primary-container transition-colors">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div className="space-y-3">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
              badge.unlocked
                ? 'bg-surface-container-low hover:bg-surface-variant cursor-default'
                : 'border-2 border-dashed border-outline-variant opacity-70'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              badge.unlocked
                ? `bg-linear-to-br ${badge.gradient} ${badge.textColor} shadow-inner`
                : 'bg-surface-dim text-on-surface-variant'
            }`}>
              <span className="material-symbols-outlined" style={badge.unlocked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {badge.icon}
              </span>
            </div>
            <div>
              <p className={`font-bold ${badge.unlocked ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                {badge.label}
              </p>
              <p className="text-sm text-on-surface-variant">{badge.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
