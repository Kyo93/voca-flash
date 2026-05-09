import type {
  CharacterAnimationState,
  CharacterModelAsset,
  CharacterModelMaterialQuality,
  CharacterModelViewerSettings,
} from '../../lib/character-assets'
import { useCharacterModelScene } from './useCharacterModelScene'

interface CharacterModelAvatarProps {
  asset: CharacterModelAsset
  className: string
  animated: boolean
  animationState: CharacterAnimationState
  disableProceduralAnimation?: boolean
  materialQuality?: CharacterModelMaterialQuality
  modelViewerSettings?: CharacterModelViewerSettings
  thumbnailSrc?: string
  onError: () => void
  onReactionEnd?: () => void
}

export default function CharacterModelAvatar({
  asset,
  className,
  animated,
  animationState,
  disableProceduralAnimation = false,
  materialQuality = 'standard',
  modelViewerSettings,
  thumbnailSrc,
  onError,
  onReactionEnd,
}: CharacterModelAvatarProps) {
  const { containerRef, isModelReady } = useCharacterModelScene({
    animated,
    animationState,
    asset,
    disableProceduralAnimation,
    materialQuality,
    modelViewerSettings,
    onError,
    onReactionEnd,
  })

  return (
    <div
      ref={containerRef}
      className={`${className} relative shrink-0 flex items-center justify-center`}
      data-character-avatar-model="true"
      data-character-material-quality={materialQuality}
    >
      {thumbnailSrc && !isModelReady && (
        <img
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain"
          src={thumbnailSrc}
          alt=""
          role="presentation"
          loading="eager"
          data-character-model-loading-thumbnail="true"
        />
      )}
      {materialQuality === 'pbr' && (
        <div
          className="pointer-events-none absolute inset-x-[18%] bottom-[7%] z-0 h-[14%] rounded-full bg-black/35 blur-3xl"
          data-character-ground-shadow="true"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
