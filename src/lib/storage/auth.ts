import { supabase } from '../supabase'
import type { UserProfile, MasteryStats } from '../types'
import { fetchInitialAppData } from './roadmap'
import { getMasteryStats } from './mastery'
import { TIME_CONSTANTS } from '../constants'
import { defaultSettings } from '../settings-defaults'

export async function updateUserSettings(userId: string, settings: Partial<UserProfile>): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update(settings)
    .eq('id', userId)

  if (error) {
    console.error('[Storage] updateUserSettings error:', error)
    throw error
  }
}

/**
 * recordStreak — Supabase-backed streak for LOGGED-IN users.
 * Creates profile if missing, then increments streak_days based on
 * consecutive-day study pattern.
 *
 * NOT a duplicate of streak.ts (which handles anonymous/offline
 * users via localStorage).
 */
export async function recordStreak(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]

  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('streak_days, last_study_date, longest_streak')
    .eq('id', userId)
    .maybeSingle()

  if (fetchError) {
    console.error('[Storage] recordStreak fetch error:', fetchError)
    return 0
  }

  if (!profile) {
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        streak_days: 1,
        last_study_date: today,
        longest_streak: 1,
        daily_target: defaultSettings.daily_target,
        theme_mode: defaultSettings.theme_mode,
      })
    if (insertError) {
      console.error('[Storage] recordStreak create profile failed:', insertError)
      return 0
    }
    return 1
  }

  const lastDate = profile.last_study_date as string | null
  const currentStreak = (profile.streak_days as number) ?? 0

  let newStreak: number
  if (lastDate === today) {
    newStreak = currentStreak
  } else if (lastDate) {
    const diff = Math.floor(
      (new Date(today).getTime() - new Date(lastDate).getTime()) /
        TIME_CONSTANTS.ONE_DAY_MS
    )
    if (diff === 1) {
      newStreak = currentStreak + 1
    } else {
      newStreak = 1
    }
  } else {
    newStreak = 1
  }

  const currentLongest = (profile as any).longest_streak ?? 0
  const newLongest = Math.max(currentLongest, newStreak)

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      streak_days: newStreak,
      last_study_date: today,
      longest_streak: newLongest,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('[Storage] recordStreak update error:', updateError)
    return currentStreak
  }

  return newStreak
}

export async function fetchDashboardStats(userId: string): Promise<MasteryStats> {
  const [mastery, appData] = await Promise.all([
    getMasteryStats(userId),
    fetchInitialAppData(userId),
  ])

  return {
    total: mastery.total,
    mastered: mastery.mastered,
    learning: mastery.learning,
    due: mastery.due,
    weak: mastery.weak,
    orphaned: mastery.orphaned,
    streak_days: appData.profile?.streak_days ?? 0,
  }
}
