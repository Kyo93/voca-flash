import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { fetchStreakFromSupabase, loadStreak } from '../lib/streak'
import { useAuth } from '../contexts/AuthContext'
import { useSidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../contexts/SidebarContext'
import type { StreakData } from '../lib/streak'

export default function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const { profile, activeRoadmapSlug, signOut, user } = useAuth()
  const { collapsed, toggleSidebar } = useSidebar()

  const [avatarError, setAvatarError] = useState(false)
  const [streakData, setStreakData] = useState<StreakData>(loadStreak())

  useEffect(() => {
    async function loadStreakData() {
      if (user) {
        const data = await fetchStreakFromSupabase(user.id)
        setStreakData(data)
      } else {
        setStreakData(loadStreak())
      }
    }
    loadStreakData()
  }, [user])
  
  useEffect(() => {
    setAvatarError(false)
  }, [profile?.avatar_url])

  const navItems = useMemo(() => [
    { path: '/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard' },
    { 
      path: activeRoadmapSlug ? `/library/${activeRoadmapSlug}` : '/library', 
      basePath: '/library',
      labelKey: 'nav.library', 
      icon: 'menu_book' 
    },
    { path: '/progress', labelKey: 'nav.progress', icon: 'bar_chart' },
    { path: '/mastery', labelKey: 'nav.mastery', icon: 'inventory_2' },
    { path: '/settings', labelKey: 'nav.settings', icon: 'settings' },
  ], [activeRoadmapSlug])

  const displayName = profile?.display_name ?? profile?.email?.split('@')[0] ?? 'User'
  const avatarChar = displayName[0].toUpperCase()
  const w = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 bg-stone-50 z-50 transition-all duration-300 ease-in-out overflow-hidden"
      style={{ width: w }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2 relative">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-container to-primary rounded-lg flex items-center justify-center text-white shadow-lg shrink-0">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-xl font-black text-primary leading-none whitespace-nowrap">VocabMaster</h1>
            <p className="text-[10px] text-stone-500 font-normal tracking-widest uppercase whitespace-nowrap">The Tactile Scholar</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith((item as any).basePath || item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? t(item.labelKey) : undefined}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-sm ${
                isActive
                  ? 'bg-white text-primary shadow-sm border border-stone-100'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <span className="material-symbols-outlined shrink-0">{item.icon}</span>
              {!collapsed && <span className="whitespace-nowrap overflow-hidden">{t(item.labelKey)}</span>}
            </Link>
          )
        })}

        {/* Admin link */}
        <Link
          to="/admin"
          title={collapsed ? 'Quản trị' : undefined}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-sm ${
            location.pathname.startsWith('/admin')
              ? 'bg-white text-primary shadow-sm border border-stone-100'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
          } ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <span className="material-symbols-outlined shrink-0">admin_panel_settings</span>
          {!collapsed && <span className="whitespace-nowrap overflow-hidden">Quản trị</span>}
        </Link>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3">
        {/* Collapse Toggle Button - PLACED AT BOTTOM */}
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-400 hover:text-primary hover:bg-stone-100 transition-all cursor-pointer ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
        >
          <span className="material-symbols-outlined text-lg transition-transform duration-300 shrink-0" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}>
            menu_open
          </span>
          {!collapsed && <span className="text-xs font-medium whitespace-nowrap">Thu nhỏ</span>}
        </button>

        {/* Quick Study CTA */}
        <Link
          to="/study"
          title={collapsed ? t('nav.startQuiz') : undefined}
          className={`w-full py-4 primary-gradient text-white font-black text-sm rounded-2xl shadow-lg shadow-primary-container/20 active:scale-95 transition-all flex items-center justify-center gap-2 ${collapsed ? 'px-0' : ''}`}
        >
          <span className="material-symbols-outlined text-sm shrink-0">bolt</span>
          {!collapsed && <span className="whitespace-nowrap">{t('nav.startQuiz')}</span>}
        </Link>

        {/* User Profile Card */}
        <div className={`flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-stone-100 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 relative group">
            {profile?.avatar_url && !avatarError ? (
              <img 
                src={profile.avatar_url} 
                alt={displayName} 
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-sm font-black text-primary">{avatarChar}</span>
            )}
          </div>
          {!collapsed && (
            <>
              <div className="overflow-hidden flex-1">
                <p className="text-[13px] font-bold truncate">{displayName}</p>
                <p className="text-[10px] text-stone-400 font-normal uppercase truncate">
                  {profile?.streak_days ? `${streakData.currentStreak} 🔥 ngày` : 'Học viên'}
                </p>
              </div>
              <button
                onClick={signOut}
                title="Đăng xuất"
                className="material-symbols-outlined text-stone-300 text-lg hover:text-red-400 transition-colors cursor-pointer"
              >
                logout
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
