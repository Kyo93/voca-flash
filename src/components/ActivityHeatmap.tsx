import { useMemo } from 'react'

interface HeatmapProps {
  streakDays: number
}

export default function ActivityHeatmap({ streakDays }: HeatmapProps) {
  // Generate mock data for the last 15 weeks (105 days) for a denser look
  const days = useMemo(() => {
    const totalDays = 105 
    return Array.from({ length: totalDays }, (_, i) => {
      const isStreakDay = i >= totalDays - streakDays
      const isRandomActive = Math.random() > 0.65 && i < totalDays - streakDays
      
      const level = isStreakDay ? 3 : (isRandomActive ? Math.floor(Math.random() * 3) : 0)
      return { level }
    })
  }, [streakDays])

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-400 text-lg">grid_view</span>
          <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">Tần suất học tập</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-stone-300 font-black uppercase tracking-widest">Ít</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-[4px] bg-stone-50 border border-stone-100"></div>
            <div className="w-3 h-3 rounded-[4px] bg-orange-100/50"></div>
            <div className="w-3 h-3 rounded-[4px] bg-orange-300/70"></div>
            <div className="w-3 h-3 rounded-[4px] bg-primary shadow-sm shadow-primary/20"></div>
          </div>
          <span className="text-[10px] text-stone-300 font-black uppercase tracking-widest">Nhiều</span>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 h-36">
        {days.map((day, i) => (
          <div
            key={i}
            className={`w-full h-full rounded-[4px] transition-all duration-700 cursor-help ${
              day.level === 0 ? 'bg-stone-50 border border-stone-100/50' :
              day.level === 1 ? 'bg-orange-100/40' :
              day.level === 2 ? 'bg-orange-300/60' :
              'bg-primary shadow-[0_0_12px_rgba(211,84,0,0.25)] scale-105 z-10'
            }`}
            title={`Cường độ: ${day.level}`}
          ></div>
        ))}
      </div>
      
      <div className="mt-6 flex items-center justify-between">
         <p className="text-[10px] text-stone-400 font-bold italic opacity-60">
           * Ghi nhận dựa trên chuỗi {streakDays} ngày liên tục.
         </p>
         <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
               <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Duy trì</span>
            </div>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
               <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Đỉnh cao</span>
            </div>
         </div>
      </div>
    </div>
  )
}
