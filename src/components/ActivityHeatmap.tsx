import { useMemo } from 'react'

interface HeatmapProps {
  streakDays: number
}

export default function ActivityHeatmap({ streakDays }: HeatmapProps) {
  // Generate mock data for the last 8 weeks (56 days)
  // In a real app, this would come from a study_logs table
  const days = useMemo(() => {
    const totalDays = 56
    const data = Array.from({ length: totalDays }, (_, i) => {
      // Logic: The most recent 'streakDays' are active
      const isStreakDay = i >= totalDays - streakDays
      // Randomly populate some older days to look "lived in"
      const isRandomActive = Math.random() > 0.7 && i < totalDays - streakDays
      
      const level = isStreakDay ? 3 : (isRandomActive ? Math.floor(Math.random() * 2) + 1 : 0)
      
      return { level }
    })
    return data
  }, [streakDays])

  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-secondary tracking-tight">TẦN SUẤT HỌC TẬP</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider">Ít hơn</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-[3px] bg-stone-100"></div>
            <div className="w-2.5 h-2.5 rounded-[3px] bg-primary/20"></div>
            <div className="w-2.5 h-2.5 rounded-[3px] bg-primary/50"></div>
            <div className="w-2.5 h-2.5 rounded-[3px] bg-primary"></div>
          </div>
          <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider">Nhiều hơn</span>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 h-32">
        {days.map((day, i) => (
          <div
            key={i}
            className={`w-full h-full rounded-sm transition-colors duration-500 ${
              day.level === 0 ? 'bg-stone-50' :
              day.level === 1 ? 'bg-primary/20' :
              day.level === 2 ? 'bg-primary/50' :
              'bg-primary shadow-[0_0_8px_rgba(211,84,0,0.3)]'
            }`}
            title={`Level ${day.level}`}
          ></div>
        ))}
      </div>
      
      <p className="mt-4 text-[11px] text-stone-400 font-medium italic">
        * Dữ liệu mô phỏng dựa trên chuỗi học tập {streakDays} ngày của bạn.
      </p>
    </div>
  )
}
