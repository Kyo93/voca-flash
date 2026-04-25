// @vitest-environment jsdom

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CharacterReactionAvatar from '../../src/components/characters/CharacterReactionAvatar'
import { buildCharacterCollection, DEFAULT_CHARACTER_ID } from '../../src/lib/characters'
import { createEmptyRewardProgress, toRewardProgressView } from '../../src/lib/rewards'

function createCollection() {
  return buildCharacterCollection({
    rewardProgress: toRewardProgressView({
      ...createEmptyRewardProgress('user-1'),
      totalXp: 500,
      spentXp: 120,
    }),
    unlockedCharacterIds: [DEFAULT_CHARACTER_ID],
    unlockedCharacterStates: [
      { characterId: DEFAULT_CHARACTER_ID, currentStage: 2, evolutionSpentXp: 120 },
    ],
    selectedCharacterId: DEFAULT_CHARACTER_ID,
  })
}

describe('CharacterReactionAvatar', () => {
  it('renders nothing until a selected character collection exists', () => {
    const { container } = render(<CharacterReactionAvatar collection={null} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders the selected character stage as a reaction avatar', () => {
    const { container } = render(
      <CharacterReactionAvatar
        collection={createCollection()}
        animationState="celebrate"
        animated
      />
    )

    const root = container.querySelector('[data-character-reaction-avatar="true"]')
    const video = container.querySelector('video')

    expect(root).toBeTruthy()
    expect(root?.getAttribute('data-character-id')).toBe(DEFAULT_CHARACTER_ID)
    expect(root?.getAttribute('data-character-stage')).toBe('2')
    expect(video?.getAttribute('src')).toBe('/character-assets/seedling_scholar/stage-2/celebrate.webm')
  })
})
