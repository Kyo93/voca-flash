import { useSearchParams } from 'react-router-dom'

interface StudyCompleteProps {
  total: number
}

/**
 * StudyComplete - The completion screen shown after finishing a study session.
 * Standardizes buttons and progress summary.
 */
export default function StudyComplete({ total }: StudyCompleteProps) {
  const [searchParams] = useSearchParams()

  // Preserve current topic/roadmap context
  const currentQuery = searchParams.toString()
  const studyLink = currentQuery ? `/study?${currentQuery}` : '/study'

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="w-32 h-32 rounded-full bg-secondary-container flex items-center justify-center mb-8 shadow-xl animate-in zoom-in duration-500">
        <span className="material-symbols-outlined text-6xl text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
      </div>
      
      <h2 className="text-4xl font-black text-on-surface mb-4 tracking-tight">Hoàn thành!</h2>
      <p className="text-xl text-on-surface-variant mb-2">Bạn đã ôn tập {total} từ vựng</p>
      <p className="text-on-surface-variant mb-10 font-normal">Hãy quay lại sau để tiếp tục hành trình!</p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
        <a 
          href="/dashboard" 
          className="flex-1 px-8 py-4 bg-surface-container-highest text-on-surface font-bold rounded-xl shadow-md hover:bg-surface-container-high active:scale-95 transition-all text-center"
        >
          Về Dashboard
        </a>
        <a 
          href={studyLink} 
          className="flex-1 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-center"
        >
          Học thêm
        </a>
      </div>
    </div>
  )
}
