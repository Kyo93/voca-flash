import { useTranslation } from 'react-i18next'
import { ADMIN_FALLBACK_IMAGE } from '../../lib/constants'

interface ImageUrlFieldProps {
  /** Current URL value (controlled). */
  value: string
  /** Called with the new URL on change. */
  onChange: (next: string) => void
  /** Visible label above the input. */
  label?: string
  /** Placeholder shown when empty. */
  placeholder?: string
  /** Tailwind classes for the <input>. Has a sensible default. */
  inputClassName?: string
  /** Tailwind classes for the <label>. Has a sensible default. */
  labelClassName?: string
  /**
   * Aspect ratio class for the preview frame. Default `aspect-video`.
   * Pass e.g. `aspect-4/3` to match WordFormModal-style preview.
   */
  previewAspect?: string
  /**
   * Tailwind classes for the preview wrapper.
   * Defaults to a thin stone border with rounded-xl.
   */
  previewWrapperClassName?: string
  /** Element rendered when `value` is empty (e.g. dashed empty state). Optional. */
  emptyState?: React.ReactNode
  /** Image URL used when the user-supplied URL fails to load. */
  fallbackImage?: string
}

const DEFAULT_FALLBACK = ADMIN_FALLBACK_IMAGE

/**
 * Reusable image URL input + live preview with onError fallback.
 * Used by Topic and Roadmap admin form modals.
 *
 * NOTE: WordFormModal has a focal-point variant that renders extra controls
 * inside the preview block — that one keeps its own JSX for clarity.
 */
export default function ImageUrlField({
  value,
  onChange,
  label,
  placeholder = 'https://...',
  inputClassName = 'w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all',
  labelClassName = 'block text-sm font-bold text-secondary mb-2',
  previewAspect = 'aspect-video',
  previewWrapperClassName = 'mt-3 w-full overflow-hidden rounded-xl border-2 border-stone-200 bg-stone-50',
  emptyState,
  fallbackImage = DEFAULT_FALLBACK,
}: ImageUrlFieldProps) {
  const { t } = useTranslation()
  const fieldLabel = label ?? t('common.image')
  return (
    <div>
      <label className={labelClassName}>{fieldLabel}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
      {value ? (
        <div className={`${previewWrapperClassName} ${previewAspect}`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = fallbackImage
            }}
          />
        </div>
      ) : (
        emptyState ?? null
      )}
    </div>
  )
}
