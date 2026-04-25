import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CHARACTER_ANIMATION_STATES,
  CHARACTER_ASSET_MANIFEST,
  type CharacterAssetManifest,
  resolveCharacterMediaAsset,
} from '../../src/lib/character-assets'

const manifest: CharacterAssetManifest = {
  seedling_scholar: {
    1: {
      idle: { poster: true, video: true },
      correct: { poster: true, video: true },
      wrong: { poster: true },
    },
  },
}

describe('character asset resolver', () => {
  it('builds stable public paths for a stage animation', () => {
    const asset = resolveCharacterMediaAsset({
      characterId: 'seedling_scholar',
      stage: 1,
      state: 'correct',
      animated: true,
      manifest,
    })

    expect(asset).toEqual({
      characterId: 'seedling_scholar',
      stage: 1,
      state: 'correct',
      imageSrc: '/character-assets/seedling_scholar/stage-1/correct.webp',
      posterSrc: '/character-assets/seedling_scholar/stage-1/correct.webp',
      videoSrc: '/character-assets/seedling_scholar/stage-1/correct.webm',
    })
  })

  it('returns still artwork when animation is disabled', () => {
    const asset = resolveCharacterMediaAsset({
      characterId: 'seedling_scholar',
      stage: 1,
      state: 'idle',
      animated: false,
      manifest,
    })

    expect(asset?.imageSrc).toBe('/character-assets/seedling_scholar/stage-1/idle.webp')
    expect(asset?.posterSrc).toBe('/character-assets/seedling_scholar/stage-1/idle.webp')
    expect(asset?.videoSrc).toBeUndefined()
  })

  it('does not resolve static media when a poster is missing', () => {
    const asset = resolveCharacterMediaAsset({
      characterId: 'seedling_scholar',
      stage: 1,
      state: 'idle',
      animated: false,
      manifest: {
        seedling_scholar: {
          1: {
            idle: { video: true },
          },
        },
      },
    })

    expect(asset).toBeNull()
  })

  it('falls back to idle when a requested reaction is not registered', () => {
    const asset = resolveCharacterMediaAsset({
      characterId: 'seedling_scholar',
      stage: 1,
      state: 'celebrate',
      animated: true,
      manifest,
    })

    expect(asset?.state).toBe('idle')
    expect(asset?.videoSrc).toBe('/character-assets/seedling_scholar/stage-1/idle.webm')
  })

  it('returns null when a character stage has no registered assets', () => {
    const asset = resolveCharacterMediaAsset({
      characterId: 'library_sprite',
      stage: 1,
      state: 'idle',
      animated: true,
      manifest,
    })

    expect(asset).toBeNull()
  })

  it('normalizes invalid stage numbers to stage 1', () => {
    const asset = resolveCharacterMediaAsset({
      characterId: 'seedling_scholar',
      stage: 0,
      state: 'idle',
      animated: true,
      manifest,
    })

    expect(asset?.stage).toBe(1)
    expect(asset?.posterSrc).toBe('/character-assets/seedling_scholar/stage-1/idle.webp')
  })

  it('registers the first seedling scholar asset batch', () => {
    for (const stage of [1, 2, 3]) {
      for (const state of CHARACTER_ANIMATION_STATES) {
        expect(CHARACTER_ASSET_MANIFEST.seedling_scholar?.[stage]?.[state]).toEqual({
          poster: true,
          video: true,
        })
      }
    }
  })

  it('resolves evolved seedling scholar reactions without falling back to idle', () => {
    const asset = resolveCharacterMediaAsset({
      characterId: 'seedling_scholar',
      stage: 3,
      state: 'celebrate',
      animated: true,
    })

    expect(asset?.state).toBe('celebrate')
    expect(asset?.videoSrc).toBe('/character-assets/seedling_scholar/stage-3/celebrate.webm')
  })

  it('keeps registered public character assets on disk', () => {
    for (const [characterId, stages] of Object.entries(CHARACTER_ASSET_MANIFEST)) {
      for (const [stage, states] of Object.entries(stages ?? {})) {
        for (const [state, availability] of Object.entries(states ?? {})) {
          const basePath = path.join(
            process.cwd(),
            'public',
            'character-assets',
            characterId,
            `stage-${stage}`,
            state
          )

          if (availability.poster) {
            expect(fs.existsSync(`${basePath}.webp`), `${basePath}.webp`).toBe(true)
          }

          if (availability.video) {
            expect(fs.existsSync(`${basePath}.webm`), `${basePath}.webm`).toBe(true)
          }
        }
      }
    }
  })
})
