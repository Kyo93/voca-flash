import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import CharacterAvatar from '../characters/CharacterAvatar'
import type { CharacterAnimationState } from '../../lib/character-assets'
import type { CharacterCollectionView } from '../../lib/characters'

interface DashboardMascotDockProps {
  collection: CharacterCollectionView | null
}

const CLICK_REACTIONS: CharacterAnimationState[] = ['correct', 'celebrate', 'wrong', 'evolve']
const DOUBLE_CLICK_WINDOW_MS = 320

export default function DashboardMascotDock({ collection }: DashboardMascotDockProps) {
  const { t } = useTranslation()
  const [animationState, setAnimationState] = useState<CharacterAnimationState>('idle')
  const [reactionIndex, setReactionIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const lastMascotClickAtRef = useRef(0)
  const selectedCharacter = collection?.selectedCharacter
  const selectedItem = collection?.items.find(item => item.character.id === selectedCharacter?.id)

  useEffect(() => {
    setAnimationState('idle')
    setReactionIndex(0)
    setExpanded(false)
    lastMascotClickAtRef.current = 0
  }, [selectedCharacter?.id, selectedItem?.currentStage])

  useEffect(() => {
    if (!expanded) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [expanded])

  if (!selectedCharacter || !selectedItem) return null

  const handleClick = () => {
    const now = window.performance?.now?.() ?? Date.now()
    const isDoubleClick = now - lastMascotClickAtRef.current <= DOUBLE_CLICK_WINDOW_MS
    lastMascotClickAtRef.current = now

    if (isDoubleClick) {
      setExpanded(true)
      lastMascotClickAtRef.current = 0
      return
    }

    const nextReaction = CLICK_REACTIONS[reactionIndex % CLICK_REACTIONS.length]
    setAnimationState(nextReaction)
    setReactionIndex(current => current + 1)
  }

  const expandedViewer = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-on-surface/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={t('characters.actions.expandedView')}
      data-dashboard-expanded-view="true"
      onMouseDown={event => {
        if (event.target === event.currentTarget) setExpanded(false)
      }}
    >
      <div
        className="absolute inset-x-6 top-6 flex items-center justify-between gap-4 text-surface"
        aria-hidden="true"
      >
        <div>
          <p className="label-lg uppercase tracking-[0.28em] text-surface/70">
            {t(selectedCharacter.nameKey)}
          </p>
          <p className="title-lg text-surface">
            {t(selectedItem.currentStageDefinition.nameKey)}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface/10 text-surface ring-1 ring-surface/20 backdrop-blur-md transition-colors hover:bg-surface/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        aria-label={t('characters.actions.closeExpandedView')}
        title={t('characters.actions.closeExpandedView')}
        onClick={() => setExpanded(false)}
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      <div
        className="relative flex h-full w-full items-center justify-center"
        data-dashboard-expanded-stage="true"
      >
        <CharacterAvatar
          character={selectedCharacter}
          stageDefinition={selectedItem.currentStageDefinition}
          size="display"
          animated
          animationState="idle"
          materialQuality="pbr"
        />
      </div>
    </div>
  )

  return (
    <>
    <div
      className="absolute -left-56 top-6 z-20 hidden h-72 w-72 items-center justify-center 2xl:flex"
      data-dashboard-mascot-dock="true"
    >
      <button
        type="button"
        className="group flex h-full w-full items-center justify-center rounded-full outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-95"
        aria-label={t('characters.actions.playReaction')}
        title={t('characters.actions.playReaction')}
        onClick={handleClick}
        onDoubleClick={() => setExpanded(true)}
      >
        <CharacterAvatar
          key={`${selectedCharacter.id}-${selectedItem.currentStage}-${animationState}`}
          character={selectedCharacter}
          stageDefinition={selectedItem.currentStageDefinition}
          size="xl"
          animated
          animationState={animationState}
          onReactionEnd={() => setAnimationState('idle')}
        />
      </button>
    </div>
    {expanded && typeof document !== 'undefined' ? createPortal(expandedViewer, document.body) : null}
    </>
  )
}
