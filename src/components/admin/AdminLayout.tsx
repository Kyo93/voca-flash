import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { useSidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../contexts/SidebarContext'

export default function AdminLayout() {
  const { collapsed } = useSidebar()
  const sidebarW = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <div className="min-h-screen bg-surface flex">
      <AdminSidebar />
      <main className="flex-grow p-8 transition-all duration-300" style={{ marginLeft: sidebarW }}>
        <Outlet />
      </main>
    </div>
  )
}
