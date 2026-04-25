import { useEffect, useState } from 'react'
import {
  type CharacterAnimationState,
  type CharacterAssetManifest,
  CHARACTER_ASSET_MANIFEST,
  resolveCharacterMediaAsset,
} from '../../lib/character-assets'
import type { CharacterDefinition, CharacterEvolutionStage } from '../../lib/characters'
import CharacterFallbackAvatar from './CharacterFallbackAvatar'

interface CharacterAvatarProps {
  character: CharacterDefinition
  stageDefinition?: CharacterEvolutionStage
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  animationState?: CharacterAnimationState
  assetManifest?: CharacterAssetManifest
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
  assetManifest = CHARACTER_ASSET_MANIFEST,
  onReactionEnd,
}: CharacterAvatarProps) {
  const classes = sizeClasses[size]
  const visual = stageDefinition ?? character.evolutionStages[0]
  const prefersReducedMotion = usePrefersReducedMotion()
  const [mediaFailed, setMediaFailed] = useState(false)
  const allowAnimation = animated && !prefersReducedMotion
  const mediaAsset = resolveCharacterMediaAsset({
    characterId: character.id,
    stage: visual.stage,
    state: animationState,
    animated: allowAnimation,
    manifest: assetManifest,
  })

  useEffect(() => {
    setMediaFailed(false)
  }, [character.id, visual.stage, animationState, allowAnimation])

  if (!mediaAsset || mediaFailed) {
    return <CharacterFallbackAvatar character={character} stageDefinition={visual} size={size} />
  }

  if (mediaAsset.videoSrc) {
    const isIdle = mediaAsset.state === 'idle'

    return (
      <div className={`${classes.frame} relative shrink-0 flex items-center justify-center`}>
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

  return (
    <div className={`${classes.frame} relative shrink-0 flex items-center justify-center`}>
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
