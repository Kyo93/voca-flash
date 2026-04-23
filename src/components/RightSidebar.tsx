import { useTranslation } from 'react-i18next'
import { useSidebar, RIGHTBAR_WIDTH, RIGHTBAR_COLLAPSED_WIDTH } from '../contexts/SidebarContext'
import { useStreak } from '../hooks/useStreak'

const STREAK_WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const
const STREAK_DAY_HEIGHTS = [40, 60, 50, 70, 80, 0, 0] as const
const STREAK_TODAY_INDEX = 4

export default function RightSidebar() {
  const { t } = useTranslation()
  const { rightCollapsed, toggleRightSidebar } = useSidebar()

  const streak = useStreak()

  const sidebarWidth = rightCollapsed ? RIGHTBAR_COLLAPSED_WIDTH : RIGHTBAR_WIDTH

  return (
    <aside
      className="sticky top-0 h-screen bg-white border-l border-stone-100 flex flex-col transition-all duration-300 ease-in-out z-40"
      style={{ width: sidebarWidth }}
    >
      {/* Toggle Button at the top */}
      <div className="flex justify-start p-4">
        <button
          onClick={toggleRightSidebar}
          className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-primary hover:bg-stone-100 transition-all cursor-pointer"
          title={rightCollapsed ? t('sidebar.expandRight') : t('sidebar.collapseRight')}
        >
          <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: rightCollapsed ? 'rotate(180deg)' : 'none' }}>
            chevron_left
          </span>
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto ${rightCollapsed ? 'px-2' : 'px-6'} space-y-5 pb-8 custom-scrollbar`}>
        {/* Streak Widget */}
        <div className={`bg-stone-50 rounded-xl ${rightCollapsed ? 'p-3' : 'p-6'} text-center transition-all`}>
          <div className="relative inline-block mb-3">
            <div className={`${rightCollapsed ? 'w-10 h-10' : 'w-16 h-16'} rounded-full bg-white flex items-center justify-center shadow-md transition-all`}>
              <span className={`material-symbols-outlined ${rightCollapsed ? 'text-xl' : 'text-4xl'} text-primary`} style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
            </div>
            {!rightCollapsed && (
              <div className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-stone-50">
                {streak.currentStreak}
              </div>
            )}
          </div>

          {!rightCollapsed && (
            <>
              <p className="text-xl font-black text-on-surface">{streak.currentStreak} {t('progress.dayStreak')}</p>
              <p className="text-xs text-stone-400 mt-1 font-medium">{t('progress.topStreak')}</p>
              <div className="flex justify-between mt-5 px-1">
                {STREAK_WEEK_DAYS.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-black text-stone-300">{day}</span>
                    <div className={`w-2 rounded-full ${i === STREAK_TODAY_INDEX ? 'bg-primary' : 'bg-secondary/50'}`} style={{ height: `${STREAK_DAY_HEIGHTS[i]}%`, minHeight: '4px', maxHeight: '28px' }} />
                  </div>
                ))}
              </div>
            </>
          )}

          {rightCollapsed && (
            <div className="bg-secondary text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center mx-auto mt-2">
              {streak.currentStreak}
            </div>
          )}
        </div>

        {/* Reminders */}
        <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm ${rightCollapsed ? 'p-3' : 'p-5'} transition-all`}>
          {!rightCollapsed && <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-4">{t('rightSidebar.studyReminder')}</p>}
          <div className="space-y-3">
            <div className={`flex ${rightCollapsed ? 'justify-center' : 'gap-3'} items-start`}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0" title={rightCollapsed ? t('rightSidebar.learnWord') : undefined}>
                <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              </div>
              {!rightCollapsed && (
                <div>
                  <p className="text-xs font-black text-on-surface">{t('rightSidebar.learnWord')}</p>
                  <p className="text-[10px] text-stone-400 font-medium mt-0.5 whitespace-nowrap">{t('rightSidebar.learnWordDesc')}</p>
                </div>
              )}
            </div>
            <div className={`flex ${rightCollapsed ? 'justify-center' : 'gap-3'} items-start`}>
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0" title={rightCollapsed ? t('rightSidebar.dynamicReview') : undefined}>
                <span className="material-symbols-outlined text-base text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>replay</span>
              </div>
              {!rightCollapsed && (
                <div>
                  <p className="text-xs font-black text-on-surface">{t('rightSidebar.dynamicReview')}</p>
                  <p className="text-[10px] text-stone-400 font-medium mt-0.5 whitespace-nowrap">{t('rightSidebar.dynamicReviewDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule */}
        {!rightCollapsed ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-3">{t('rightSidebar.scheduleTitle')}</p>
            <p className="text-[11px] text-stone-500 leading-relaxed mb-4">{t('rightSidebar.scheduleDesc')}</p>
            <button className="w-full py-2.5 bg-primary/5 border border-primary/20 text-primary text-[11px] font-black rounded-xl hover:bg-primary hover:text-white transition-all">
              {t('rightSidebar.setReminder')}
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button title={t('rightSidebar.setReminder')} className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-primary transition-all">
              <span className="material-symbols-outlined">event</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
