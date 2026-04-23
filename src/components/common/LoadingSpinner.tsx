interface LoadingSpinnerProps {
  /** Optional label rendered below the spinner. */
  label?: string
  /** Tailwind text-size class for the icon. Default `text-4xl`. */
  size?: string
  /** Tailwind color class for the icon. Default `text-stone-300`. */
  color?: string
  /** Tailwind color/font classes for the label. Default `text-stone-400`. */
  labelClassName?: string
  /** Wrapper className override for layout customization. */
  className?: string
}

/**
 * Standard inline loading spinner — Material Symbols `progress_activity`
 * with optional label, used in admin panels and tables.
 */
export default function LoadingSpinner({
  label,
  size = 'text-4xl',
  color = 'text-stone-300',
  labelClassName = 'text-stone-400',
  className = 'flex flex-col items-center gap-2',
}: LoadingSpinnerProps) {
  return (
    <div className={className} role="status" aria-live="polite">
      <span className={`material-symbols-outlined ${size} ${color} animate-spin`}>progress_activity</span>
      {label && <p className={labelClassName}>{label}</p>}
    </div>
  )
}
