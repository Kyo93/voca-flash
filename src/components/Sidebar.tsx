import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { getStreakDisplay } from '../lib/streak'

interface NavItem {
  path: string
  labelKey: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard' },
  { path: '/library', labelKey: 'nav.library', icon: 'menu_book' },
  { path: '/progress', labelKey: 'nav.progress', icon: 'bar_chart' },
  { path: '/settings', labelKey: 'nav.settings', icon: 'settings' },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const streak = getStreakDisplay()

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 bg-stone-50 w-64 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-container to-primary rounded-lg flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined-filled text-xl">auto_stories</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-primary leading-none">VocabMaster</h1>
          <p className="text-[10px] text-stone-500 font-medium tracking-widest uppercase">The Tactile Scholar</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                isActive
                  ? 'bg-white text-primary shadow-sm border border-stone-100'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Quick Study CTA */}
      <div className="mt-auto p-4 bg-secondary-container rounded-xl">
        <p className="text-on-secondary-container text-xs font-bold mb-2">Sẵn sàng tăng trưởng?</p>
        <Link
          to="/study"
          className="w-full bg-primary-container text-on-primary text-xs font-bold py-3 rounded-lg shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">bolt</span>
          {t('nav.startQuiz')}
        </Link>
      </div>

      {/* Streak + User */}
      <div className="flex items-center gap-2 p-2 bg-white rounded-xl shadow-sm border border-stone-100">
        <div className="flex items-center gap-1 text-primary font-black px-2 py-1 rounded-lg">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="text-sm">{streak.currentStreak}</span>
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-[11px] font-black truncate">Alex scholar</p>
          <p className="text-[9px] text-stone-400 font-bold uppercase truncate">Scholar Lvl 1</p>
        </div>
      </div>
    </aside>
  )
}
