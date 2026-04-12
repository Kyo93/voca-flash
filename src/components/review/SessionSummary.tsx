import { Link } from 'react-router-dom'

interface SessionSummaryProps {
  stats: {
    correct: number
    wrong: number
    points: number
  }
  onRestart: () => void
}

export default function SessionSummary({ stats, onRestart }: SessionSummaryProps) {
  const total = stats.correct + stats.wrong
  const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-xl">
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-[2rem] bg-primary/20 text-primary flex items-center justify-center mb-8 mx-auto shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">
            <span className="material-symbols-outlined text-5xl">military_tech</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Hoàn thành buổi ôn tập!</h1>
          <p className="text-on-surface-variant font-bold">Bạn đã nỗ lực rất tuyệt vời.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
            <span className="block text-primary text-4xl font-black mb-1">{stats.points}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Điểm thưởng (XP)</span>
          </div>
          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
            <span className="block text-white text-4xl font-black mb-1">{accuracy}%</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Độ chính xác</span>
          </div>
          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center col-span-2 flex justify-between items-center px-12">
             <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-white font-black text-2xl">{stats.correct}</span>
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Đúng</span>
             </div>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <span className="text-white/40 font-black text-2xl">{stats.wrong}</span>
                <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Sai</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={onRestart}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            Tiếp tục ôn tập batch mới
          </button>
          <Link 
            to="/dashboard"
            className="w-full py-4 bg-white/5 text-white font-black rounded-2xl border border-white/5 hover:bg-white/10 text-center transition-all"
          >
            Về Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
