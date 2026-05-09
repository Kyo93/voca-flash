import { useTranslation } from 'react-i18next'
import { classes, type NotebookDensity, type NotebookViewStyle } from './notebook-utils'

export interface NotebookStyleOption {
  value: NotebookViewStyle
  icon: string
}

interface NotebookControlRailProps {
  styleOptions: NotebookStyleOption[]
  densityOptions: NotebookDensity[]
  viewStyle: NotebookViewStyle
  density: NotebookDensity
  showImages: boolean
  onStyleChange: (next: NotebookViewStyle) => void
  onDensityChange: (next: NotebookDensity) => void
  onShowImagesChange: (next: boolean) => void
}

export function NotebookControlRail({
  styleOptions,
  densityOptions,
  viewStyle,
  density,
  showImages,
  onStyleChange,
  onDensityChange,
  onShowImagesChange,
}: NotebookControlRailProps) {
  const { t } = useTranslation()

  return (
    <aside
      data-testid="notebook-control-rail"
      role="toolbar"
      aria-orientation="vertical"
      aria-label={t('mastery.notebook.title')}
      className="sticky top-4 flex w-24 shrink-0 flex-col gap-3 rounded-3xl bg-surface-container-lowest/80 p-2 shadow-[0_18px_60px_rgba(40,30,20,0.11)] backdrop-blur-xl sm:w-32"
    >
      <div className="flex flex-col gap-1">
        {styleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={t(`mastery.notebook.styles.${option.value}`)}
            aria-pressed={viewStyle === option.value}
            onClick={() => onStyleChange(option.value)}
            className={classes(
              'flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center text-[10px] font-black uppercase leading-tight transition-all',
              viewStyle === option.value
                ? 'bg-surface-container-lowest text-primary sun-drenched-shadow'
                : 'text-on-surface-variant/60 hover:bg-surface-container-low hover:text-on-surface',
            )}
          >
            <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
            <span>{t(`mastery.notebook.styles.${option.value}`)}</span>
          </button>
        ))}
      </div>

      <div className="h-px bg-outline-variant/20" />

      <div className="flex flex-col gap-1">
        {densityOptions.map((option) => (
          <button
            key={option}
            type="button"
            aria-label={t(`mastery.notebook.density.${option}`)}
            aria-pressed={density === option}
            onClick={() => onDensityChange(option)}
            className={classes(
              'min-h-10 rounded-2xl px-2 py-2 text-[10px] font-black uppercase leading-tight transition-all',
              density === option
                ? 'bg-surface-container-lowest text-secondary sun-drenched-shadow'
                : 'text-on-surface-variant/60 hover:bg-surface-container-low hover:text-on-surface',
            )}
          >
            {t(`mastery.notebook.density.${option}`)}
          </button>
        ))}
      </div>

      <div className="h-px bg-outline-variant/20" />

      <button
        type="button"
        aria-label={t('mastery.notebook.showImages')}
        aria-pressed={showImages}
        onClick={() => onShowImagesChange(!showImages)}
        className={classes(
          'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center text-[10px] font-black uppercase leading-tight transition-all',
          showImages
            ? 'bg-secondary text-on-secondary'
            : 'bg-surface-container text-on-surface-variant/60 hover:text-on-surface',
        )}
      >
        <span className="material-symbols-outlined text-[20px]">
          {showImages ? 'image' : 'image_not_supported'}
        </span>
        <span>{showImages ? t('mastery.notebook.imagesOn') : t('mastery.notebook.imagesOff')}</span>
      </button>
    </aside>
  )
}
