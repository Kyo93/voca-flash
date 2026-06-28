
import type { Card } from '../lib/srs'
import { useTranslation, Trans } from 'react-i18next'

interface StudyPrepScreenProps {
  stats: {
    unlearned: Card[]
    learning: Card[]
    mastered: Card[]
  } | null
  errorKey?: string | null
  loading: boolean
  onStart: (mode: 'new' | 'combined' | 'all') => void
  onBack: () => void
}

export default function StudyPrepScreen({ stats, errorKey, loading, onStart, onBack }: StudyPrepScreenProps) {
  const { t } = useTranslation()
  
  if (loading || !stats) {
    return (
      <div className="flex min-h-[100dvh] flex-1 items-center justify-center p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-on-surface-variant font-medium">{t('studyPrep.loading')}</p>
        </div>
      </div>
    )
  }

  if (errorKey) {
    return (
      <div className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center p-4 text-center sm:p-6">
        <div className="max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sun-drenched sm:p-8">
          <span className="material-symbols-outlined mb-4 text-5xl text-primary sm:text-6xl">sync_problem</span>
          <h2 className="mb-2 text-xl font-medium text-on-surface sm:text-2xl">{t(`${errorKey}.title`)}</h2>
          <p className="mb-6 text-sm leading-6 text-on-surface-variant sm:text-base">{t(`${errorKey}.desc`)}</p>
          <button onClick={onBack} className="min-h-11 rounded-xl bg-surface-container-high px-6 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-variant">
            {t('common.back')}
          </button>
        </div>
      </div>
    )
  }

  const { unlearned, learning, mastered } = stats
  const total = unlearned.length + learning.length + mastered.length

  if (total === 0) {
    return (
      <div className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center p-4 text-center sm:p-6">
        <span className="material-symbols-outlined mb-4 text-5xl text-stone-300 sm:text-6xl">hourglass_empty</span>
        <h2 className="mb-2 text-xl font-medium text-on-surface sm:text-2xl">{t('studyPrep.emptyTitle')}</h2>
        <p className="mb-6 text-on-surface-variant sm:mb-8">{t('studyPrep.emptyDesc')}</p>
        <button onClick={onBack} className="min-h-11 rounded-xl bg-surface-container-high px-6 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-variant">
          {t('common.back')}
        </button>
      </div>
    )
  }

  const hasNewWords = unlearned.length > 0
  const hasLearningWords = learning.length > 0
  const hasMastered = mastered.length > 0

  return (
    <div data-mobile-study-prep className="flex min-h-[100dvh] flex-1 items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-8">
        <div className="relative z-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container shadow-inner sm:mb-6 sm:h-16 sm:w-16">
            <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          </div>
          
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">{t('studyPrep.title')}</h2>
          <p className="mb-5 text-sm text-on-surface-variant sm:mb-8">
            <Trans i18nKey="studyPrep.desc" values={{ total }} />
          </p>

          <div className="mb-6 space-y-2 sm:mb-10 sm:space-y-3">
            {/* Unlearned stat */}
            <div className="flex items-center justify-between rounded-xl bg-surface-container p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">new_releases</span>
                <span className="font-medium text-on-surface">{t('studyPrep.newWords')}</span>
              </div>
              <span className="text-lg font-semibold text-on-surface sm:text-xl">{unlearned.length}</span>
            </div>

            {/* Learning stat */}
            <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary-container/40 p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">model_training</span>
                <span className="font-medium text-primary">{t('studyPrep.learning')}</span>
              </div>
              <span className="text-lg font-semibold text-primary sm:text-xl">{learning.length}</span>
            </div>

            {/* Mastered stat */}
            <div className="flex items-center justify-between rounded-xl border border-secondary/15 bg-secondary-container/45 p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">verified</span>
                <div>
                  <span className="font-medium text-secondary block">{t('studyPrep.mastered')}</span>
                  <span className="text-[9px] font-medium uppercase leading-none text-on-surface-variant sm:text-[10px]">{t('studyPrep.masteredDesc')}</span>
                </div>
              </div>
              <span className="text-lg font-semibold text-secondary sm:text-xl">{mastered.length}</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {hasLearningWords ? (
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {hasNewWords && (
                  <button
                    onClick={() => onStart('new')}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-surface-container-lowest px-4 py-3 font-medium text-primary transition-all active:scale-95 sm:py-4"
                  >
                    <span className="material-symbols-outlined text-lg">fiber_new</span>
                    {t('studyPrep.learnOnlyNew')}
                  </button>
                )}
                <button 
                  onClick={() => onStart('combined')}
                  className="primary-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-on-primary transition-all active:scale-95 sm:py-4"
                >
                  <span className="material-symbols-outlined text-lg">model_training</span>
                  {t('studyPrep.learnCombined')}
                </button>
              </div>
            ) : hasNewWords ? (
              <button 
                onClick={() => onStart('combined')}
                className="primary-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-on-primary transition-all active:scale-95 sm:py-4"
              >
                {t('studyPrep.startNow')}
                <span className="material-symbols-outlined text-lg">play_arrow</span>
              </button>
            ) : null}

            {hasMastered && (
              <button 
                onClick={() => onStart('all')}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-secondary/20 bg-secondary-container/35 px-4 py-2 text-sm font-medium text-secondary transition-all"
              >
                <span className="material-symbols-outlined text-lg">verified</span>
                {t('studyPrep.includeMastered')}
              </button>
            )}
            
            <button 
              onClick={onBack}
              className="mt-1 min-h-11 w-full text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface sm:mt-2"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
