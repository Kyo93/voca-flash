import { describe, it, expect } from 'vitest'

// Test formatInterval logic inline (replicate logic from srs.ts)
function formatInterval(scheduledDays: number): string {
  if (scheduledDays < 1) {
    const minutes = Math.round(scheduledDays * 24 * 60)
    return minutes <= 1 ? '1 phút' : `${minutes} phút`
  }
  if (scheduledDays < 30) return `${Math.round(scheduledDays)} ngày`
  return `${Math.round(scheduledDays / 30)} tháng`
}

describe('formatInterval (logic replica)', () => {
  it('scheduledDays < 1 ngày → phút', () => {
    expect(formatInterval(0)).toBe('1 phút')  // 0 → rounds to 1 phút (minimum interval)
    expect(formatInterval(0.01)).toBe('14 phút')
    expect(formatInterval(0.0208)).toBe('30 phút') // ~30 phút
    expect(formatInterval(0.0007)).toBe('1 phút')  // ~1 phút
  })

  it('scheduledDays ≥ 1 và < 30 → ngày', () => {
    expect(formatInterval(1)).toBe('1 ngày')
    expect(formatInterval(4.3)).toBe('4 ngày')
    expect(formatInterval(10)).toBe('10 ngày')
  })

  it('scheduledDays ≥ 30 → tháng', () => {
    expect(formatInterval(30)).toBe('1 tháng')
    expect(formatInterval(60)).toBe('2 tháng')
    expect(formatInterval(90)).toBe('3 tháng')
  })
})

// Integration test: verify computeIntervalPreviews returns structure correctly
// (uses real calculateFSRSReview — skip if throws with current progress values)
import { computeIntervalPreviews, createInitialProgress } from '../../src/lib/srs'

describe('computeIntervalPreviews (integration)', () => {
  it('trả về đúng 4 items với ratings 1-2-3-4', () => {
    const freshProgress = createInitialProgress('test')
    const previews = computeIntervalPreviews(freshProgress, 1.0)
    expect(previews).toHaveLength(4)
    expect(previews.map(p => p.rating)).toEqual([1, 2, 3, 4])
  })

  it('labels là string không rỗng', () => {
    const freshProgress = createInitialProgress('test')
    const previews = computeIntervalPreviews(freshProgress, 1.0)
    previews.forEach(p => {
      expect(typeof p.label).toBe('string')
      expect(p.label.length).toBeGreaterThan(0)
    })
  })

  it('rating 4 (Easy) có label chứa đơn vị thời gian', () => {
    const freshProgress = createInitialProgress('test')
    const previews = computeIntervalPreviews(freshProgress, 1.0)
    // Rating 4 = Easy = longest interval → should be days or months
    expect(previews[3].rating).toBe(4)
    const hasUnit = previews[3].label.includes('ngày') || previews[3].label.includes('tháng')
    expect(hasUnit).toBe(true)
  })
})