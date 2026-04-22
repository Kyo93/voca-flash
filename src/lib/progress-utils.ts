type ReviewActivity = { date: string; reviews: number; duration_ms: number }

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
  if (retentionRate >= 0.6) return 'good'
  return 'needs_work'
}

export function getUserLevel(totalWords: number, retentionRate: number): string {
  // Only cap level when retention is genuinely low from real review data.
  // retention <= 0.1 means no meaningful review data yet — don't penalize.
  const hasRealRetentionData = retentionRate > 0.1
  const effectiveWords = (hasRealRetentionData && retentionRate < 0.6)
    ? Math.min(totalWords, 999)
    : totalWords
  if (effectiveWords >= 2000) return 'C2 Proficient'
  if (effectiveWords >= 1000) return 'C1 Advanced'
  if (effectiveWords >= 500) return 'B2 Upper Intermediate'
  if (effectiveWords >= 200) return 'B1 Intermediate'
  if (effectiveWords >= 50) return 'A2 Elementary'
  return 'A1 Beginner'
}
