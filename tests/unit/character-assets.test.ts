import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CHARACTER_ANIMATION_STATES,
  CHARACTER_ASSET_MANIFEST,
  CHARACTER_MODEL_ASSET_MANIFEST,
  type CharacterAssetManifest,
  type CharacterModelAssetManifest,
  resolveCharacterMediaAsset,
  resolveCharacterModelAsset,
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

const modelManifest: CharacterModelAssetManifest = {
  arcane_brawler: {
    1: { model: true, thumbnail: true },
    2: { model: true, diffuseTexture: true, thumbnail: true },
  },
  falling_leaf_tree: {
    1: { glbModel: true, thumbnail: true },
  },
  playful_dog: {
    1: { glbModel: true, thumbnail: true, embeddedAnimationStates: CHARACTER_ANIMATION_STATES },
  },
  rampaging_t_rex: {
    1: { glbModel: true, thumbnail: true, embeddedAnimationStates: CHARACTER_ANIMATION_STATES },
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

  it('does not register media manifests for removed characters', () => {
    expect(CHARACTER_ASSET_MANIFEST.flashcard_fighter).toBeUndefined()
    expect(CHARACTER_ASSET_MANIFEST.lexical_invoker).toBeUndefined()
    expect(CHARACTER_ASSET_MANIFEST.quiz_alchemist).toBeUndefined()
  })

  it('resolves OBJ source paths for model-backed characters', () => {
    const asset = resolveCharacterModelAsset({
      characterId: 'arcane_brawler',
      stage: 2,
      manifest: modelManifest,
    })

    expect(asset).toEqual({
      characterId: 'arcane_brawler',
      stage: 2,
      modelSrc: '/character-assets/arcane_brawler/source/base.obj',
      thumbnailSrc: '/character-assets/arcane_brawler/source/thumbnail.png',
      diffuseTextureSrc: '/character-assets/arcane_brawler/source/texture_diffuse.png',
    })
  })

  it('can resolve an OBJ-backed character with only base.obj registered', () => {
    const asset = resolveCharacterModelAsset({
      characterId: 'arcane_brawler',
      stage: 1,
      manifest: modelManifest,
    })

    expect(asset?.modelSrc).toBe('/character-assets/arcane_brawler/source/base.obj')
    expect(asset?.thumbnailSrc).toBe('/character-assets/arcane_brawler/source/thumbnail.png')
    expect(asset?.diffuseTextureSrc).toBeUndefined()
  })

  it('resolves GLB source paths for model-backed characters', () => {
    const asset = resolveCharacterModelAsset({
      characterId: 'falling_leaf_tree',
      stage: 1,
      manifest: modelManifest,
    })

    expect(asset).toEqual({
      characterId: 'falling_leaf_tree',
      stage: 1,
      modelSrc: '/character-assets/falling_leaf_tree/source/base.glb',
      thumbnailSrc: '/character-assets/falling_leaf_tree/source/thumbnail.png',
    })
  })

  it('resolves Rampaging T-Rex as a GLB source path', () => {
    const asset = resolveCharacterModelAsset({
      characterId: 'rampaging_t_rex',
      stage: 1,
      manifest: modelManifest,
    })

    expect(asset).toEqual({
      characterId: 'rampaging_t_rex',
      stage: 1,
      modelSrc: '/character-assets/rampaging_t_rex/source/base.glb',
      thumbnailSrc: '/character-assets/rampaging_t_rex/source/thumbnail.png',
      embeddedAnimationStates: CHARACTER_ANIMATION_STATES,
    })
  })

  it('resolves Playful Dog as a GLB source path', () => {
    const asset = resolveCharacterModelAsset({
      characterId: 'playful_dog',
      stage: 1,
      manifest: modelManifest,
    })

    expect(asset).toEqual({
      characterId: 'playful_dog',
      stage: 1,
      modelSrc: '/character-assets/playful_dog/source/base.glb',
      thumbnailSrc: '/character-assets/playful_dog/source/thumbnail.png',
      embeddedAnimationStates: CHARACTER_ANIMATION_STATES,
    })
  })

  it('registers arcane brawler as a copy-only OBJ character source', () => {
    for (const stage of [1, 2, 3, 4]) {
      expect(CHARACTER_MODEL_ASSET_MANIFEST.arcane_brawler?.[stage]).toEqual({
        model: true,
        thumbnail: true,
        diffuseTexture: true,
        normalTexture: true,
        roughnessTexture: true,
        metallicTexture: true,
        pbrTexture: true,
      })
    }
  })

  it('registers sunlit scholar as a copy-only OBJ character source with PBR textures', () => {
    for (const stage of [1, 2, 3, 4]) {
      expect(CHARACTER_MODEL_ASSET_MANIFEST.sunlit_scholar?.[stage]).toEqual({
        model: true,
        thumbnail: true,
        diffuseTexture: true,
        normalTexture: true,
        roughnessTexture: true,
        metallicTexture: true,
        pbrTexture: true,
      })
    }

    expect(resolveCharacterModelAsset({ characterId: 'sunlit_scholar', stage: 3 })).toEqual({
      characterId: 'sunlit_scholar',
      stage: 3,
      modelSrc: '/character-assets/sunlit_scholar/source/base.obj',
      thumbnailSrc: '/character-assets/sunlit_scholar/source/thumbnail.png',
      diffuseTextureSrc: '/character-assets/sunlit_scholar/source/texture_diffuse.png',
      normalTextureSrc: '/character-assets/sunlit_scholar/source/texture_normal.png',
      roughnessTextureSrc: '/character-assets/sunlit_scholar/source/texture_roughness.png',
      metallicTextureSrc: '/character-assets/sunlit_scholar/source/texture_metallic.png',
      pbrTextureSrc: '/character-assets/sunlit_scholar/source/texture_pbr.png',
    })
  })

  it('registers falling leaf tree as a copy-only GLB character source', () => {
    for (const stage of [1, 2, 3, 4]) {
      expect(CHARACTER_MODEL_ASSET_MANIFEST.falling_leaf_tree?.[stage]).toEqual({
        glbModel: true,
        thumbnail: true,
      })
    }

    expect(resolveCharacterModelAsset({ characterId: 'falling_leaf_tree', stage: 4 })).toEqual({
      characterId: 'falling_leaf_tree',
      stage: 4,
      modelSrc: '/character-assets/falling_leaf_tree/source/base.glb',
      thumbnailSrc: '/character-assets/falling_leaf_tree/source/thumbnail.png',
    })
  })

  it('registers rampaging T-Rex as a copy-only GLB character source', () => {
    for (const stage of [1, 2, 3, 4]) {
      expect(CHARACTER_MODEL_ASSET_MANIFEST.rampaging_t_rex?.[stage]).toEqual({
        glbModel: true,
        thumbnail: true,
        embeddedAnimationStates: CHARACTER_ANIMATION_STATES,
      })
    }

    expect(resolveCharacterModelAsset({ characterId: 'rampaging_t_rex', stage: 4 })).toEqual({
      characterId: 'rampaging_t_rex',
      stage: 4,
      modelSrc: '/character-assets/rampaging_t_rex/source/base.glb',
      thumbnailSrc: '/character-assets/rampaging_t_rex/source/thumbnail.png',
      embeddedAnimationStates: CHARACTER_ANIMATION_STATES,
    })
  })

  it('registers playful dog as a copy-only GLB character source', () => {
    for (const stage of [1, 2, 3, 4]) {
      expect(CHARACTER_MODEL_ASSET_MANIFEST.playful_dog?.[stage]).toEqual({
        glbModel: true,
        thumbnail: true,
        embeddedAnimationStates: CHARACTER_ANIMATION_STATES,
      })
    }

    expect(resolveCharacterModelAsset({ characterId: 'playful_dog', stage: 4 })).toEqual({
      characterId: 'playful_dog',
      stage: 4,
      modelSrc: '/character-assets/playful_dog/source/base.glb',
      thumbnailSrc: '/character-assets/playful_dog/source/thumbnail.png',
      embeddedAnimationStates: CHARACTER_ANIMATION_STATES,
    })
  })

  it('keeps the arcane brawler OBJ source on disk', () => {
    const sourceRoot = path.join(process.cwd(), 'public', 'character-assets', 'arcane_brawler', 'source')

    expect(fs.existsSync(path.join(sourceRoot, 'base.obj'))).toBe(true)
  })

  it('keeps the sunlit scholar OBJ source and textures on disk', () => {
    const sourceRoot = path.join(process.cwd(), 'public', 'character-assets', 'sunlit_scholar', 'source')

    for (const fileName of [
      'base.obj',
      'shaded.png',
      'texture_diffuse.png',
      'texture_metallic.png',
      'texture_normal.png',
      'texture_pbr.png',
      'texture_roughness.png',
    ]) {
      expect(fs.existsSync(path.join(sourceRoot, fileName)), fileName).toBe(true)
    }
  })

  it('keeps the falling leaf tree GLB source on disk', () => {
    const sourceRoot = path.join(process.cwd(), 'public', 'character-assets', 'falling_leaf_tree', 'source')

    expect(fs.existsSync(path.join(sourceRoot, 'base.glb'))).toBe(true)
  })

  it('keeps the rampaging T-Rex GLB source on disk', () => {
    const sourceRoot = path.join(process.cwd(), 'public', 'character-assets', 'rampaging_t_rex', 'source')

    expect(fs.existsSync(path.join(sourceRoot, 'base.glb'))).toBe(true)
  })

  it('keeps the playful dog GLB source on disk', () => {
    const sourceRoot = path.join(process.cwd(), 'public', 'character-assets', 'playful_dog', 'source')

    expect(fs.existsSync(path.join(sourceRoot, 'base.glb'))).toBe(true)
  })

  it('keeps registered model thumbnails on disk', () => {
    for (const [characterId, stages] of Object.entries(CHARACTER_MODEL_ASSET_MANIFEST)) {
      const hasThumbnail = Object.values(stages ?? {}).some(stageAsset => stageAsset?.thumbnail)
      if (!hasThumbnail) continue

      const thumbnailPath = path.join(
        process.cwd(),
        'public',
        'character-assets',
        characterId,
        'source',
        'thumbnail.png',
      )

      expect(fs.existsSync(thumbnailPath), thumbnailPath).toBe(true)
    }
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
