import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'
import Header from './Header'
import { useTranslation } from 'react-i18next'
import { useState, Suspense } from 'react'
import PageLoader from './PageLoader'
import { useSidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, RIGHTBAR_WIDTH, RIGHTBAR_COLLAPSED_WIDTH } from '../contexts/SidebarContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import MobileAppLayout from './mobile/MobileAppLayout'

export default function AppLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const { collapsed, rightCollapsed } = useSidebar()
  const isMobileShell = useMediaQuery('(max-width: 767px)')

  const sidebarW = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH
  const rightbarW = rightCollapsed ? RIGHTBAR_COLLAPSED_WIDTH : RIGHTBAR_WIDTH

  // Determine title based on path
  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return t('nav.dashboard')
    if (location.pathname === '/library') return t('nav.library')
    if (location.pathname.startsWith('/library/')) return 'Roadmap Explorer'
    if (location.pathname.startsWith('/progress')) return t('nav.progress')
    if (location.pathname.startsWith('/achievements')) return t('nav.achievements')
    if (location.pathname.startsWith('/characters')) return t('nav.characters')
    if (location.pathname.startsWith('/settings')) return t('nav.settings')
    if (location.pathname.startsWith('/admin')) return t('common.admin')
    if (location.pathname.startsWith('/mastery')) return t('nav.mastery')
    return 'VocaFlash'
  }

  if (isMobileShell) {
    return <MobileAppLayout />
  }

  return (
    <div 
      className="min-h-screen bg-surface transition-all duration-300" 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: `${sidebarW}px 1fr ${rightbarW}px`, 
        gridTemplateAreas: '"sidebar main rightbar"' 
      }}
    >
      {/* Left sidebar */}
      <aside style={{ gridArea: 'sidebar', position: 'sticky', top: 0, height: '100vh', zIndex: 50, width: sidebarW }} className="transition-all duration-300">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div style={{ gridArea: 'main', display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Header 
          title={getPageTitle()} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet context={{ searchQuery, setSearchQuery }} />
          </Suspense>
        </main>
      </div>

      {/* Right sidebar area - Global */}
      <div style={{ gridArea: 'rightbar', height: '100vh', position: 'sticky', top: 0 }}>
        <RightSidebar />
      </div>
    </div>
  )
}
