import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import StudyPage from './pages/StudyPage'
import LibraryPage from './pages/LibraryPage'
import RoadmapTopicsPage from './pages/RoadmapTopicsPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import AppLayout from './components/AppLayout'
import ReviewPage from './pages/ReviewPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminWordsPage from './pages/admin/WordsPage'
import AdminTopicsPage from './pages/admin/TopicsPage'
import AdminRoadmapsPage from './pages/admin/RoadmapsPage'
import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminUsersPage from './pages/admin/UsersPage'
import ProgressPage from './pages/ProgressPage'

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


function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Auth required — Standard App Layout */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/library/:roadmapSlug" element={<RoadmapTopicsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Special immersive routes */}
          <Route path="/study" element={<RequireAuth><StudyPage /></RequireAuth>} />
          <Route path="/review" element={<RequireAuth><ReviewPage /></RequireAuth>} />

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
      </SidebarProvider>
    </AuthProvider>
  )
}

export default App
