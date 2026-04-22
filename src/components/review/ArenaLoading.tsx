import { useTranslation } from 'react-i18next'

interface ArenaLoadingProps {
  message?: string
  colorClass?: string
}

export default function ArenaLoading({ message, colorClass = 'primary' }: ArenaLoadingProps) {
  const { t } = useTranslation()
  const displayMessage = message || t('arena.preparing')

  return (
    <div className="min-h-screen bg-arena-bg flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Subtle Loading Blobs */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-${colorClass} rounded-full blur-[100px] animate-pulse`} />
      </div>
      <div className="text-center animate-pulse relative z-10">
        <div className={`w-16 h-16 rounded-full border-4 border-${colorClass}/20 border-t-${colorClass} animate-spin mb-8 mx-auto`} />
        <p className={`text-${colorClass}/40 font-black tracking-[0.3em] uppercase text-[10px]`}>{displayMessage}</p>
      </div>
    </div>
  )
}
