import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { CharacterCollectionView } from '../../lib/characters'

interface CharacterShowcaseCardProps {
  collection: CharacterCollectionView | null
  loading?: boolean
}

export default function CharacterShowcaseCard({ collection, loading = false }: CharacterShowcaseCardProps) {
  const { t } = useTranslation()
  const selectedCharacter = collection?.selectedCharacter
  const selectedItem = collection?.items.find(item => item.character.id === selectedCharacter?.id)
  const stage = selectedItem?.currentStageDefinition

  return (
    <div className="bg-surface-container-lowest rounded-4xl sun-drenched-shadow p-7 mb-8 overflow-hidden relative">
      <div className="absolute -right-8 -top-10 text-9xl text-primary/5 material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
        deployed_code
      </div>
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
              {t('characters.showcaseLabel')}
            </p>
            <h3 className="text-2xl font-black text-on-surface">
              {stage ? t(stage.nameKey) : selectedCharacter ? t(selectedCharacter.nameKey) : t('common.loading')}
            </h3>
            <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
              {stage ? t(stage.descriptionKey) : selectedCharacter ? t(selectedCharacter.descriptionKey) : t('characters.loadingCollection')}
            </p>
            {selectedItem && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs font-black text-primary bg-primary/10 rounded-full px-3 py-1">
                  {t('characters.stageLabel', {
                    current: selectedItem.currentStage,
                    total: selectedCharacter?.evolutionStages.length ?? selectedItem.currentStage,
                  })}
                </span>
                <span className="text-xs font-bold text-on-surface-variant">
                  {selectedItem.maxed
                    ? t('characters.maxStage')
                    : t('characters.nextEvolutionCost', { xp: selectedItem.nextStageDefinition?.costXp ?? 0 })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
          <div className="rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3 min-w-36">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {t('characters.availableXp')}
            </p>
            <p className="text-2xl font-black text-primary">
              {loading ? '...' : t('rewards.xpAmount', { xp: collection?.availableXp ?? 0 })}
            </p>
          </div>
          <Link
            to="/characters"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-sm font-black hover:bg-primary-dim transition-colors"
          >
            {t('characters.openCollection')}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
