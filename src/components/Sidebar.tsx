import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../contexts/SidebarContext'
import { useStreak } from '../hooks/useStreak'

export default function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const { profile, activeRoadmapSlug, signOut } = useAuth()
  const { collapsed, toggleSidebar } = useSidebar()

  const [avatarError, setAvatarError] = useState(false)
  const streakData = useStreak()

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
    { path: '/characters', labelKey: 'nav.characters', icon: 'deployed_code' },
    { path: '/mastery', labelKey: 'nav.mastery', icon: 'inventory_2' },
    { path: '/settings', labelKey: 'nav.settings', icon: 'settings' },
  ], [activeRoadmapSlug])

  const displayName = profile?.display_name ?? profile?.email?.split('@')[0] ?? 'User'
  const avatarChar = displayName[0].toUpperCase()
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 bg-stone-50 z-50 transition-all duration-300 ease-in-out overflow-hidden"
      style={{ width: sidebarWidth }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2 relative">
        <div className="w-10 h-10 bg-linear-to-br from-primary-container to-primary rounded-lg flex items-center justify-center text-white shadow-lg shrink-0">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-xl font-black text-primary leading-none whitespace-nowrap">{t('app.name')}</p>
            <p className="text-[10px] text-stone-500 font-normal tracking-widest uppercase whitespace-nowrap">{t('sidebar.tagline')}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const matchPath = ('basePath' in item ? (item as { basePath: string }).basePath : null) ?? item.path
          const isActive = location.pathname.startsWith(matchPath)
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? t(item.labelKey) : undefined}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-sm ${isActive
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
          title={collapsed ? t('common.admin') : undefined}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-sm ${location.pathname.startsWith('/admin')
              ? 'bg-white text-primary shadow-sm border border-stone-100'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <span className="material-symbols-outlined shrink-0">admin_panel_settings</span>
          {!collapsed && <span className="whitespace-nowrap overflow-hidden">{t('common.admin')}</span>}
        </Link>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3">
        {/* Collapse Toggle Button - PLACED AT BOTTOM */}
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-400 hover:text-primary hover:bg-stone-100 transition-all cursor-pointer ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          <span className="material-symbols-outlined text-lg transition-transform duration-300 shrink-0" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}>
            menu_open
          </span>
          {!collapsed && <span className="text-xs font-medium whitespace-nowrap">{t('sidebar.collapse')}</span>}
        </button>

        {/* Quick Study CTA */}
        <Link
          to="/review"
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
                  {profile?.streak_days ? t('sidebar.streakDay', { count: streakData.currentStreak }) : t('sidebar.student')}
                </p>
              </div>
              <button
                onClick={signOut}
                title={t('sidebar.signout')}
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
