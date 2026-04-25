import type { CharacterAnimationState } from '../../lib/character-assets'
import type { CharacterCollectionView } from '../../lib/characters'
import CharacterAvatar from './CharacterAvatar'

interface CharacterReactionAvatarProps {
  collection: CharacterCollectionView | null
  animationState?: CharacterAnimationState
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onReactionEnd?: () => void
}

export default function CharacterReactionAvatar({
  collection,
  animationState = 'idle',
  animated = true,
  size = 'sm',
  className = '',
  onReactionEnd,
}: CharacterReactionAvatarProps) {
  const selectedCharacter = collection?.selectedCharacter
  const selectedItem = collection?.items.find(item => item.character.id === selectedCharacter?.id)

  if (!selectedCharacter || !selectedItem) return null

  return (
    <div
      className={className}
      data-character-reaction-avatar="true"
      data-character-id={selectedCharacter.id}
      data-character-stage={selectedItem.currentStage}
    >
      <CharacterAvatar
        character={selectedCharacter}
        stageDefinition={selectedItem.currentStageDefinition}
        size={size}
        animated={animated}
        animationState={animationState}
        onReactionEnd={onReactionEnd}
      />
    </div>
  )
}
