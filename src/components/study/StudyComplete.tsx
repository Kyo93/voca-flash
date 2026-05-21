import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface StudyCompleteProps {
  total: number
}

/**
 * StudyComplete - The completion screen shown after finishing a study session.
 * Standardizes buttons and progress summary.
 */
export default function StudyComplete({ total }: StudyCompleteProps) {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  // Preserve current topic/roadmap context
  const currentQuery = searchParams.toString()
  const studyLink = currentQuery ? `/study?${currentQuery}` : '/study'

  return (
    <div data-mobile-study-complete className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-6 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container shadow-xl animate-in zoom-in duration-500 sm:mb-8 sm:h-32 sm:w-32">
        <span className="material-symbols-outlined text-4xl text-on-secondary-container sm:text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
      </div>
      
      <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-on-surface sm:mb-4 sm:text-4xl sm:font-black">{t('studyComplete.title')}</h2>
      <p className="mb-2 text-base text-on-surface-variant sm:text-xl">{t('studyComplete.reviewedCount', { count: total })}</p>
      <p className="mb-6 font-normal text-on-surface-variant sm:mb-10">{t('studyComplete.comeBackLater')}</p>
      
      <div className="flex w-full max-w-sm flex-col justify-center gap-3 sm:flex-row sm:gap-4">
        <Link
          to="/dashboard"
          className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-surface-container-highest px-6 py-3 text-center font-bold text-on-surface shadow-md transition-all hover:bg-surface-container-high active:scale-95 sm:px-8 sm:py-4"
        >
          {t('studyComplete.dashboard')}
        </Link>
        <Link
          to={studyLink}
          className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-primary px-6 py-3 text-center font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 sm:px-8 sm:py-4"
        >
          {t('studyComplete.learnMore')}
        </Link>
      </div>
    </div>
  )
}
