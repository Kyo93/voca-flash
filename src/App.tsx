import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import StudyPage from './pages/StudyPage'
import LibraryPage from './pages/LibraryPage'
import LoginPage from './pages/LoginPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminWordsPage from './pages/admin/WordsPage'
import AdminTopicsPage from './pages/admin/TopicsPage'
import AdminRoadmapsPage from './pages/admin/RoadmapsPage'
import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminUsersPage from './pages/admin/UsersPage'

// Protected route: requires authentication
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-primary font-bold animate-pulse">Đang tải...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Admin route: requires admin role
function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-primary font-bold animate-pulse">Đang tải...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// Placeholder admin pages (filled in Phase 4+)
function AdminComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-start">
      <h1 className="text-3xl font-black text-secondary mb-2">{title}</h1>
      <p className="text-on-surface-variant">Trang đang được phát triển...</p>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Auth required */}
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/study" element={<RequireAuth><StudyPage /></RequireAuth>} />
          <Route path="/library" element={<RequireAuth><LibraryPage /></RequireAuth>} />
          <Route path="/progress" element={<RequireAuth><div className="flex min-h-screen bg-surface"><p className="p-12 text-2xl font-bold">Progress — coming soon</p></div></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><div className="flex min-h-screen bg-surface"><p className="p-12 text-2xl font-bold">Settings — coming soon</p></div></RequireAuth>} />

          {/* Admin routes */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="words" element={<AdminWordsPage />} />
            <Route path="topics" element={<AdminTopicsPage />} />
            <Route path="roadmaps" element={<AdminRoadmapsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
