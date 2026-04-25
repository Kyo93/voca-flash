import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import { 
  signIn as authSignIn, 
  signUp as authSignUp, 
  signOut as authSignOut 
} from '../lib/auth'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '../lib/types'
import { setTtsConfig } from '../lib/tts'

import { fetchInitialAppData, type InitialAppData } from '../lib/supabase-storage'
import i18n from '../i18n'
import { LNG_STORAGE_KEY } from '../lib/i18n-utils'
import { UI_DEFAULTS } from '../lib/constants'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  adminLoading: boolean
  activeRoadmapSlug: string | null
  initialData: InitialAppData | null // Chứa stats khởi tạo
  refreshActiveRoadmap: (targetRoadmapId?: string, forcedUserId?: string) => Promise<void>
  refreshProfile: () => Promise<void>
  refreshInitialData: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Danh sách email admin được nạp từ env (VITE_ADMIN_EMAILS, phân cách bằng dấu phẩy).
// Không hardcode email cụ thể trong source — phải khai báo qua env.
const ADMIN_EMAILS: readonly string[] = (
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? ''
)
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

function deriveIsAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export async function resolveAdminAccess(authUser: Pick<User, 'id' | 'email'> | null | undefined): Promise<boolean> {
  if (!authUser) return false
  if (deriveIsAdmin(authUser.email)) return true

  const { data, error } = await supabase.rpc('is_admin')
  if (error) {
    console.warn('Admin role check failed:', error)
    return false
  }

  return data === true
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [activeRoadmapSlug, setActiveRoadmapSlug] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<InitialAppData | null>(null)

  // Đồng bộ initialData/profile/activeRoadmap từ một payload InitialAppData
  function applyAppData(data: InitialAppData) {
    setInitialData(data)
    if (data.profile) {
      setProfile(data.profile)
    }
    if (data.active_roadmap) {
      setActiveRoadmapSlug(data.active_roadmap.slug)
    }
  }

  // Hàm fetch đồng nhất tránh tranh chấp Lock của Supabase
  async function loadInitialUserData(currentSession: Session | null) {
    if (!currentSession?.user) {
      setProfile(null)
      setIsAdmin(false)
      setAdminLoading(false)
      setActiveRoadmapSlug(null)
      setInitialData(null)
      return
    }

    const userId = currentSession.user.id
    try {
      // MEGA RPC: Lấy toàn bộ dữ liệu chỉ trong 1 request
      const data = await fetchInitialAppData(userId)
      applyAppData(data)
    } catch (err) {
      console.error('UserData loading error:', err)
    }
  }

  async function loadAdminAccess(currentSession: Session | null) {
    if (!currentSession?.user) {
      setIsAdmin(false)
      setAdminLoading(false)
      return
    }

    const adminEmailMatch = deriveIsAdmin(currentSession.user.email)
    setIsAdmin(adminEmailMatch)

    if (adminEmailMatch) {
      setAdminLoading(false)
      return
    }

    setAdminLoading(true)
    try {
      setIsAdmin(await resolveAdminAccess(currentSession.user))
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) throw error

        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        
        if (initialSession) {
          const userEmail = initialSession.user.email;
          setIsAdmin(deriveIsAdmin(userEmail));
          loadAdminAccess(initialSession)
          // KHÔNG await loadInitialUserData để tránh treo màn hình "Đang tải"
          loadInitialUserData(initialSession)
        }
      } catch (err) {
        console.error('Auth initialization failed:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // Lắng nghe thay đổi auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return
        
        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        if (newSession) {
          const userEmail = newSession.user.email;
          setIsAdmin(deriveIsAdmin(userEmail));
          loadAdminAccess(newSession)
          // Bắt đầu load data ngầm, nhưng cho phép vào App ngay
          loadInitialUserData(newSession)
          setLoading(false)
        } else {
          setProfile(null)
          setIsAdmin(false)
          setAdminLoading(false)
          setActiveRoadmapSlug(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sync TTS config whenever profile changes
  useEffect(() => {
    if (profile) {
      setTtsConfig(
        profile.tts_voice || null,
        profile.tts_rate ?? UI_DEFAULTS.TTS_DEFAULT_RATE
      )
    }
  }, [profile])

  // Sync Theme mode whenever profile changes
  useEffect(() => {
    if (!profile) return

    const applyTheme = (mode: string) => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')

      if (mode === 'dark') {
        root.classList.add('dark')
      } else if (mode === 'light') {
        root.classList.add('light')
      } else {
        // System preference
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.add(systemDark ? 'dark' : 'light')
      }
    }

    applyTheme(profile.theme_mode || 'light')
  }, [profile?.theme_mode])
  
  // Sync UI Language whenever profile changes
  useEffect(() => {
    if (!profile?.app_language) return
    
    if (profile.app_language !== i18n.language) {
      i18n.changeLanguage(profile.app_language)
      localStorage.setItem(LNG_STORAGE_KEY, profile.app_language)
    }
  }, [profile?.app_language])

  const refreshActiveRoadmap = useCallback(async (targetRoadmapId?: string, forcedUserId?: string) => {
    const currentUserId = forcedUserId || user?.id
    if (!currentUserId) return

    let roadmapId = targetRoadmapId

    // 1. Nếu không truyền ID, tìm roadmap học gần nhất từ DB
    if (!roadmapId) {
      const { data } = await supabase.from('user_resume_pointers')
        .select('roadmap_id')
        .eq('user_id', currentUserId)
        .order('last_accessed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      roadmapId = data?.roadmap_id
    }

    // 2. Lấy slug từ roadmapId (tránh join phức tạp)
    if (roadmapId) {
      const { data: roadmap } = await supabase.from('roadmaps')
        .select('slug')
        .eq('id', roadmapId)
        .single()

      setActiveRoadmapSlug(roadmap?.slug ?? null)
    } else {
      setActiveRoadmapSlug(null)
    }
  }, [user?.id])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data)
  }, [user])

  const refreshInitialData = useCallback(async () => {
    if (!user) return
    const data = await fetchInitialAppData(user.id)
    applyAppData(data)
  }, [user])

  async function handleSignIn(email: string, password: string) {
    const { error } = await authSignIn(email, password)
    return { error: error ? new Error(error.message) : null }
  }

  async function handleSignUp(email: string, password: string) {
    const { error } = await authSignUp(email, password)
    return { error: error ? new Error(error.message) : null }
  }

  async function handleSignOut() {
    await authSignOut()
  }

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    isAdmin,
    adminLoading,
    activeRoadmapSlug,
    initialData,
    refreshActiveRoadmap,
    refreshProfile,
    refreshInitialData,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  }), [
    user,
    session,
    profile,
    loading,
    isAdmin,
    adminLoading,
    activeRoadmapSlug,
    initialData,
    refreshActiveRoadmap,
    refreshProfile,
    refreshInitialData,
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
