import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Word } from '../../lib/types'
import type { RewardBadge, RewardProgressView } from '../../lib/rewards'

interface SessionSummaryProps {
  stats: {
    correct: number
    wrong: number
    points: number
    mistakes: Word[]
  }
  rewardProgress?: RewardProgressView
  unlockedBadges?: RewardBadge[]
  onRestart: () => void
  mascot?: ReactNode
}

export default function SessionSummary({
  stats,
  rewardProgress,
  unlockedBadges = [],
  onRestart,
  mascot
}: SessionSummaryProps) {
  const { t } = useTranslation()
  const [displayXP, setDisplayXP] = useState(0)
  const total = stats.correct + stats.wrong
  const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0

  useEffect(() => {
    const end = stats.points
    const duration = 1500
    const stepTime = Math.max(Math.floor(duration / end), 20)
    
    if (end === 0) return

    const timer = setInterval(() => {
      setDisplayXP(prev => {
        if (prev >= end) {
          clearInterval(timer)
          return end
        }
        const increment = Math.ceil(end / (duration / stepTime))
        return Math.min(prev + increment, end)
      })
    }, stepTime)

    return () => clearInterval(timer)
  }, [stats.points])

  return (
    <div data-mobile-session-summary className="fixed inset-0 max-h-[100dvh] overflow-y-auto overflow-x-hidden bg-arena-bg p-4 sm:p-6">
      <div className="relative flex min-h-full items-center justify-center">
      {/* Background Stage - Vibrant Blobs (Same as ArenaShell for continuity) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-arena-blob-1/20 rounded-full blur-[120px] animate-blob filter" />
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-arena-blob-2/20 rounded-full blur-[120px] animate-blob [animation-delay:2s] filter" />
        <div className="absolute bottom-[-10%] left-[10%] w-[45%] h-[45%] bg-arena-blob-3/40 rounded-full blur-[100px] animate-blob [animation-delay:4s] filter" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[80px] animate-blob [animation-delay:6s] filter" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl py-4"
      >
        <div className="mb-6 text-center sm:mb-12">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-4xl border border-primary/20 bg-primary/20 text-primary shadow-[0_0_80px_rgba(var(--primary-rgb),0.3)] sm:mb-8 sm:h-24 sm:w-24"
          >
            <span className="material-symbols-outlined text-3xl sm:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-shadow-glow mb-2 text-3xl font-black tracking-tight text-white sm:text-5xl"
          >
            {t('sessionSummary.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base font-bold text-white/40 sm:text-lg"
          >
            {t('sessionSummary.subtitle')}
          </motion.p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-arena-item group relative overflow-hidden rounded-3xl border-white/10 p-4 text-center sm:p-8"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-shadow-glow relative mb-1 block text-3xl font-black text-primary sm:text-5xl">{displayXP}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black relative">{t('sessionSummary.xp')}</span>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass-arena-item group rounded-3xl border-white/10 p-4 text-center sm:p-8"
          >
            <span className="text-shadow-glow relative mb-1 block text-3xl font-black text-white sm:text-5xl">{accuracy}%</span>
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black relative">{t('sessionSummary.accuracy')}</span>
          </motion.div>
        </div>

        {rewardProgress && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="glass-arena-item mb-5 rounded-3xl border-white/10 p-4 sm:mb-8 sm:p-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/20 text-secondary sm:h-14 sm:w-14">
                <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {rewardProgress.currentLevel.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <p className="text-white font-black truncate">{t(rewardProgress.currentLevel.titleKey)}</p>
                  <span className="text-[10px] text-secondary font-black uppercase tracking-widest shrink-0">
                    {t('rewards.levelShort', { level: rewardProgress.currentLevel.level })}
                  </span>
                </div>
                <p className="text-sm text-white/40 font-medium truncate">{t(rewardProgress.currentLevel.characterKey)}</p>
                <div className="h-2 mt-4 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-secondary" style={{ width: `${rewardProgress.levelProgress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] font-black uppercase tracking-widest text-white/25">
                  <span>{t('rewards.totalXp', { xp: rewardProgress.totalXp })}</span>
                  <span>
                    {rewardProgress.nextLevel
                      ? t('rewards.progressToNext', {
                        current: rewardProgress.xpIntoLevel,
                        target: rewardProgress.xpForNextLevel
                      })
                      : t('rewards.maxLevel')}
                  </span>
                </div>
              </div>
            </div>

            {unlockedBadges.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary mb-3">
                  {t('rewards.unlocked')}
                </p>
                <div className="flex flex-wrap gap-3">
                  {unlockedBadges.map(badge => (
                    <div key={badge.id} className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
                      <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{badge.icon}</span>
                      <span className="text-xs font-black text-white">{t(badge.titleKey)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Mistakes Audit Section */}
        <AnimatePresence>
          {stats.mistakes.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-6 sm:mb-12"
            >
              <div className="mb-4 flex items-center gap-4 sm:mb-6">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{t('sessionSummary.mistakes')}</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <div className="grid max-h-[240px] grid-cols-1 gap-3 overflow-y-auto pr-1 custom-scrollbar sm:max-h-[300px] sm:pr-4">
                {stats.mistakes.map((w, i) => (
                  <div key={`${w.id}-${i}`} className="glass-arena-item p-4 rounded-2xl flex items-center justify-between group border-white/5 hover:border-primary/20 transition-all">
                    <div className="min-w-0">
                      <h4 className="truncate text-base font-black text-white transition-colors group-hover:text-primary sm:text-lg">{w.word}</h4>
                      <p className="text-white/40 text-sm font-medium">{w.definition}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-[8px] font-black text-red-500/60 uppercase tracking-widest bg-red-500/5 px-2 py-1 rounded-full border border-red-500/10">{t('sessionSummary.reviewSoon')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-4"
        >
          <button 
            onClick={onRestart}
            className="primary-glow group flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-primary py-3 font-black text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 sm:py-5"
          >
            <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-700">refresh</span>
            {t('sessionSummary.restart')}
          </button>
          <Link 
            to="/dashboard"
            className="glass-arena-item flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 py-3 text-center font-black tracking-widest text-white/60 transition-all hover:bg-white/10 hover:text-white sm:py-5"
          >
            {t('sessionSummary.dashboard')}
          </Link>
        </motion.div>
      </motion.div>

      {mascot && (
        <div className="pointer-events-none absolute bottom-8 right-8 z-20 hidden lg:block">
          {mascot}
        </div>
      )}
      </div>
    </div>
  )
}
