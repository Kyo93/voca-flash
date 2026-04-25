export const CHARACTER_ANIMATION_STATES = ['idle', 'correct', 'wrong', 'celebrate', 'evolve'] as const

export type CharacterAnimationState = typeof CHARACTER_ANIMATION_STATES[number]

export interface CharacterAssetAvailability {
  poster?: boolean
  video?: boolean
}

export type CharacterStageAssetManifest = Partial<Record<CharacterAnimationState, CharacterAssetAvailability>>

export type CharacterAssetManifest = Partial<Record<string, Partial<Record<number, CharacterStageAssetManifest>>>>

export interface CharacterModelAssetAvailability {
  model?: boolean
  glbModel?: boolean
  thumbnail?: boolean
  embeddedAnimationStates?: readonly CharacterAnimationState[]
  diffuseTexture?: boolean
  normalTexture?: boolean
  roughnessTexture?: boolean
  metallicTexture?: boolean
  pbrTexture?: boolean
}

export type CharacterModelAssetManifest = Partial<Record<string, Partial<Record<number, CharacterModelAssetAvailability>>>>

export interface CharacterMediaAsset {
  characterId: string
  stage: number
  state: CharacterAnimationState
  imageSrc?: string
  posterSrc?: string
  videoSrc?: string
}

export interface CharacterModelAsset {
  characterId: string
  stage: number
  modelSrc: string
  thumbnailSrc?: string
  embeddedAnimationStates?: readonly CharacterAnimationState[]
  diffuseTextureSrc?: string
  normalTextureSrc?: string
  roughnessTextureSrc?: string
  metallicTextureSrc?: string
  pbrTextureSrc?: string
}

export type CharacterModelMaterialQuality = 'standard' | 'pbr'

export const CHARACTER_MODEL_LIGHT_PRESETS = ['soft', 'studio', 'vivid'] as const

export type CharacterModelLightPreset = typeof CHARACTER_MODEL_LIGHT_PRESETS[number]

export interface CharacterModelViewerSettings {
  exposure: number
  lightPreset: CharacterModelLightPreset
}

export const DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS: CharacterModelViewerSettings = {
  exposure: 0.58,
  lightPreset: 'soft',
}

export interface ResolveCharacterMediaAssetOptions {
  characterId: string
  stage: number | null | undefined
  state?: CharacterAnimationState
  animated?: boolean
  manifest?: CharacterAssetManifest
}

export interface ResolveCharacterModelAssetOptions {
  characterId: string
  stage: number | null | undefined
  manifest?: CharacterModelAssetManifest
}

export function normalizeCharacterModelViewerSettings(
  settings: Partial<CharacterModelViewerSettings> | null | undefined,
): CharacterModelViewerSettings {
  const exposure = Math.min(
    1.25,
    Math.max(0.45, settings?.exposure ?? DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS.exposure),
  )
  const lightPreset = settings?.lightPreset && CHARACTER_MODEL_LIGHT_PRESETS.includes(settings.lightPreset)
    ? settings.lightPreset
    : DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS.lightPreset

  return { exposure, lightPreset }
}

export const CHARACTER_ASSET_MANIFEST: CharacterAssetManifest = {
  seedling_scholar: {
    1: {
      idle: { poster: true, video: true },
      correct: { poster: true, video: true },
      wrong: { poster: true, video: true },
      celebrate: { poster: true, video: true },
      evolve: { poster: true, video: true },
    },
    2: {
      idle: { poster: true, video: true },
      correct: { poster: true, video: true },
      wrong: { poster: true, video: true },
      celebrate: { poster: true, video: true },
      evolve: { poster: true, video: true },
    },
    3: {
      idle: { poster: true, video: true },
      correct: { poster: true, video: true },
      wrong: { poster: true, video: true },
      celebrate: { poster: true, video: true },
      evolve: { poster: true, video: true },
    },
  },
}

const animatedGlbModelAsset: CharacterModelAssetAvailability = {
  glbModel: true,
  thumbnail: true,
  embeddedAnimationStates: CHARACTER_ANIMATION_STATES,
}

