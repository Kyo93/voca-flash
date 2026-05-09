import { useEffect, useRef, useState, type RefObject } from 'react'
import type {
  CharacterAnimationState,
  CharacterModelAsset,
  CharacterModelMaterialQuality,
  CharacterModelViewerSettings,
} from '../../lib/character-assets'
import {
  DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS,
  normalizeCharacterModelViewerSettings,
} from '../../lib/character-assets'

const reactionDurations: Record<CharacterAnimationState, number> = {
  idle: 0,
  correct: 2400,
  wrong: 2200,
  celebrate: 3200,
  evolve: 3600,
}

interface UseCharacterModelSceneArgs {
  asset: CharacterModelAsset
  animated: boolean
  animationState: CharacterAnimationState
  disableProceduralAnimation: boolean
  materialQuality: CharacterModelMaterialQuality
  modelViewerSettings?: CharacterModelViewerSettings
  onError: () => void
  onReactionEnd?: () => void
}

interface CharacterModelSceneState {
  containerRef: RefObject<HTMLDivElement | null>
  isModelReady: boolean
}

export function useCharacterModelScene({
  asset,
  animated,
  animationState,
  disableProceduralAnimation,
  materialQuality,
  modelViewerSettings,
  onError,
  onReactionEnd,
}: UseCharacterModelSceneArgs): CharacterModelSceneState {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animationStateRef = useRef<CharacterAnimationState>(animationState)
  const modelViewerSettingsRef = useRef<CharacterModelViewerSettings>(DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS)
  const userInteractingRef = useRef(false)
  const onErrorRef = useRef(onError)
  const [isModelReady, setIsModelReady] = useState(false)

  useEffect(() => {
    animationStateRef.current = animationState
  }, [animationState])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    modelViewerSettingsRef.current = normalizeCharacterModelViewerSettings(modelViewerSettings)
  }, [modelViewerSettings?.exposure, modelViewerSettings?.lightPreset])

  useEffect(() => {
    if (!animated || disableProceduralAnimation || animationState === 'idle') return

    const timeoutId = window.setTimeout(() => {
      onReactionEnd?.()
    }, reactionDurations[animationState])

    return () => window.clearTimeout(timeoutId)
  }, [animated, animationState, disableProceduralAnimation, onReactionEnd])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      onErrorRef.current()
      return
    }

    setIsModelReady(false)
    let disposed = false
    let cleanup: (() => void) | undefined

    import('./character-model-scene-runner').then(({ startCharacterModelScene }) => {
      if (disposed) return

      cleanup = startCharacterModelScene({
        animated,
        animationStateRef,
        asset,
        container,
        disableProceduralAnimation,
        materialQuality,
        modelViewerSettingsRef,
        onErrorRef,
        setIsModelReady,
        userInteractingRef,
      })
    }).catch(() => {
      if (!disposed) onErrorRef.current()
    })

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [
    animated,
    asset.diffuseTextureSrc,
    asset.metallicTextureSrc,
    asset.modelSrc,
    asset.normalTextureSrc,
    asset.roughnessTextureSrc,
    asset.stage,
    disableProceduralAnimation,
    materialQuality,
  ])

  return { containerRef, isModelReady }
}
