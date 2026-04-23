import { PROGRESS_LEVEL_THRESHOLDS } from './constants'

type ReviewActivity = { date: string; reviews: number; duration_ms: number }

/**
 * Returns the number of REVIEW ACTIONS performed today (UTC bucket).
 *
 * ⚠️  Do NOT use this for the "Từ đã học hôm nay" / "+N hôm nay" badge —
 *     that displays NEW words added today and must come from
 *     `initialData.health.new_today` (4am Asia/Ho_Chi_Minh boundary).
 *     Using this here causes the Dashboard vs Progress mismatch.
 */
export function getWordsToday(reviewActivity: ReviewActivity[] | null | undefined): number {
  if (!reviewActivity || reviewActivity.length === 0) return 0
  const today = new Date().toISOString().split('T')[0]
  const entry = reviewActivity.find(r => r.date === today)
  return entry?.reviews ?? 0
}

export function getRetentionDisplay(
  retentionRate: number,
  reviewActivity: ReviewActivity[] | null | undefined
): { percent: number; hasData: boolean } {
  const hasData = !!(reviewActivity && reviewActivity.length > 0)
  return { percent: Math.round(retentionRate * 100), hasData }
}

export function getRetentionLabel(retentionRate: number): 'excellent' | 'good' | 'needs_work' | 'no_data' {
  if (retentionRate === 0) return 'no_data'
  if (retentionRate >= 0.8) return 'excellent'
  if (retentionRate >= PROGRESS_LEVEL_THRESHOLDS.RETENTION_PENALTY_THRESHOLD) return 'good'
  return 'needs_work'
}

export function getUserLevel(totalWords: number, retentionRate: number): string {
  // Only cap level when retention is genuinely low from real review data.
  // retention <= NO_DATA_THRESHOLD means no meaningful review data yet — don't penalize.
  const hasRealRetentionData = retentionRate > PROGRESS_LEVEL_THRESHOLDS.NO_DATA_THRESHOLD
  const effectiveWords = (hasRealRetentionData && retentionRate < PROGRESS_LEVEL_THRESHOLDS.RETENTION_PENALTY_THRESHOLD)
    ? Math.min(totalWords, 999)
    : totalWords
  if (effectiveWords >= PROGRESS_LEVEL_THRESHOLDS.C2) return 'C2 Proficient'
  if (effectiveWords >= PROGRESS_LEVEL_THRESHOLDS.C1) return 'C1 Advanced'
  if (effectiveWords >= PROGRESS_LEVEL_THRESHOLDS.B2) return 'B2 Upper Intermediate'
  if (effectiveWords >= PROGRESS_LEVEL_THRESHOLDS.B1) return 'B1 Intermediate'
  if (effectiveWords >= PROGRESS_LEVEL_THRESHOLDS.A2) return 'A2 Elementary'
  return 'A1 Beginner'
}

/**
 * Returns the translation key for a greeting based on the current hour.
 */
export function getGreetingKey(hour: number): string {
  if (hour < 12) return 'progress.greeting_morning'
  if (hour < 18) return 'progress.greeting_afternoon'
  return 'progress.greeting_evening'
}
