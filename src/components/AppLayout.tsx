import { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'



export default function AppLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')

  // Determine title based on path
  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return t('nav.dashboard')
    if (location.pathname === '/library') return t('nav.library')
    if (location.pathname.startsWith('/library/')) return 'Roadmap Explorer'
    if (location.pathname.startsWith('/progress')) return t('nav.progress')
    if (location.pathname.startsWith('/settings')) return t('nav.settings')
    if (location.pathname.startsWith('/admin')) return 'Quản trị'
    return 'VocabMaster'
  }

  // Dashboard usually has the right sidebar
  const hasRightSidebar = location.pathname === '/dashboard'

  return (
    <div 
      className="min-h-screen bg-surface" 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: `256px 1fr ${hasRightSidebar ? '280px' : '0px'}`, 
        gridTemplateAreas: '"sidebar main rightbar"' 
      }}
    >
      {/* Left sidebar */}
      <aside style={{ gridArea: 'sidebar', position: 'sticky', top: 0, height: '100vh', zIndex: 50, width: 256 }}>
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
          <Outlet context={{ searchQuery, setSearchQuery }} />
        </main>
      </div>

      {/* Right sidebar area (only if needed) */}
      {hasRightSidebar && (
        <aside 
          id="right-sidebar-container"
          style={{ 
            gridArea: 'rightbar', 
            position: 'sticky', 
            top: 0, 
            height: '100vh', 
            overflowY: 'auto', 
            backgroundColor: 'white', 
            borderLeft: '1px solid #f5f5f4', 
            zIndex: 40 
          }}
        >
          {/* Content will be injected via slot or handled in DashboardPage for now */}
        </aside>
      )}
    </div>
  )
}
