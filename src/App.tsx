import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AppLayout from './components/AppLayout'
import AdminLayout from './components/admin/AdminLayout'
import { lazy } from 'react'
import DashboardPage from './pages/DashboardPage' // Sync because it's the primary authenticated route
const StudyPage = lazy(() => import('./pages/StudyPage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ReviewPage = lazy(() => import('./pages/ReviewPage'))
const AdminWordsPage = lazy(() => import('./pages/admin/WordsPage'))
const AdminRoadmapsPage = lazy(() => import('./pages/admin/RoadmapsPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/UsersPage'))
const RoadmapSetupPage = lazy(() => import('./pages/admin/RoadmapSetupPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const MethodologyPage = lazy(() => import('./pages/MethodologyPage'))
const MasteryPage = lazy(() => import('./pages/MasteryPage'))
const FreeStudyPage = lazy(() => import('./pages/FreeStudyPage'))
const RoadmapTopicsPage = lazy(() => import('./pages/RoadmapTopicsPage'))

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
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/mastery" element={<MasteryPage />} />
            {/* C1: StudyPage moved inside AppLayout — reuse Sidebar + RightSidebar */}
            <Route path="/study" element={<StudyPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/free-study" element={<FreeStudyPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="words" element={<AdminWordsPage />} />
            <Route path="roadmaps" element={<AdminRoadmapsPage />} />
            <Route path="roadmaps/:roadmapId/setup" element={<RoadmapSetupPage />} />
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
