import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { speak } from '../../lib/tts'

interface AudioButtonProps {
  text: string
  slow?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'tactile' | 'ghost' | 'minimal'
}

/**
 * AudioButton - A shared component for text-to-speech interaction.
 * Follows the "Tactile Scholar" design system.
 */
export default function AudioButton({ 
  text, 
  slow, 
  className = '', 
  size = 'md',
  variant = 'tactile'
}: AudioButtonProps) {
  const { t } = useTranslation()
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    speak(text, slow)
    setSpeaking(true)
    // Visual feedback duration matches average word length
    setTimeout(() => setSpeaking(false), 1500)
  }

  const sizeClasses = {
    sm: 'p-1.5 text-lg',
    md: 'p-2.5 text-xl',
    lg: 'p-3.5 text-2xl'
  }

  const variantClasses = {
    tactile: 'tactile-btn bg-surface-container-high hover:bg-surface-container-highest text-primary border border-outline-variant/10',
    ghost: 'hover:bg-surface-container text-secondary transition-colors',
    minimal: 'text-outline hover:text-primary transition-colors p-0 shadow-none border-none'
  }

  const iconSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <button
      onClick={handleSpeak}
      className={`
        flex items-center justify-center rounded-lg transition-all active:scale-95 group
        ${variantClasses[variant]}
        ${variant !== 'minimal' ? sizeClasses[size] : ''}
        ${className}
      `}
      title={slow ? t('flashcard.audioSlow') : t('flashcard.audioNormal')}
      aria-label={`${slow ? t('flashcard.audioSlow') : t('flashcard.audioNormal')}: ${text}`}
    >
      {slow ? (
        <span className={`text-[11px] font-semibold leading-none tracking-tight ${speaking ? 'animate-pulse scale-110 text-secondary' : ''}`}>
          {t('flashcard.audioSlowRate')}
        </span>
      ) : (
        <span className={`
          material-symbols-outlined 
          ${iconSize[size]}
          ${speaking ? 'animate-pulse scale-110 text-secondary' : ''}
        `}>
          volume_up
        </span>
      )}
    </button>
  )
}
