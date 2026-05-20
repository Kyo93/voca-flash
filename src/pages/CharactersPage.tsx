import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import CharacterAvatar, { preloadCharacterModelAvatar } from '../components/characters/CharacterAvatar'
import MobileCharactersView from '../components/mobile/MobileCharactersView'
import { useAuth } from '../contexts/AuthContext'
import { useCharacterCollection } from '../hooks/useCharacterCollection'
import { useMediaQuery } from '../hooks/useMediaQuery'

const CharacterExpandedViewer = lazy(() => import('../components/characters/CharacterExpandedViewer'))

export default function CharactersPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isMobileProfile = useMediaQuery('(max-width: 767px)')
  const [reactionCharacterId, setReactionCharacterId] = useState<string | null>(null)
  const [expandedCharacterId, setExpandedCharacterId] = useState<string | null>(null)
  const {
    collection,
    isLoadingCharacters,
    isMutatingCharacter,
    characterError,
    unlockCharacter,
    selectCharacter,
    evolveCharacter,
  } = useCharacterCollection(user?.id)
  const expandedItem = collection?.items.find(item => item.character.id === expandedCharacterId) ?? null

  const handleExpandedViewerIntent = () => {
    preloadCharacterModelAvatar()
  }

  const handleOpenExpandedViewer = (characterId: string) => {
    preloadCharacterModelAvatar()
    setExpandedCharacterId(characterId)
  }

  if (isLoadingCharacters && !collection) {
    return <div className="p-12 animate-pulse text-on-surface-variant font-medium">{t('common.loading')}</div>
  }

  if (isMobileProfile) {
    return (
      <div className="min-h-screen bg-surface">
        <MobileCharactersView
          collection={collection}
          isMutatingCharacter={isMutatingCharacter}
          characterError={characterError}
          reactionCharacterId={reactionCharacterId}
          onReactionEnd={(characterId) => {
            setReactionCharacterId(current => current === characterId ? null : current)
          }}
          onOpenCharacter={handleOpenExpandedViewer}
          onUnlockCharacter={unlockCharacter}
          onSelectCharacter={selectCharacter}
          onEvolveCharacter={evolveCharacter}
          onEvolved={setReactionCharacterId}
        />
        {expandedItem && (
          <Suspense fallback={
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-on-surface/85 text-surface backdrop-blur-md">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-surface/25 border-t-surface" />
            </div>
          }>
            <CharacterExpandedViewer
              character={expandedItem.character}
              stageDefinition={expandedItem.currentStageDefinition}
              onClose={() => setExpandedCharacterId(null)}
            />
          </Suspense>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-container transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
              {t('characters.backToDashboard')}
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-on-surface mb-3">
              {t('characters.title')}
            </h1>
            <p className="max-w-2xl text-lg text-on-surface-variant">
              {t('characters.subtitle')}
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 min-w-64 shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)]">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              {t('characters.availableXp')}
            </p>
            <p className="text-4xl font-black text-primary">
              {t('rewards.xpAmount', { xp: collection?.availableXp ?? 0 })}
            </p>
          </div>
        </section>

        {characterError && (
          <div className="rounded-xl bg-error/5 border border-error/20 px-4 py-3 text-sm font-medium text-error">
            {t(characterError)}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {collection?.items.map(item => {
            const { character } = item
            const hasNextEvolution = item.unlocked && !item.maxed && !!item.nextStageDefinition
            const primaryButtonKey = item.unlocked
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
            const primaryDisabled = isMutatingCharacter
              || (hasNextEvolution && !item.canEvolve)
              || (!item.unlocked && !item.affordable)
              || (item.unlocked && item.maxed)
              || (item.unlocked && !hasNextEvolution && item.selected)
            const showDisplayAction = item.unlocked

            return (
              <article
                key={character.id}
                className={`flex min-h-72 flex-col rounded-xl p-5 bg-surface-container-lowest shadow-[0_8px_32px_-4px_rgba(29,27,22,0.05)] border transition-colors ${
                  item.selected
                    ? 'border-primary'
                    : item.unlocked
                      ? 'border-primary/10'
                      : 'border-outline-variant'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <button
                    type="button"
                    className="group relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-95"
                    aria-label={t('characters.actions.expandedView')}
                    title={t('characters.actions.expandedView')}
                    onPointerEnter={handleExpandedViewerIntent}
                    onFocus={handleExpandedViewerIntent}
                    onClick={() => handleOpenExpandedViewer(character.id)}
                    onDoubleClick={() => handleOpenExpandedViewer(character.id)}
                  >
                    <CharacterAvatar
                      character={character}
                      stageDefinition={item.currentStageDefinition}
                      size="sm"
                      animated={reactionCharacterId === character.id}
                      animationState={reactionCharacterId === character.id ? 'evolve' : 'idle'}
                      onReactionEnd={() => {
                        setReactionCharacterId(current => current === character.id ? null : current)
                      }}
                    />
                  </button>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 ${
                      item.unlocked
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {t(`characters.rarity.${character.rarity}`)}
                    </span>
                    {item.unlocked && (
                      <span className="text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 bg-surface-container text-on-surface-variant">
                        {t('characters.stageLabel', {
                          current: item.currentStage,
                          total: character.evolutionStages.length,
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-black text-on-surface">
                  {t(item.currentStageDefinition.nameKey)}
                </h2>
                <p className="text-sm text-on-surface-variant mt-2 min-h-10">
                  {t(item.currentStageDefinition.descriptionKey)}
                </p>

                <div className="mt-auto flex flex-col gap-4 pt-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      {item.unlocked ? t('characters.evolutionCost') : t('characters.cost')}
                    </p>
                    <p className="font-black text-on-surface">
                      {item.unlocked
                        ? item.maxed
                          ? t('characters.maxStage')
                          : t('rewards.xpAmount', { xp: item.nextStageDefinition?.costXp ?? 0 })
                        : t('rewards.xpAmount', { xp: character.costXp })}
                    </p>
                    {item.unlocked && !item.maxed && !item.canEvolve && (
                      <p className="text-xs text-on-surface-variant mt-1">
                        {t('characters.needMoreXp', { xp: item.remainingXpForEvolution })}
                      </p>
                    )}
                  </div>
                  <div className={showDisplayAction
                    ? 'flex w-full items-center justify-end gap-2 sm:w-auto'
                    : 'flex w-full justify-end sm:w-auto'
                  }>
                    <button
                      type="button"
                      disabled={primaryDisabled}
                      onClick={async () => {
                        if (hasNextEvolution) {
                          const evolved = await evolveCharacter(character.id)
                          if (evolved) setReactionCharacterId(character.id)
                        } else if (item.unlocked) {
                          await selectCharacter(character.id)
                        } else {
                          await unlockCharacter(character.id)
                        }
                      }}
                      className={`inline-flex h-9 min-w-24 items-center justify-center gap-1 rounded-xl px-3 text-xs font-black transition-colors ${
                        primaryDisabled
                          ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dim'
                      }`}
                    >
                      {t(primaryButtonKey)}
                    </button>
                    {showDisplayAction && (
                      item.selected ? (
                        <span
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                          title={t('characters.actions.selected')}
                          aria-label={t('characters.actions.selected')}
                        >
                          <span className="material-symbols-outlined text-lg">verified</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isMutatingCharacter}
                          onClick={() => selectCharacter(character.id)}
                          className="inline-flex h-9 min-w-24 items-center justify-center gap-1 rounded-xl border border-primary/20 px-3 text-xs font-black text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-outline-variant disabled:text-on-surface-variant"
                        >
                          {t('characters.actions.select')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </main>
      {expandedItem && (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-on-surface/85 text-surface backdrop-blur-md"
              aria-hidden="true"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-surface/25 border-t-surface" />
            </div>
          }
        >
          <CharacterExpandedViewer
            character={expandedItem.character}
            stageDefinition={expandedItem.currentStageDefinition}
            onClose={() => setExpandedCharacterId(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
