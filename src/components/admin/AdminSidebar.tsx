import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../contexts/SidebarContext'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { path: '/admin/words', label: 'Từ vựng', icon: 'spellcheck' },
  { path: '/admin/roadmaps', label: 'Lộ trình', icon: 'route' },
  { path: '/admin/users', label: 'Người dùng', icon: 'group' },
]

export default function AdminSidebar() {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const { collapsed, toggleSidebar } = useSidebar()
  const w = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  function isActive(item: typeof navItems[0]) {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 bg-stone-50 z-50 border-r border-stone-100 transition-all duration-300 ease-in-out overflow-hidden"
      style={{ width: w }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-2 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg flex items-center justify-center text-white shadow-lg shrink-0">
          <span className="material-symbols-outlined-filled text-xl">admin_panel_settings</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-xl font-black text-primary leading-none whitespace-nowrap">Admin Panel</h1>
            <p className="text-[10px] text-stone-500 font-medium tracking-widest uppercase whitespace-nowrap">VocaFlash CMS</p>
          </div>
        )}
      </div>

      {/* Admin Navigation */}
      <nav className="flex flex-col gap-1">
        {!collapsed && <p className="px-4 py-2 text-[10px] font-black text-stone-400 tracking-widest uppercase">Quản lý</p>}
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${
              isActive(item)
                ? 'bg-white text-primary shadow-sm border border-stone-100'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            } ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <span className="material-symbols-outlined shrink-0">{item.icon}</span>
            {!collapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-stone-100 my-2" />

      {/* Back to student app */}
      <Link
        to="/dashboard"
        title={collapsed ? 'Quay lại app' : undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-100 ${collapsed ? 'justify-center px-0' : ''}`}
      >
        <span className="material-symbols-outlined shrink-0">arrow_back</span>
        {!collapsed && <span className="whitespace-nowrap overflow-hidden">Quay lại app</span>}
      </Link>

      {/* Bottom: User */}
      <div className="mt-auto space-y-3">
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-stone-400 hover:text-primary hover:bg-stone-100 transition-all cursor-pointer ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
        >
          <span className="material-symbols-outlined text-lg transition-transform duration-300 shrink-0" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}>
            menu_open
          </span>
          {!collapsed && <span className="text-xs font-bold whitespace-nowrap">Thu nhỏ</span>}
        </button>

        {/* Admin Badge */}
        {!collapsed && (
          <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-wider">Quyền Admin</p>
            <p className="text-xs font-medium text-orange-500 truncate">
              {profile?.email ?? '...'}
            </p>
          </div>
        )}

        {/* User card */}
        <div className={`flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-stone-100 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-black text-primary">
              {(profile?.display_name ?? profile?.email ?? 'A')[0].toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="overflow-hidden flex-1">
                <p className="text-[13px] font-black truncate">
                  {profile?.display_name ?? 'Admin'}
                </p>
                <p className="text-[10px] text-stone-400 font-bold uppercase truncate">
                  {profile?.email ?? ''}
                </p>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
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
