import { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface ChallengeTextInputProps {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  isWrong: boolean
  placeholder?: string
  /** Tailwind text-size class for the input. Default `text-3xl`. */
  textSize?: string
  /** Optional placeholder font class (e.g. `placeholder:font-mono`). */
  placeholderClassName?: string
}

/**
 * Shared input + "Press Enter to confirm" hint used by review challenges
 * (Ghost Recall, Context Gap). The shake animation is triggered by `isWrong`.
 */
const ChallengeTextInput = forwardRef<HTMLInputElement, ChallengeTextInputProps>(
  function ChallengeTextInput(
    { value, onChange, onSubmit, isWrong, placeholder, textSize = 'text-3xl', placeholderClassName = '' },
    ref,
  ) {
    const { t } = useTranslation()
    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder={placeholder}
          className={`w-full bg-surface-container-low rounded-2xl border-2 p-5 text-center ${textSize} font-black font-headline text-primary outline-none transition-all placeholder:text-primary/20 ${placeholderClassName} ${
            isWrong
              ? 'border-error bg-error/5 animate-[shake_0.4s_cubic-bezier(.36,.07,.19,.97)_both]'
              : 'border-outline-variant/20 focus:border-primary shadow-sm'
          }`}
          autoComplete="off"
          spellCheck={false}
        />
        <AnimatePresence>
          {value.length > 0 && !isWrong && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-10 left-0 right-0 text-center"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-outline bg-surface-container-high px-3 py-1 rounded-full">
                {t('arena.pressEnterToConfirm')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

export default ChallengeTextInput
