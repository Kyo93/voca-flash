/**
 * streak.ts — Anonymous/Offline streak tracking (localStorage).
 *
 * PURPOSE: Persist streak data for anonymous users via localStorage.
 * NOT a duplicate of src/lib/storage/auth.ts (Supabase-backed
 * for logged-in users via recordStreak). Different use cases,
 * different storage backends.
 */

import { supabase } from './supabase'
import { getTodayBoundary } from './storage/session'

const STREAK_KEY = 'vocamaster-streak'

export interface StreakData {
  currentStreak: number
  lastStudyDate: string // YYYY-MM-DD
  longestStreak: number
}

// ── localStorage helpers (offline fallback) ──────────────────

/**
 * Returns today's date string using 4 AM boundary.
 * Sessions before 4 AM are grouped into "yesterday".
 */
function todayBoundaryStr(): string {
  return getTodayBoundary().toISOString().split('T')[0]
}

function daysDiff(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return -1
  return Math.floor(Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { currentStreak: 0, lastStudyDate: '', longestStreak: 0 }
}

export function saveStreak(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data))
}

// ── Supabase-backed streak (logged-in users) ────────────────

export async function fetchStreakFromSupabase(userId: string): Promise<StreakData> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('streak_days, last_study_date, longest_streak')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return { currentStreak: 0, lastStudyDate: '', longestStreak: 0 }
  }

  return {
    currentStreak: (data.streak_days as number) ?? 0,
    lastStudyDate: (data.last_study_date as string) ?? '',
    longestStreak: (data.longest_streak as number) ?? 0,
  }
}

// ── recordStudy ──────────────────────────────────────────────

/**
 * Local fallback: record study in localStorage.
 * useFlashcard now calls recordStreak() from supabase-storage instead.
 */
export function recordStudy(): StreakData {
  const data = loadStreak()
  const today = todayBoundaryStr()

  if (data.lastStudyDate === today) {
    return data
  }

  const daysSinceLastStudy = data.lastStudyDate
    ? daysDiff(data.lastStudyDate, today)
    : -1

  let newStreak: number

  if (daysSinceLastStudy === 1) {
    newStreak = data.currentStreak + 1
  } else if (daysSinceLastStudy === 0) {
    newStreak = data.currentStreak
  } else {
    newStreak = 1
  }

  const newData: StreakData = {
    currentStreak: newStreak,
    lastStudyDate: today,
    longestStreak: Math.max(data.longestStreak, newStreak),
  }

  saveStreak(newData)
  return newData
}

/**
 * Get streak display — tries Supabase first, falls back to localStorage.
 */
export async function getStreakDisplayAsync(userId?: string): Promise<StreakData> {
  if (userId) {
    return fetchStreakFromSupabase(userId)
  }
  return loadStreak()
}

/**
 * Synchronous version — localStorage only.
 * Use getStreakDisplayAsync(userId) for Supabase data.
 */
export function getStreakDisplay(): StreakData {
  return loadStreak()
}
