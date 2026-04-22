import { describe, it, expect } from 'vitest'

// Logic extracted from RoadmapForecast.tsx for unit testing
const calculateForecastDays = (velocity: number, totalWords: number, masteredWords: number) => {
  const remainingWords = Math.max(0, totalWords - masteredWords)
  if (velocity <= 0) return null
  return Math.ceil(remainingWords / velocity)
}

describe('RoadmapForecast Logic', () => {
  it('should calculate remaining days correctly for normal velocity', () => {
    expect(calculateForecastDays(10, 100, 0)).toBe(10)
    expect(calculateForecastDays(10, 100, 50)).toBe(5)
    expect(calculateForecastDays(3, 10, 0)).toBe(4) // 3.33 rounded up
  })

  it('should return null if velocity is zero or negative', () => {
    expect(calculateForecastDays(0, 100, 0)).toBeNull()
    expect(calculateForecastDays(-5, 100, 0)).toBeNull()
  })

  it('should return 0 if all words are mastered', () => {
    expect(calculateForecastDays(10, 100, 100)).toBe(0)
    expect(calculateForecastDays(10, 100, 150)).toBe(0) // Overflow case
  })
})
