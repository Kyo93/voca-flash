import { useEffect, useState, useMemo } from 'react'
import { fetchDashboardSummary } from '../lib/supabase-storage'
import type { DashboardSummary } from '../lib/types'
import { useAuth } from '../contexts/AuthContext'
import { loadStreak, type StreakData } from '../lib/streak'

const QUOTES = [
  "Hành trình vạn dặm bắt đầu từ một bước chân.",
  "Học một ngoại ngữ là có thêm một cửa sổ để nhìn ra thế giới.",
  "Sự kiên trì là chìa khóa của thành công.",
  "Mỗi ngày một chút, kiến thức sẽ đong đầy.",
  "Đừng dừng lại cho đến khi bạn tự hào về bản thân.",
  "Kỹ năng ngôn ngữ là bản đồ của một nền văn hóa.",
  "Học tập là kho báu sẽ đi theo chủ nhân của nó khắp mọi nơi."
]

export function useDashboard() {
  const { user, profile, initialData } = useAuth()
  const [streak, setStreak] = useState<StreakData>(loadStreak())
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const [currentQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  
  const newTodayTotal = initialData?.health.new_today ?? 0
  const dailyGoal = profile?.daily_target ?? 20
  
  useEffect(() => {
    if (initialData) {
      setDashboardData(prev => ({
        resumeTopic: prev?.resumeTopic || null,
        fallbackTopics: prev?.fallbackTopics || [],
        globalReviewCount: initialData.global_review_count
      }))
      
      if (initialData.profile) {
        setStreak({
          currentStreak: initialData.profile.streak_days,
          lastStudyDate: initialData.profile.last_study_date ?? '',
          longestStreak: initialData.profile.streak_days,
        })
      }
      setLoading(false)
    }
  }, [initialData])

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const summary = await fetchDashboardSummary(user.id)
        setDashboardData(summary)
        
        const today = new Date().toISOString().split('T')[0]
        const dismissed = sessionStorage.getItem('welcome_banner_dismissed') === 'true'
        if (profile?.last_study_date !== today && !dismissed) {
          setShowBanner(true)
        }
      } catch (err) {
        console.error('Dashboard deep load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user, profile?.last_study_date])

  const growth = useMemo(() => {
    const currentStreakCount = streak?.currentStreak ?? 0
    if (currentStreakCount === 0) return { icon: 'potted_plant', label: 'Hạt mầm' }
    if (currentStreakCount < 3) return { icon: 'local_florist', label: 'Đang lớn' }
    return { icon: 'nature', label: 'Cây cổ thụ' }
  }, [streak?.currentStreak])

  const dismissBanner = () => {
    setShowBanner(false)
    sessionStorage.setItem('welcome_banner_dismissed', 'true')
  }

  return {
    user,
    profile,
    initialData,
    dashboardData,
    streak,
    loading,
    showBanner,
    dismissBanner,
    currentQuote,
    newTodayTotal,
    dailyGoal,
    growth,
    reviewCount: dashboardData?.globalReviewCount ?? 0,
    resumeTopic: dashboardData?.resumeTopic,
    fallback1: dashboardData?.fallbackTopics[0]
  }
}
