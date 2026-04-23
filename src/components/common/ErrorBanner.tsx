interface ErrorBannerProps {
  message: string | null | undefined
  className?: string
}

/**
 * Standard red-50 / red-200 inline error banner for forms and modals.
 * Renders nothing when message is empty/null.
 */
export default function ErrorBanner({ message, className = '' }: ErrorBannerProps) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={`p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600 font-medium ${className}`}
    >
      {message}
    </div>
  )
}
