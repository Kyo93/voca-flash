import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  CHARACTER_MODEL_LIGHT_PRESETS,
  DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS,
  type CharacterAnimationState,
  type CharacterModelViewerSettings,
  normalizeCharacterModelViewerSettings,
  resolveCharacterModelAsset,
} from '../../lib/character-assets'
import type { CharacterDefinition, CharacterEvolutionStage } from '../../lib/characters'
import CharacterAvatar from './CharacterAvatar'

interface CharacterExpandedViewerProps {
  character: CharacterDefinition
  stageDefinition: CharacterEvolutionStage
  onClose: () => void
}

export default function CharacterExpandedViewer({
  character,
  stageDefinition,
  onClose,
}: CharacterExpandedViewerProps) {
  const { t } = useTranslation()
  const [modelViewerSettings, setModelViewerSettings] = useState<CharacterModelViewerSettings>(
    DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS,
  )
  const [animationState, setAnimationState] = useState<CharacterAnimationState>('idle')
  const modelAsset = resolveCharacterModelAsset({
    characterId: character.id,
    stage: stageDefinition.stage,
  })
  const hasModelViewerControls = !!modelAsset
  const modelAnimationStates = modelAsset?.embeddedAnimationStates ?? []
  const hasAnimationControls = modelAnimationStates.length > 1
  const roundedExposure = Number(modelViewerSettings.exposure.toFixed(2))

  useEffect(() => {
    setModelViewerSettings(DEFAULT_CHARACTER_MODEL_VIEWER_SETTINGS)
    setAnimationState('idle')
  }, [character.id, stageDefinition.stage])

  const setExposure = (value: string) => {
    setModelViewerSettings(current => normalizeCharacterModelViewerSettings({
      ...current,
      exposure: Number(value),
    }))
  }

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-on-surface/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={t('characters.actions.expandedView')}
      data-character-expanded-view="true"
      data-character-viewer-exposure={hasModelViewerControls ? roundedExposure : undefined}
      data-character-viewer-light={hasModelViewerControls ? modelViewerSettings.lightPreset : undefined}
      data-character-viewer-animation={hasAnimationControls ? animationState : undefined}
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="absolute inset-x-6 top-6 z-[1005] flex items-center justify-between gap-4 text-surface"
        aria-hidden="true"
      >
        <div>
          <p className="label-lg uppercase tracking-[0.28em] text-surface/70">
            {t(character.nameKey)}
          </p>
          <p className="title-lg text-surface">
            {t(stageDefinition.nameKey)}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="absolute right-6 top-6 z-[1010] flex h-12 w-12 items-center justify-center rounded-full bg-surface/10 text-surface ring-1 ring-surface/20 backdrop-blur-md transition-colors hover:bg-surface/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        aria-label={t('characters.actions.closeExpandedView')}
        title={t('characters.actions.closeExpandedView')}
        onClick={onClose}
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      <div
        className="relative z-0 flex h-full w-full items-center justify-center"
        data-character-expanded-stage="true"
      >
        <CharacterAvatar
          character={character}
          stageDefinition={stageDefinition}
          size="display"
          animated
          animationState={animationState}
          disableProceduralAnimation={hasAnimationControls}
          materialQuality="pbr"
          modelViewerSettings={modelViewerSettings}
        />
      </div>

      {hasModelViewerControls && (
        <div
          className="absolute inset-x-4 bottom-4 z-[1005] rounded-xl bg-surface/10 p-4 text-surface ring-1 ring-surface/20 backdrop-blur-md sm:left-6 sm:right-auto sm:w-80"
          data-character-viewer-controls="true"
          onMouseDown={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          onClick={event => event.stopPropagation()}
        >
          {hasAnimationControls && (
            <div
              className="mb-4"
              data-character-viewer-animation-controls="true"
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-surface/80">
                <span className="material-symbols-outlined text-base">motion_photos_on</span>
                {t('characters.viewer.animation.label')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {modelAnimationStates.map(state => (
                  <button
                    key={state}
                    type="button"
                    className={`h-9 rounded-full px-3 text-xs font-black transition-colors ${
                      animationState === state
                        ? 'bg-surface text-on-surface'
                        : 'bg-surface/10 text-surface/80 ring-1 ring-surface/15 hover:bg-surface/15'
                    }`}
                    aria-pressed={animationState === state}
                    onClick={() => setAnimationState(state)}
                  >
                    {t(`characters.viewer.animation.${state}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-surface/80">
              <span className="material-symbols-outlined text-base">tune</span>
              {t('characters.viewer.lightPreset.label')}
            </span>
            <div className="flex rounded-full bg-surface/10 p-1 ring-1 ring-surface/15">
              {CHARACTER_MODEL_LIGHT_PRESETS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  className={`h-8 rounded-full px-3 text-xs font-black transition-colors ${
                    modelViewerSettings.lightPreset === preset
                      ? 'bg-surface text-on-surface'
                      : 'text-surface/80 hover:bg-surface/10'
                  }`}
                  aria-pressed={modelViewerSettings.lightPreset === preset}
                  onClick={() => {
                    setModelViewerSettings(current => normalizeCharacterModelViewerSettings({
                      ...current,
                      lightPreset: preset,
                    }))
                  }}
                >
                  {t(`characters.viewer.lightPreset.${preset}`)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-widest text-surface/80">
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-base">wb_sunny</span>
              {t('characters.viewer.exposure')}
            </span>
            <span>{Math.round(roundedExposure * 100)}%</span>
          </label>
          <input
            type="range"
            min="0.45"
            max="1.25"
            step="0.01"
            value={roundedExposure}
            aria-label={t('characters.viewer.exposure')}
            onInput={event => setExposure(event.currentTarget.value)}
            onChange={event => setExposure(event.currentTarget.value)}
            className="mt-3 h-2 w-full accent-primary"
          />
        </div>
      )}
    </div>,
    document.body,
  )
}
