import { lazy, Suspense, useEffect, useState } from 'react'
import {
  type CharacterAnimationState,
  type CharacterAssetManifest,
  type CharacterModelAssetManifest,
  type CharacterModelMaterialQuality,
  type CharacterModelViewerSettings,
  CHARACTER_ASSET_MANIFEST,
  CHARACTER_MODEL_ASSET_MANIFEST,
  resolveCharacterMediaAsset,
  resolveCharacterModelAsset,
} from '../../lib/character-assets'
import type { CharacterDefinition, CharacterEvolutionStage } from '../../lib/characters'
import CharacterFallbackAvatar from './CharacterFallbackAvatar'

const CharacterModelAvatar = lazy(() => import('./CharacterModelAvatar'))

interface CharacterAvatarProps {
  character: CharacterDefinition
  stageDefinition?: CharacterEvolutionStage
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'display'
  animated?: boolean
  animationState?: CharacterAnimationState
  useModelThumbnail?: boolean
  disableProceduralAnimation?: boolean
  materialQuality?: CharacterModelMaterialQuality
  modelViewerSettings?: CharacterModelViewerSettings
  assetManifest?: CharacterAssetManifest
  modelAssetManifest?: CharacterModelAssetManifest
  onReactionEnd?: () => void
}

const sizeClasses = {
  sm: {
    frame: 'w-20 h-20',
  },
  md: {
    frame: 'w-32 h-32',
  },
  lg: {
    frame: 'w-44 h-44',
  },
  xl: {
    frame: 'w-72 h-72',
  },
  display: {
    frame: 'h-full w-full',
  },
} as const

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener?.('change', handleChange)

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

export default function CharacterAvatar({
  character,
  stageDefinition,
  size = 'md',
  animated = false,
  animationState = 'idle',
  useModelThumbnail = true,
  disableProceduralAnimation = false,
  materialQuality = 'standard',
  modelViewerSettings,
  assetManifest = CHARACTER_ASSET_MANIFEST,
  modelAssetManifest = CHARACTER_MODEL_ASSET_MANIFEST,
  onReactionEnd,
}: CharacterAvatarProps) {
  const classes = sizeClasses[size]
  const visual = stageDefinition ?? character.evolutionStages[0]
  const prefersReducedMotion = usePrefersReducedMotion()
  const [mediaFailed, setMediaFailed] = useState(false)
  const [modelFailed, setModelFailed] = useState(false)
  const allowAnimation = animated && !prefersReducedMotion
  const mediaAsset = resolveCharacterMediaAsset({
    characterId: character.id,
    stage: visual.stage,
    state: animationState,
    animated: allowAnimation,
    manifest: assetManifest,
  })
  const modelAsset = resolveCharacterModelAsset({
    characterId: character.id,
    stage: visual.stage,
    manifest: modelAssetManifest,
  })
  const hasEmbeddedModelAnimation = (modelAsset?.embeddedAnimationStates?.length ?? 0) > 0
  const disableModelProceduralAnimation = disableProceduralAnimation || hasEmbeddedModelAnimation
  const shouldUseModelThumbnail = useModelThumbnail && !!modelAsset?.thumbnailSrc && size !== 'display' && !modelFailed

  useEffect(() => {
    setMediaFailed(false)
    setModelFailed(false)
  }, [character.id, visual.stage, animationState, allowAnimation])

  if (mediaAsset?.videoSrc && !mediaFailed) {
    const isIdle = mediaAsset.state === 'idle'

    return (
      <div
        className={`${classes.frame} relative shrink-0 flex items-center justify-center`}
        data-character-material-quality={materialQuality}
      >
        <video
          className="h-full w-full object-contain"
          src={mediaAsset.videoSrc}
          poster={mediaAsset.posterSrc}
          autoPlay
          loop={isIdle}
          muted
          playsInline
          aria-hidden="true"
          onError={() => setMediaFailed(true)}
          onEnded={() => {
            if (!isIdle) onReactionEnd?.()
          }}
        />
      </div>
    )
  }

  if (mediaAsset?.imageSrc && !mediaFailed) {
    return (
      <div
        className={`${classes.frame} relative shrink-0 flex items-center justify-center`}
        data-character-material-quality={materialQuality}
      >
        <img
          className="h-full w-full object-contain"
          src={mediaAsset.imageSrc}
          alt=""
          role="presentation"
          loading="lazy"
          onError={() => setMediaFailed(true)}
        />
      </div>
    )
  }

  if (shouldUseModelThumbnail) {
    return (
      <div
        className={`${classes.frame} relative shrink-0 flex items-center justify-center`}
        data-character-avatar-model-thumbnail="true"
        data-character-material-quality={materialQuality}
      >
        <img
          className="h-full w-full object-contain"
          src={modelAsset.thumbnailSrc}
          alt=""
          role="presentation"
          loading="lazy"
          onError={() => setModelFailed(true)}
        />
      </div>
    )
  }

  if (modelAsset && !modelFailed) {
    return (
      <Suspense fallback={<CharacterFallbackAvatar character={character} stageDefinition={visual} size={size} />}>
        <CharacterModelAvatar
          asset={modelAsset}
          className={classes.frame}
          animated={allowAnimation}
          animationState={animationState}
          disableProceduralAnimation={disableModelProceduralAnimation}
          materialQuality={materialQuality}
          modelViewerSettings={modelViewerSettings}
          onError={() => setModelFailed(true)}
          onReactionEnd={onReactionEnd}
        />
      </Suspense>
    )
  }

  return <CharacterFallbackAvatar character={character} stageDefinition={visual} size={size} />
}
