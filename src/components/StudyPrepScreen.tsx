
import type { Card } from '../lib/srs'
import { useTranslation, Trans } from 'react-i18next'

interface StudyPrepScreenProps {
  stats: {
    unlearned: Card[]
    learning: Card[]
    mastered: Card[]
  } | null
  loading: boolean
  onStart: (includeMastered: boolean) => void
  onBack: () => void
}

export default function StudyPrepScreen({ stats, loading, onStart, onBack }: StudyPrepScreenProps) {
  const { t } = useTranslation()
  
  if (loading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-on-surface-variant font-bold">{t('studyPrep.loading')}</p>
        </div>
      </div>
    )
  }

  const { unlearned, learning, mastered } = stats
  const total = unlearned.length + learning.length + mastered.length

  if (total === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <span className="material-symbols-outlined text-6xl text-stone-300 mb-4">hourglass_empty</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">{t('studyPrep.emptyTitle')}</h2>
        <p className="text-on-surface-variant mb-8">{t('studyPrep.emptyDesc')}</p>
        <button onClick={onBack} className="px-6 py-3 bg-surface-container-high text-on-surface-variant font-bold rounded-xl hover:bg-surface-variant transition-colors">
          {t('common.back')}
        </button>
      </div>
    )
  }

  const hasMastered = mastered.length > 0

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[80vh]">
      <div className="max-w-lg w-full bg-surface-container-lowest rounded-2xl p-8 sun-drenched-shadow border border-outline-variant/10 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-6 shadow-inner">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          </div>
          
          <h2 className="text-3xl font-black text-on-surface tracking-tight mb-2">{t('studyPrep.title')}</h2>
          <p className="text-on-surface-variant text-sm mb-8">
            <Trans i18nKey="studyPrep.desc" values={{ total }} />
          </p>

          <div className="space-y-3 mb-10">
            {/* Unlearned stat */}
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-stone-400">new_releases</span>
                <span className="font-bold text-on-surface">{t('studyPrep.newWords')}</span>
              </div>
              <span className="text-xl font-black text-stone-500">{unlearned.length}</span>
            </div>

            {/* Learning stat */}
            <div className="flex items-center justify-between p-4 bg-primary-fixed/30 rounded-xl border border-primary/10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">model_training</span>
                <span className="font-bold text-primary">{t('studyPrep.learning')}</span>
              </div>
              <span className="text-xl font-black text-primary">{learning.length}</span>
            </div>

            {/* Mastered stat */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">verified</span>
                <div>
                  <span className="font-bold text-green-700 block">{t('studyPrep.mastered')}</span>
                  <span className="text-[10px] text-green-600/70 font-medium uppercase tracking-widest leading-none">{t('studyPrep.masteredDesc')}</span>
                </div>
              </div>
              <span className="text-xl font-black text-green-700">{mastered.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            {hasMastered ? (
              <>
                <p className="text-sm font-bold text-center text-on-surface-variant mb-4 italic">
                  {t('studyPrep.masteredPrompt', { count: mastered.length })}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onStart(false)}
                    className="py-4 px-4 bg-white border-2 border-primary/20 text-primary font-bold rounded-xl hover:bg-primary/5 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {t('studyPrep.skipMastered')}
                  </button>
                  <button 
                    onClick={() => onStart(true)}
                    className="py-4 px-4 primary-gradient text-white font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {t('studyPrep.includeMastered')}
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => onStart(false)}
                className="w-full py-4 primary-gradient text-white font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {t('studyPrep.startNow')}
                <span className="material-symbols-outlined text-lg">play_arrow</span>
              </button>
            )}
            
            <button 
              onClick={onBack}
              className="w-full py-3 text-on-surface-variant font-bold text-sm hover:text-on-surface transition-colors mt-2"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
