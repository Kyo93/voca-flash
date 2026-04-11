import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { fetchStreakFromSupabase, loadStreak } from '../lib/streak'
import type { StreakData } from '../lib/streak'

interface HeaderProps {
  title: string
  searchQuery?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
}

function StreakBadge({ streak }: { streak: StreakData }) {
  return (
    <div className="flex items-center gap-1.5 text-primary font-black px-3 py-1.5 bg-white rounded-xl shadow-sm border border-stone-100">
      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
      <span className="text-sm leading-none">{streak.currentStreak}</span>
    </div>
  )
}

export default function Header({ title, searchQuery, onSearchChange, searchPlaceholder }: HeaderProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [streak, setStreak] = useState<StreakData>(loadStreak())

  useEffect(() => {
    async function load() {
      if (user) {
        const data = await fetchStreakFromSupabase(user.id)
        setStreak(data)
      } else {
        setStreak(loadStreak())
      }
    }
    load()
  }, [user])

  return (
    <header className="h-20 px-10 flex items-center justify-between bg-surface/95 backdrop-blur-md sticky top-0 z-40 border-b border-stone-100 shadow-sm shrink-0">
      <h2 className="text-xl font-black text-on-surface shrink-0">{title}</h2>
      
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 text-xl">search</span>
          <input
            className="w-full pl-12 pr-4 py-2.5 bg-white border-none rounded-2xl text-sm shadow-sm placeholder:text-stone-300 focus:ring-2 focus:ring-secondary transition-all"
            placeholder={searchPlaceholder || t('nav.searchPlaceholder')}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-primary hover:bg-stone-100 transition-all">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          
          <StreakBadge streak={streak} />
          
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
            <span className="text-sm font-black text-primary leading-none">
              {(user?.email ?? 'A')[0].toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
