/**
 * Streak calculation — tracks daily study habit
 */

const STREAK_KEY = 'vocamaster-streak'

export interface StreakData {
  currentStreak: number
  lastStudyDate: string // YYYY-MM-DD
  longestStreak: number
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
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

export function recordStudy(): StreakData {
  const data = loadStreak()
  const today = todayStr()

  if (data.lastStudyDate === today) {
    // Already studied today, no change
    return data
  }

  const daysSinceLastStudy = data.lastStudyDate
    ? daysDiff(data.lastStudyDate, today)
    : -1

  let newStreak: number

  if (daysSinceLastStudy === 1) {
    // Consecutive day — increment streak
    newStreak = data.currentStreak + 1
  } else if (daysSinceLastStudy === 0) {
    // Same day (edge case — already handled above)
    newStreak = data.currentStreak
  } else {
    // No lastStudyDate, or streak broken (missed >1 day) — reset
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

export function getStreakDisplay(): StreakData {
  return loadStreak()
}
