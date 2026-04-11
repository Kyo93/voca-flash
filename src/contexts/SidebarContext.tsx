import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface SidebarContextType {
  collapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (val: boolean) => void
  rightCollapsed: boolean
  toggleRightSidebar: () => void
  setRightSidebarCollapsed: (val: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleSidebar: () => {},
  setSidebarCollapsed: () => {},
  rightCollapsed: false,
  toggleRightSidebar: () => {},
  setRightSidebarCollapsed: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const toggleSidebar = useCallback(() => setCollapsed((c) => !c), [])
  const setSidebarCollapsed = useCallback((val: boolean) => setCollapsed(val), [])
  
  const toggleRightSidebar = useCallback(() => setRightCollapsed((c) => !c), [])
  const setRightSidebarCollapsed = useCallback((val: boolean) => setRightCollapsed(val), [])

  return (
    <SidebarContext.Provider value={{ 
      collapsed, toggleSidebar, setSidebarCollapsed,
      rightCollapsed, toggleRightSidebar, setRightSidebarCollapsed
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}

// Constants
export const SIDEBAR_WIDTH = 256
export const SIDEBAR_COLLAPSED_WIDTH = 72
export const RIGHTBAR_WIDTH = 280
export const RIGHTBAR_COLLAPSED_WIDTH = 72
