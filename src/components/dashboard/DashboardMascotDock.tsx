import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CharacterAvatar from '../characters/CharacterAvatar'
import type { CharacterAnimationState } from '../../lib/character-assets'
import type { CharacterCollectionView } from '../../lib/characters'

interface DashboardMascotDockProps {
  collection: CharacterCollectionView | null
}

const CLICK_REACTIONS: CharacterAnimationState[] = ['correct', 'celebrate', 'wrong', 'evolve']

export default function DashboardMascotDock({ collection }: DashboardMascotDockProps) {
  const { t } = useTranslation()
  const [animationState, setAnimationState] = useState<CharacterAnimationState>('idle')
  const [reactionIndex, setReactionIndex] = useState(0)
  const selectedCharacter = collection?.selectedCharacter
  const selectedItem = collection?.items.find(item => item.character.id === selectedCharacter?.id)

  useEffect(() => {
    setAnimationState('idle')
    setReactionIndex(0)
  }, [selectedCharacter?.id, selectedItem?.currentStage])

  if (!selectedCharacter || !selectedItem) return null

  const handleClick = () => {
    const nextReaction = CLICK_REACTIONS[reactionIndex % CLICK_REACTIONS.length]
    setAnimationState(nextReaction)
    setReactionIndex(current => current + 1)
  }

  return (
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
  )
}
