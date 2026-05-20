import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CharacterAvatar from '../characters/CharacterAvatar'
import type { CharacterCollectionItem, CharacterCollectionView } from '../../lib/characters'

interface MobileCharactersViewProps {
  collection: CharacterCollectionView | null
  isMutatingCharacter: boolean
  characterError: string | null
  reactionCharacterId: string | null
  onReactionEnd: (characterId: string) => void
  onOpenCharacter: (characterId: string) => void
  onUnlockCharacter: (characterId: string) => Promise<boolean>
  onSelectCharacter: (characterId: string) => Promise<boolean>
  onEvolveCharacter: (characterId: string) => Promise<boolean>
  onEvolved: (characterId: string) => void
}

function getCharacterAction(item: CharacterCollectionItem) {
  const hasNextEvolution = item.unlocked && !item.maxed && !!item.nextStageDefinition
  const key = item.unlocked
    ? hasNextEvolution
      ? 'characters.actions.evolve'
      : item.maxed
        ? 'characters.actions.maxed'
        : item.selected
          ? 'characters.actions.selected'
          : 'characters.actions.select'
    : item.affordable
      ? 'characters.actions.unlock'
      : 'characters.actions.locked'

  const disabled = (hasNextEvolution && !item.canEvolve)
    || (!item.unlocked && !item.affordable)
    || (item.unlocked && item.maxed)
    || (item.unlocked && !hasNextEvolution && item.selected)

  return { hasNextEvolution, key, disabled }
}

export default function MobileCharactersView({
  collection,
  isMutatingCharacter,
  characterError,
  reactionCharacterId,
  onReactionEnd,
  onOpenCharacter,
  onUnlockCharacter,
  onSelectCharacter,
  onEvolveCharacter,
  onEvolved,
}: MobileCharactersViewProps) {
  const { t } = useTranslation()

  return (
    <main data-mobile-characters className="min-h-full bg-surface px-4 pb-6 pt-3">
      <Link
        to="/progress"
        className="mb-3 inline-flex min-h-10 items-center gap-1 rounded-full bg-surface-container-low px-3 text-xs font-bold text-primary"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">chevron_left</span>
        {t('profileMobile.hubEyebrow')}
      </Link>

      <section className="rounded-3xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-outline-variant/30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
              {t('characters.availableXp')}
            </p>
            <h1 className="mt-1 text-xl font-bold leading-tight text-on-surface">
              {t('profileMobile.characterRoster')}
            </h1>
            <p className="mt-2 text-sm font-medium leading-5 text-on-surface-variant">
              {t('characters.subtitle')}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-primary-container px-3 py-2 text-right text-on-primary-container">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{t('characters.availableXp')}</p>
            <p className="text-base font-bold tabular-nums">{t('rewards.xpAmount', { xp: collection?.availableXp ?? 0 })}</p>
          </div>
        </div>
      </section>

      {characterError && (
        <div className="mt-4 rounded-2xl bg-error/10 p-3 text-sm font-bold text-error">
          {t(characterError)}
        </div>
      )}

      {collection?.selectedCharacter && (
        <section className="mt-4 rounded-3xl bg-secondary text-on-secondary p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">{t('profileMobile.activeCharacter')}</p>
          <p className="mt-1 text-lg font-bold">{t(collection.selectedCharacter.nameKey)}</p>
        </section>
      )}

      <section className="mt-4 space-y-3">
        {collection?.items.map(item => {
          const { character } = item
          const action = getCharacterAction(item)
          const primaryDisabled = isMutatingCharacter || action.disabled

          return (
            <article
              key={character.id}
              data-mobile-character-card={character.id}
              className={`rounded-3xl bg-surface-container-lowest p-4 shadow-sm ring-1 ${
                item.selected ? 'ring-primary/50' : 'ring-outline-variant/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low active:scale-95"
                  aria-label={t('characters.actions.expandedView')}
                  onClick={() => onOpenCharacter(character.id)}
                >
                  <CharacterAvatar
                    character={character}
                    stageDefinition={item.currentStageDefinition}
                    size="sm"
                    animated={reactionCharacterId === character.id}
                    animationState={reactionCharacterId === character.id ? 'evolve' : 'idle'}
                    onReactionEnd={() => onReactionEnd(character.id)}
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-on-surface">
                        {t(item.currentStageDefinition.nameKey)}
                      </h2>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant/65">
                        {t(`characters.rarity.${character.rarity}`)}
                      </p>
                    </div>
                    {item.selected && (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
                        <span className="material-symbols-outlined text-base" aria-hidden="true">verified</span>
                      </span>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-on-surface-variant">
                    {t(item.currentStageDefinition.descriptionKey)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/65">
                    {item.unlocked ? t('characters.evolutionCost') : t('characters.cost')}
                  </p>
                  <p className="mt-1 text-sm font-bold text-on-surface">
                    {item.unlocked
                      ? item.maxed
                        ? t('characters.maxStage')
                        : t('rewards.xpAmount', { xp: item.nextStageDefinition?.costXp ?? 0 })
                      : t('rewards.xpAmount', { xp: character.costXp })}
                  </p>
                  {item.unlocked && !item.maxed && !item.canEvolve && (
                    <p className="mt-1 text-xs font-medium text-on-surface-variant">
                      {t('characters.needMoreXp', { xp: item.remainingXpForEvolution })}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={primaryDisabled}
                  onClick={async () => {
                    if (action.hasNextEvolution) {
                      const evolved = await onEvolveCharacter(character.id)
                      if (evolved) onEvolved(character.id)
                    } else if (item.unlocked) {
                      await onSelectCharacter(character.id)
                    } else {
                      await onUnlockCharacter(character.id)
                    }
                  }}
                  className={`min-h-11 rounded-2xl px-4 text-xs font-bold transition-all active:scale-95 ${
                    primaryDisabled
                      ? 'bg-surface-container text-on-surface-variant'
                      : 'bg-primary text-on-primary'
                  }`}
                >
                  {t(action.key)}
                </button>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
