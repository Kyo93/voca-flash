import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface flex">
      <AdminSidebar />
      <main className="ml-64 flex-grow p-8">
        <Outlet />
      </main>
    </div>
  )
}
