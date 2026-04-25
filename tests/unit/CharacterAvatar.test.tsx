// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CharacterAvatar from '../../src/components/characters/CharacterAvatar'
import type { CharacterAssetManifest } from '../../src/lib/character-assets'
import { getCharacterById } from '../../src/lib/characters'

const character = getCharacterById('seedling_scholar')
const stageDefinition = character?.evolutionStages[0]

const manifest: CharacterAssetManifest = {
  seedling_scholar: {
    1: {
      idle: { poster: true, video: true },
      correct: { poster: true, video: true },
    },
  },
}

describe('CharacterAvatar media renderer', () => {
  it('uses the CSS fallback when no media asset is registered', () => {
    if (!character || !stageDefinition) throw new Error('Missing test character')

    const { container } = render(
      <CharacterAvatar character={character} stageDefinition={stageDefinition} size="sm" assetManifest={{}} />
    )

    expect(container.querySelector('[data-character-avatar-fallback="true"]')).toBeTruthy()
  })

  it('renders still artwork for dense grids when animation is disabled', () => {
    if (!character || !stageDefinition) throw new Error('Missing test character')

    render(
      <CharacterAvatar
        character={character}
        stageDefinition={stageDefinition}
        size="sm"
        animated={false}
        assetManifest={manifest}
      />
    )

    const image = screen.getByRole('presentation')
    expect(image.getAttribute('src')).toBe('/character-assets/seedling_scholar/stage-1/idle.webp')
  })

  it('renders a looped idle video when animation is enabled', () => {
    if (!character || !stageDefinition) throw new Error('Missing test character')

    const { container } = render(
      <CharacterAvatar
        character={character}
        stageDefinition={stageDefinition}
        size="sm"
        animated
        assetManifest={manifest}
      />
    )

    const video = container.querySelector('video')
    expect(video).toBeTruthy()
    expect(video?.getAttribute('src')).toBe('/character-assets/seedling_scholar/stage-1/idle.webm')
    expect(video?.getAttribute('poster')).toBe('/character-assets/seedling_scholar/stage-1/idle.webp')
    expect(video?.hasAttribute('loop')).toBe(true)
  })

  it('calls the reaction end handler for non-idle clips', () => {
    if (!character || !stageDefinition) throw new Error('Missing test character')

    const onReactionEnd = vi.fn()
    const { container } = render(
      <CharacterAvatar
        character={character}
        stageDefinition={stageDefinition}
        size="sm"
        animated
        animationState="correct"
        onReactionEnd={onReactionEnd}
        assetManifest={manifest}
      />
    )

    const video = container.querySelector('video')
    if (!video) throw new Error('Expected video element')

    fireEvent.ended(video)

    expect(video.hasAttribute('loop')).toBe(false)
    expect(onReactionEnd).toHaveBeenCalledTimes(1)
  })
})
