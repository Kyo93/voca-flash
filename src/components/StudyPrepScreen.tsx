
import type { Card } from '../lib/srs'
import { useState } from 'react'
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
  const [selectedMode, setSelectedMode] = useState<'new' | 'combined' | 'all'>('combined')
  
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
  const hasMastered = mastered.length > 0
  const newPercent = total > 0 ? Math.max(4, Math.round((unlearned.length / total) * 100)) : 0
  const learningPercent = total > 0 ? Math.max(4, Math.round((learning.length / total) * 100)) : 0
  const masteredPercent = total > 0 ? Math.max(4, Math.round((mastered.length / total) * 100)) : 0
  const recommendedCount = unlearned.length + learning.length
  const activeMode = selectedMode === 'new' && !hasNewWords
    ? 'combined'
    : selectedMode === 'all' && !hasMastered
      ? 'combined'
      : selectedMode

  return (
    <div data-mobile-study-prep className="flex min-h-[100dvh] flex-1 items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-8">
        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container shadow-inner sm:h-16 sm:w-16">
              <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <button
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface active:scale-95"
              aria-label={t('common.back')}
              title={t('common.back')}
            >
              <span className="material-symbols-outlined text-lg leading-none" aria-hidden="true">close</span>
            </button>
          </div>

          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">{t('studyPrep.title')}</h2>
          <p className="mb-5 text-sm text-on-surface-variant sm:mb-8">
            <Trans i18nKey="studyPrep.desc" values={{ total }} />
          </p>

          <div className="mb-6 rounded-2xl bg-surface-container p-3 sm:mb-8">
            <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-surface-container-high">
              {unlearned.length > 0 && (
                <span className="bg-on-surface-variant" style={{ width: `${newPercent}%` }} aria-hidden="true" />
              )}
              {learning.length > 0 && (
                <span className="bg-primary" style={{ width: `${learningPercent}%` }} aria-hidden="true" />
              )}
              {mastered.length > 0 && (
                <span className="bg-secondary" style={{ width: `${masteredPercent}%` }} aria-hidden="true" />
              )}
            </div>

            <dl className="grid grid-cols-3 gap-2 text-center">
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-on-surface-variant">{t('studyPrep.newWordsShort')}</dt>
                <dd className="mt-1 text-xl font-semibold text-on-surface">{unlearned.length}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-primary">{t('studyPrep.learningShort')}</dt>
                <dd className="mt-1 text-xl font-semibold text-primary">{learning.length}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-secondary">{t('studyPrep.masteredShort')}</dt>
                <dd className="mt-1 text-xl font-semibold text-secondary">{mastered.length}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-container p-1">
              <button
                type="button"
                onClick={() => setSelectedMode('combined')}
                aria-pressed={activeMode === 'combined'}
                className={`min-h-12 rounded-lg px-2 text-center text-xs font-medium transition-colors ${
                  activeMode === 'combined'
                    ? 'bg-surface-container-lowest text-on-surface'
                    : 'text-on-surface-variant'
                }`}
              >
                <span className="block">{t('studyPrep.recommendedShort')}</span>
                <span className="mt-0.5 block text-[11px] opacity-70">{t('studyPrep.recommendedWordsCount', { count: recommendedCount })}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('new')}
                disabled={!hasNewWords}
                aria-pressed={activeMode === 'new'}
                className={`min-h-12 rounded-lg px-2 text-center text-xs font-medium transition-colors disabled:opacity-35 ${
                  activeMode === 'new'
                    ? 'bg-surface-container-lowest text-on-surface'
                    : 'text-on-surface-variant'
                }`}
              >
                <span className="block">{t('studyPrep.learnOnlyNewShort')}</span>
                <span className="mt-0.5 block text-[11px] opacity-70">{t('studyPrep.newWordsCount', { count: unlearned.length })}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('all')}
                disabled={!hasMastered}
                aria-pressed={activeMode === 'all'}
                className={`min-h-12 rounded-lg px-2 text-center text-xs font-medium transition-colors disabled:opacity-35 ${
                  activeMode === 'all'
                    ? 'bg-surface-container-lowest text-on-surface'
                    : 'text-on-surface-variant'
                }`}
              >
                <span className="block">{t('studyPrep.reviewAllShort')}</span>
                <span className="mt-0.5 block text-[11px] opacity-70">{t('studyPrep.totalWordsCount', { count: total })}</span>
              </button>
            </div>

            <button
              onClick={() => onStart(activeMode)}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold text-on-primary transition-all active:scale-[0.98]"
            >
              {t('studyPrep.startLearning')}
              <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
