import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const QUOTES = [
  "Hành trình vạn dặm bắt đầu từ một bước chân.",
  "Học một ngoại ngữ là có thêm một cửa sổ để nhìn ra thế giới.",
  "Sự kiên trì là chìa khóa của thành công.",
  "Mỗi ngày một chút, kiến thức sẽ đong đầy.",
  "Đừng dừng lại cho đến khi bạn tự hào về bản thân.",
  "Kỹ năng ngôn ngữ là bản đồ của một nền văn hóa.",
  "Học tập là kho báu sẽ đi theo chủ nhân của nó khắp mọi nơi."
]

interface WelcomeReminderProps {
  userName?: string | null
  onDismiss: () => void
}

export default function WelcomeReminder({ userName, onDismiss }: WelcomeReminderProps) {
  const [quote, setQuote] = useState("")

  useEffect(() => {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    setQuote(randomQuote)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-50 to-orange-100 p-1 border-2 border-white shadow-2xl mb-8 group animate-fade-in">
      <div className="bg-white/40 backdrop-blur-md rounded-[1.9rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-200/50">
            <span className="material-symbols-outlined text-sm font-variation-fill">sparkles</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Daily Motivation</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-secondary tracking-tight leading-tight">
            Sẵn sàng bứt phá hôm nay chưa, <span className="text-primary">{userName || 'Scholar'}</span>?
          </h2>
          
          <p className="text-lg text-stone-600 font-medium italic opacity-80 leading-relaxed max-w-xl">
            "{quote}"
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
          <Link
            to="/study"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
          >
            Bắt đầu học ngay
            <span className="material-symbols-outlined">bolt</span>
          </Link>
          
          <button
            onClick={onDismiss}
            className="px-6 py-4 text-stone-400 font-bold hover:text-stone-600 transition-colors w-full sm:w-auto"
          >
            Để sau
          </button>
        </div>

        {/* Decorative background elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Aesthetic glass border effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  )
}
