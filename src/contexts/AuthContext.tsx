import {
  createContext,
  useContext,
  useEffect,
  useState,
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

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
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

// Email Admin cứng để bypass UI hang khi DB RLS gặp lỗi
const ADMIN_EMAILS = ['ocean.nguyen993@gmail.com'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeRoadmapSlug, setActiveRoadmapSlug] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<InitialAppData | null>(null)

  // Hàm fetch đồng nhất tránh tranh chấp Lock của Supabase
  async function loadUserData(currentSession: Session | null) {
    if (!currentSession?.user) {
      setProfile(null)
      setIsAdmin(false)
      setActiveRoadmapSlug(null)
      setInitialData(null)
      return
    }

    const userId = currentSession.user.id
    const userEmail = currentSession.user.email

    try {
      // MEGA RPC: Lấy toàn bộ dữ liệu chỉ trong 1 request
      const data = await fetchInitialAppData(userId)
      setInitialData(data)
      
      if (data.profile) {
        setProfile(data.profile)
      }

      setIsAdmin(userEmail ? ADMIN_EMAILS.includes(userEmail) : false)
      
      if (data.active_roadmap) {
        setActiveRoadmapSlug(data.active_roadmap.slug)
      }

    } catch (err) {
      console.error('UserData loading error:', err)
      if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
        setIsAdmin(true)
      }
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
          setIsAdmin(userEmail ? ADMIN_EMAILS.includes(userEmail) : false);
          // KHÔNG await loadUserData để tránh treo màn hình "Đang tải"
          loadUserData(initialSession)
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
          setIsAdmin(userEmail ? ADMIN_EMAILS.includes(userEmail) : false);
          // Bắt đầu load data ngầm, nhưng cho phép vào App ngay
          loadUserData(newSession)
          setLoading(false) 
        } else {
          setProfile(null)
          setIsAdmin(false)
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
        profile.tts_rate ?? 0.85
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

  async function refreshActiveRoadmap(targetRoadmapId?: string, forcedUserId?: string) {
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
  }

  async function refreshProfile() {
    if (!user) return
    const { data } = await supabase.from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data)
  }

  async function refreshInitialData() {
    if (!user) return
    const data = await fetchInitialAppData(user.id)
    setInitialData(data)
    if (data.profile) setProfile(data.profile)
    if (data.active_roadmap) setActiveRoadmapSlug(data.active_roadmap.slug)
  }

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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        activeRoadmapSlug,
        initialData,
        refreshActiveRoadmap,
        refreshProfile,
        refreshInitialData,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
