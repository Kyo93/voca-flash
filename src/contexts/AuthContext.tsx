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

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  activeRoadmapSlug: string | null
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

  // Hàm fetch đồng nhất tránh tranh chấp Lock của Supabase
  async function loadUserData(currentSession: Session | null) {
    if (!currentSession?.user) {
      setProfile(null)
      setIsAdmin(false)
      setActiveRoadmapSlug(null)
      return
    }

    const userId = currentSession.user.id
    const userEmail = currentSession.user.email

    try {
      // 1. Kiểm tra Admin (ưu tiên email bypass để nhanh)
      if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
        setIsAdmin(true)
      } else {
        // Nếu không thuộc email bypass, mới gọi RPC kiểm tra
        const { data: isAdminRpc } = await supabase.rpc('is_admin')
        setIsAdmin(!!isAdminRpc)
      }

      // 2. Lấy profile (chạy ngầm, không block luồng chính)
      supabase.from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .then(({ data }) => setProfile(data ?? null))

      // 3. Lấy active roadmap slug từ resume pointer cuối cùng
      supabase.from('user_resume_pointers')
        .select('roadmap_id, roadmaps(slug)')
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data && (data as any).roadmaps?.slug) {
            setActiveRoadmapSlug((data as any).roadmaps.slug)
          } else {
            setActiveRoadmapSlug(null)
          }
        })

    } catch (err) {
      console.error('UserData loading error:', err)
      // Fallback cho admin email ngay cả khi lỗi network/DB
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
          await loadUserData(initialSession)
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
          await loadUserData(newSession)
        } else {
          setProfile(null)
          setIsAdmin(false)
          setActiveRoadmapSlug(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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
