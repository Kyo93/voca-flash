// @vitest-environment jsdom

import fs from 'node:fs'
import path from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CharacterAvatar from '../../src/components/characters/CharacterAvatar'
import type { CharacterAssetManifest, CharacterModelAssetManifest } from '../../src/lib/character-assets'
import { getCharacterById } from '../../src/lib/characters'

const character = getCharacterById('seedling_scholar')
const stageDefinition = character?.evolutionStages[0]
const characterAvatarSource = fs.readFileSync(
  path.join(process.cwd(), 'src', 'components', 'characters', 'CharacterAvatar.tsx'),
  'utf-8',
).replace(/\r\n/g, '\n')

const manifest: CharacterAssetManifest = {
  seedling_scholar: {
    1: {
      idle: { poster: true, video: true },
      correct: { poster: true, video: true },
    },
  },
}

const modelManifest: CharacterModelAssetManifest = {
  arcane_brawler: {
    1: { model: true, thumbnail: true },
  },
}

describe('CharacterAvatar media renderer', () => {
  it('uses a full-stage display frame for expanded 3D viewer interaction', () => {
    expect(characterAvatarSource).toContain("display: {\n    frame: 'h-full w-full'")
  })

  it('can pass through a request to disable procedural model reactions', () => {
    expect(characterAvatarSource).toContain('disableProceduralAnimation?: boolean')
    expect(characterAvatarSource).toContain('disableModelProceduralAnimation')
  })

  it('uses static model thumbnails for non-display avatars before loading WebGL', () => {
    expect(characterAvatarSource).toContain('useModelThumbnail?: boolean')
    expect(characterAvatarSource).toContain('deferModelLoad?: boolean')
    expect(characterAvatarSource).toContain('shouldUseModelThumbnail')
    expect(characterAvatarSource).toContain('shouldDeferModelLoad')
    expect(characterAvatarSource).toContain('useModelThumbnail &&')
    expect(characterAvatarSource).toContain('modelAsset.thumbnailSrc')
    expect(characterAvatarSource).toContain('data-character-avatar-model-thumbnail="true"')
    expect(characterAvatarSource).toContain('data-character-avatar-model-placeholder="true"')
    expect(characterAvatarSource).toContain('requestIdleCallback')
    expect(characterAvatarSource).toContain("size !== 'display'")
  })

  it('renders a static thumbnail for small model-backed avatars', () => {
    const modelCharacter = getCharacterById('arcane_brawler')
    const modelStage = modelCharacter?.evolutionStages[0]
    if (!modelCharacter || !modelStage) throw new Error('Missing test model character')

    const { container } = render(
      <CharacterAvatar
        character={modelCharacter}
        stageDefinition={modelStage}
        size="sm"
        animated
        assetManifest={{}}
        modelAssetManifest={modelManifest}
      />
    )

    const image = screen.getByRole('presentation')
    expect(container.querySelector('[data-character-avatar-model-thumbnail="true"]')).toBeTruthy()
    expect(image.getAttribute('src')).toBe('/character-assets/arcane_brawler/source/thumbnail.png')
    expect(container.querySelector('[data-character-avatar-model="true"]')).toBeNull()
  })

  it('can opt out of static thumbnails for prominent model-backed avatars', () => {
    const modelCharacter = getCharacterById('arcane_brawler')
    const modelStage = modelCharacter?.evolutionStages[0]
    if (!modelCharacter || !modelStage) throw new Error('Missing test model character')

    const { container } = render(
      <CharacterAvatar
        character={modelCharacter}
        stageDefinition={modelStage}
        size="sm"
        animated
        useModelThumbnail={false}
        assetManifest={{}}
        modelAssetManifest={modelManifest}
      />
    )

    expect(container.querySelector('[data-character-avatar-model-thumbnail="true"]')).toBeNull()
  })

  it('automatically disables procedural reactions for GLB models with embedded clips', () => {
    expect(characterAvatarSource).toContain('modelAsset?.embeddedAnimationStates?.length')
    expect(characterAvatarSource).toContain('disableProceduralAnimation ||')
  })

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
