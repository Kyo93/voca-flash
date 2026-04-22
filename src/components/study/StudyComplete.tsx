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
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="w-32 h-32 rounded-full bg-secondary-container flex items-center justify-center mb-8 shadow-xl animate-in zoom-in duration-500">
        <span className="material-symbols-outlined text-6xl text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
      </div>
      
      <h2 className="text-4xl font-black text-on-surface mb-4 tracking-tight">{t('studyComplete.title')}</h2>
      <p className="text-xl text-on-surface-variant mb-2">{t('studyComplete.reviewedCount', { count: total })}</p>
      <p className="text-on-surface-variant mb-10 font-normal">{t('studyComplete.comeBackLater')}</p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
        <Link
          to="/dashboard"
          className="flex-1 px-8 py-4 bg-surface-container-highest text-on-surface font-bold rounded-xl shadow-md hover:bg-surface-container-high active:scale-95 transition-all text-center"
        >
          {t('studyComplete.dashboard')}
        </Link>
        <Link
          to={studyLink}
          className="flex-1 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-center"
        >
          {t('studyComplete.learnMore')}
        </Link>
      </div>
    </div>
  )
}
