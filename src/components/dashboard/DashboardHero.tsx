import { Link } from 'react-router-dom'
import type { UserProfile } from '../../lib/types'

interface DashboardHeroProps {
  profile: UserProfile | null | undefined
  currentQuote: string
  showBanner: boolean
  setShowBanner: (show: boolean) => void
  t: (key: string) => string
  growth: {
    icon: string
    label: string
  }
}

export default function DashboardHero({
  profile,
  currentQuote,
  showBanner,
  setShowBanner,
  t,
  growth
}: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-4xl bg-linear-[135deg] from-primary to-[#8B4513] px-10 py-10 mb-10 flex items-center shadow-2xl group">
      <div className="relative z-10 max-w-2xl animate-fade-in">
        <h3 className="text-4xl md:text-5xl font-black text-white mb-6 editorial-asymmetry leading-tight">
          {t('home.readyToday')}, <span className="text-secondary-container">{profile?.display_name || 'Scholar'}</span>?
        </h3>
        
        <div className="pl-4 border-l-2 border-amber-200/50 mb-6 transform transition-all group-hover:translate-x-1 duration-500">
          <p className="text-lg text-white/80 font-medium italic leading-relaxed">
            "{currentQuote || '...'}"
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/study"
            className="flex items-center gap-2 px-8 py-3 bg-white text-primary font-black rounded-xl hover:bg-stone-50 transition-all shadow-lg active:scale-95 group/btn text-sm"
          >
            {t('home.continueChallenge')}
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">bolt</span>
          </Link>
          
          {showBanner && (
            <button 
              onClick={() => {
                setShowBanner(false)
                sessionStorage.setItem('welcome_banner_dismissed', 'true')
              }}
              className="text-white/40 font-bold hover:text-white transition-colors text-xs"
            >
              {t('common.later')}
            </button>
          )}
        </div>
      </div>
      
      {/* Visual Decor - Zen Wave & Seed (Idea 3) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none group">
        {/* Waves */}
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none" viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
          <path className="animate-[wave_8s_ease-in-out_infinite]" fill="white" d="M400,0 L400,320 L200,320 C300,200 100,100 200,0 L400,0 Z" />
          <path className="animate-[wave_12s_ease-in-out_infinite] opacity-50" fill="white" d="M400,40 L400,280 L250,280 C320,180 180,100 250,40 L400,40 Z" />
        </svg>

        {/* Seed/Plant Icon */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center animate-fade-in">
          <div className="relative">
            <span className="material-symbols-outlined text-[120px] text-white opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700">
              {growth.icon}
            </span>
            {/* Subtle Glow */}
            <div className="absolute inset-0 bg-amber-200/20 blur-3xl rounded-full scale-150 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
          
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            {growth.label}
          </span>
        </div>
      </div>
    </div>
  )
}
