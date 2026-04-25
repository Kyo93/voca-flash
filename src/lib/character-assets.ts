export const CHARACTER_ANIMATION_STATES = ['idle', 'correct', 'wrong', 'celebrate', 'evolve'] as const

export type CharacterAnimationState = typeof CHARACTER_ANIMATION_STATES[number]

export interface CharacterAssetAvailability {
  poster?: boolean
  video?: boolean
}

export type CharacterStageAssetManifest = Partial<Record<CharacterAnimationState, CharacterAssetAvailability>>

export type CharacterAssetManifest = Partial<Record<string, Partial<Record<number, CharacterStageAssetManifest>>>>

export interface CharacterMediaAsset {
  characterId: string
  stage: number
  state: CharacterAnimationState
  imageSrc?: string
  posterSrc?: string
  videoSrc?: string
}

export interface ResolveCharacterMediaAssetOptions {
  characterId: string
  stage: number | null | undefined
  state?: CharacterAnimationState
  animated?: boolean
  manifest?: CharacterAssetManifest
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

function normalizeStage(stage: number | null | undefined): number {
  return Math.max(1, Math.floor(stage ?? 1))
}

function hasAsset(asset: CharacterAssetAvailability | undefined): asset is CharacterAssetAvailability {
  return !!asset && (asset.poster === true || asset.video === true)
}

function assetBasePath(characterId: string, stage: number, state: CharacterAnimationState): string {
  return `/character-assets/${characterId}/stage-${stage}/${state}`
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
