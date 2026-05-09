import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { loadStreak, type StreakData } from '../lib/streak'
import { fetchDashboardSummary } from '../lib/supabase-storage'
import type { DashboardSummary } from '../lib/types'

const QUOTE_KEYS = [
  'home.quotes.longJourney',
  'home.quotes.newWindow',
  'home.quotes.persistence',
  'home.quotes.dailyGrowth',
  'home.quotes.pride',
  'home.quotes.cultureMap',
  'home.quotes.treasure',
] as const

export function useDashboard() {
  const { t } = useTranslation()
  const { user, profile, initialData } = useAuth()
  const [streak, setStreak] = useState<StreakData>(loadStreak())
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const [currentQuoteKey] = useState(() => QUOTE_KEYS[Math.floor(Math.random() * QUOTE_KEYS.length)])

  const newTodayTotal = initialData?.health.new_today ?? 0
  const dailyGoal = profile?.daily_target ?? 20

  useEffect(() => {
    if (initialData) {
      setDashboardData(prev => ({
        resumeTopic: prev?.resumeTopic || null,
        fallbackTopics: prev?.fallbackTopics || [],
        globalReviewCount: initialData.global_review_count,
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
    if (currentStreakCount === 0) return { icon: 'potted_plant', label: t('home.growth.seedling') }
    if (currentStreakCount < 3) return { icon: 'local_florist', label: t('home.growth.growing') }
    return { icon: 'nature', label: t('home.growth.rooted') }
  }, [streak?.currentStreak, t])

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
    currentQuote: t(currentQuoteKey),
    newTodayTotal,
    dailyGoal,
    growth,
    reviewCount: dashboardData?.globalReviewCount ?? 0,
    resumeTopic: dashboardData?.resumeTopic,
    fallback1: dashboardData?.fallbackTopics[0],
  }
}
