import { useCallback, useEffect, useState } from 'react'
import { fetchRewardProgress } from '../lib/supabase-storage'
import { REWARD_PROGRESS_UPDATED_EVENT, type RewardProgressView } from '../lib/rewards'

export function useRewardProgress(userId: string | null | undefined) {
  const [rewardProgress, setRewardProgress] = useState<RewardProgressView | null>(null)
  const [isLoadingRewards, setIsLoadingRewards] = useState(false)

  const refreshRewardProgress = useCallback(async () => {
    if (!userId) {
      setRewardProgress(null)
      return
    }

    setIsLoadingRewards(true)
    try {
      setRewardProgress(await fetchRewardProgress(userId))
    } catch (err) {
      console.error('[useRewardProgress] load failed:', err)
    } finally {
      setIsLoadingRewards(false)
    }
  }, [userId])

  useEffect(() => {
    refreshRewardProgress()
  }, [refreshRewardProgress])

  useEffect(() => {
    if (!userId) return

    function handleRewardProgressUpdated(event: Event) {
      const detail = (event as CustomEvent<{ userId?: string }>).detail
      if (detail?.userId === userId) {
        refreshRewardProgress()
      }
    }

    window.addEventListener(REWARD_PROGRESS_UPDATED_EVENT, handleRewardProgressUpdated)

    return () => {
      window.removeEventListener(REWARD_PROGRESS_UPDATED_EVENT, handleRewardProgressUpdated)
    }
  }, [refreshRewardProgress, userId])

  return {
    rewardProgress,
    isLoadingRewards,
    refreshRewardProgress,
  }
}
