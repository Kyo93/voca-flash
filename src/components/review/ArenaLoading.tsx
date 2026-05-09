import { useTranslation } from 'react-i18next'

const LOADING_VARIANTS = {
  primary: {
    blob: 'bg-primary',
    spinner: 'border-primary/20 border-t-primary',
    text: 'text-primary/40',
  },
  cyan: {
    blob: 'bg-cyan-500',
    spinner: 'border-cyan-500/20 border-t-cyan-500',
    text: 'text-cyan-500/40',
  },
} as const

interface ArenaLoadingProps {
  message?: string
  variant?: keyof typeof LOADING_VARIANTS
}

export default function ArenaLoading({ message, variant = 'primary' }: ArenaLoadingProps) {
  const { t } = useTranslation()
  const displayMessage = message || t('arena.preparing')
  const colors = LOADING_VARIANTS[variant]

  return (
    <div className="min-h-screen bg-arena-bg flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Subtle Loading Blobs */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${colors.blob} rounded-full blur-[100px] animate-pulse`} />
      </div>
      <div className="text-center animate-pulse relative z-10">
        <div className={`w-16 h-16 rounded-full border-4 ${colors.spinner} animate-spin mb-8 mx-auto`} />
        <p className={`${colors.text} font-black tracking-[0.3em] uppercase text-[10px]`}>{displayMessage}</p>
      </div>
    </div>
  )
}
