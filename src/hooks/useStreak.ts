import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchStreakFromSupabase, loadStreak } from '../lib/streak'
import type { StreakData } from '../lib/streak'

export function useStreak(): StreakData {
  const { user } = useAuth()
  const [streak, setStreak] = useState<StreakData>(loadStreak)
  const cache = useRef<{ userId: string | undefined; data: StreakData } | null>(null)

  useEffect(() => {
    const userId = user?.id
    const cached = cache.current
    if (cached && cached.userId === userId) {
      setStreak(cached.data)
      return
    }
    async function load() {
      const data = userId ? await fetchStreakFromSupabase(userId) : loadStreak()
      cache.current = { userId, data }
      setStreak(data)
    }
    load()
  }, [user?.id])

  return streak
}
