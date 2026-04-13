import { supabase } from '../supabase'
import type { UserProfile, UserStats } from '../types'
import { fetchInitialAppData } from './roadmap'

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

export async function recordStreak(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]

  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('streak_days, last_study_date')
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
        daily_target: 20,
        theme_mode: 'light',
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
        (1000 * 60 * 60 * 24)
    )
    if (diff === 1) {
      newStreak = currentStreak + 1
    } else {
      newStreak = 1
    }
  } else {
    newStreak = 1
  }

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      streak_days: newStreak,
      last_study_date: today,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('[Storage] recordStreak update error:', updateError)
    return currentStreak
  }

  return newStreak
}

export async function fetchDashboardStats(userId: string): Promise<UserStats> {
  const appData = await fetchInitialAppData(userId)
  
  return {
    totalWords: appData.stats.total_words,
    mastered: appData.stats.mastered,
    learning: appData.stats.learning,
    streakDays: appData.profile?.streak_days ?? 0,
  }
}
