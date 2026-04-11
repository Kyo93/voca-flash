import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { getStreakDisplay } from '../lib/streak'
import { useAuth } from '../contexts/AuthContext'

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
  const { profile, signOut } = useAuth()

  const displayName = profile?.display_name ?? profile?.email?.split('@')[0] ?? 'User'
  const avatarChar = displayName[0].toUpperCase()

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 bg-stone-50 w-64 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-container to-primary rounded-lg flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
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
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${
                isActive
                  ? 'bg-white text-primary shadow-sm border border-stone-100'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </Link>
          )
        })}

        {/* Admin link — only shown if user is admin */}
        <Link
          to="/admin"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${
            location.pathname.startsWith('/admin')
              ? 'bg-white text-primary shadow-sm border border-stone-100'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
          }`}
        >
          <span className="material-symbols-outlined">admin_panel_settings</span>
          <span>Quản trị</span>
        </Link>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3">
        {/* Quick Study CTA */}
        <Link
          to="/study"
          className="w-full py-4 primary-gradient text-white font-black text-sm rounded-2xl shadow-lg shadow-primary-container/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">bolt</span>
          {t('nav.startQuiz')}
        </Link>

        {/* User Profile Card */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-stone-100">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-black text-primary">{avatarChar}</span>
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-[13px] font-black truncate">{displayName}</p>
            <p className="text-[10px] text-stone-400 font-bold uppercase truncate">
              {profile?.streak_days ? `${streak.currentStreak} 🔥 ngày` : 'Học viên'}
            </p>
          </div>
          <button
            onClick={signOut}
            title="Đăng xuất"
            className="material-symbols-outlined text-stone-300 text-lg hover:text-red-400 transition-colors cursor-pointer"
          >
            logout
          </button>
        </div>
      </div>
    </aside>
  )
}