export const CHARACTER_MODEL_ASSET_MANIFEST: CharacterModelAssetManifest = {
  arcane_brawler: {
    1: {
      model: true,
      thumbnail: true,
      diffuseTexture: true,
      normalTexture: true,
      roughnessTexture: true,
      metallicTexture: true,
      pbrTexture: true,
    },
    2: {
      model: true,
      thumbnail: true,
      diffuseTexture: true,
      normalTexture: true,
      roughnessTexture: true,
      metallicTexture: true,
      pbrTexture: true,
    },
    3: {
      model: true,
      thumbnail: true,
      diffuseTexture: true,
      normalTexture: true,
      roughnessTexture: true,
      metallicTexture: true,
      pbrTexture: true,
    },
    4: {
      model: true,
      thumbnail: true,
      diffuseTexture: true,
      normalTexture: true,
      roughnessTexture: true,
      metallicTexture: true,
      pbrTexture: true,
    },
  },
  sunlit_scholar: {
    1: {
      model: true,
      thumbnail: true,
      diffuseTexture: true,
      normalTexture: true,
      roughnessTexture: true,
      metallicTexture: true,
      pbrTexture: true,
    },
    2: {
      model: true,
      thumbnail: true,
      diffuseTexture: true,
      normalTexture: true,
      roughnessTexture: true,
      metallicTexture: true,
      pbrTexture: true,
    },
    3: {
      model: true,
      thumbnail: true,
      diffuseTexture: true,
      normalTexture: true,
      roughnessTexture: true,
      metallicTexture: true,
      pbrTexture: true,
    },
    4: {
      model: true,
      thumbnail: true,
      diffuseTexture: true,
      normalTexture: true,
      roughnessTexture: true,
      metallicTexture: true,
      pbrTexture: true,
    },
  },
  falling_leaf_tree: {
    1: {
      glbModel: true,
      thumbnail: true,
    },
    2: {
      glbModel: true,
      thumbnail: true,
    },
    3: {
      glbModel: true,
      thumbnail: true,
    },
    4: {
      glbModel: true,
      thumbnail: true,
    },
  },
  playful_dog: {
    1: animatedGlbModelAsset,
    2: animatedGlbModelAsset,
    3: animatedGlbModelAsset,
    4: animatedGlbModelAsset,
  },
  rampaging_t_rex: {
    1: animatedGlbModelAsset,
    2: animatedGlbModelAsset,
    3: animatedGlbModelAsset,
    4: animatedGlbModelAsset,
  },
}

function normalizeStage(stage: number | null | undefined): number {
  return Math.max(1, Math.floor(stage ?? 1))
}

function hasAsset(asset: CharacterAssetAvailability | undefined): asset is CharacterAssetAvailability {
  return !!asset && (asset.poster === true || asset.video === true)
}

function assetBasePath(characterId: string, stage: number, state: CharacterAnimationState): string {
  return `/character-assets/${characterId}/stage-${stage}/${state}`
}

function modelSourceBasePath(characterId: string): string {
  return `/character-assets/${characterId}/source`
}

export function resolveCharacterMediaAsset({
  characterId,
  stage,
  state = 'idle',
  animated = false,
  manifest = CHARACTER_ASSET_MANIFEST,
}: ResolveCharacterMediaAssetOptions): CharacterMediaAsset | null {
  const normalizedStage = normalizeStage(stage)
  const stageAssets = manifest[characterId]?.[normalizedStage]
  if (!stageAssets) return null

  const requestedAsset = stageAssets[state]
  const idleAsset = stageAssets.idle
  const resolvedState = hasAsset(requestedAsset)
    ? state
    : hasAsset(idleAsset)
      ? 'idle'
      : null

  if (!resolvedState) return null

  const resolvedAsset = stageAssets[resolvedState]
  if (!hasAsset(resolvedAsset)) return null

  const basePath = assetBasePath(characterId, normalizedStage, resolvedState)
  const posterSrc = resolvedAsset.poster ? `${basePath}.webp` : undefined
  const videoSrc = animated && resolvedAsset.video ? `${basePath}.webm` : undefined

  if (!posterSrc && !videoSrc) return null

  return {
    characterId,
    stage: normalizedStage,
    state: resolvedState,
    imageSrc: posterSrc,
    posterSrc,
    videoSrc,
  }
}

export function resolveCharacterModelAsset({
  characterId,
  stage,
  manifest = CHARACTER_MODEL_ASSET_MANIFEST,
}: ResolveCharacterModelAssetOptions): CharacterModelAsset | null {
  const normalizedStage = normalizeStage(stage)
  const stageAsset = manifest[characterId]?.[normalizedStage]
  if (!stageAsset?.model && !stageAsset?.glbModel) return null

  const basePath = modelSourceBasePath(characterId)
  const modelFileName = stageAsset.glbModel ? 'base.glb' : 'base.obj'

  return {
    characterId,
    stage: normalizedStage,
    modelSrc: `${basePath}/${modelFileName}`,
    thumbnailSrc: stageAsset.thumbnail ? `${basePath}/thumbnail.png` : undefined,
    embeddedAnimationStates: stageAsset.embeddedAnimationStates,
    diffuseTextureSrc: stageAsset.diffuseTexture ? `${basePath}/texture_diffuse.png` : undefined,
    normalTextureSrc: stageAsset.normalTexture ? `${basePath}/texture_normal.png` : undefined,
    roughnessTextureSrc: stageAsset.roughnessTexture ? `${basePath}/texture_roughness.png` : undefined,
    metallicTextureSrc: stageAsset.metallicTexture ? `${basePath}/texture_metallic.png` : undefined,
    pbrTextureSrc: stageAsset.pbrTexture ? `${basePath}/texture_pbr.png` : undefined,
  }
}
