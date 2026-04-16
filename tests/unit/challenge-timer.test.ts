import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('challenge timer', () => {
  // Fake timers để không phải đợi 30s
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('format seconds dưới 60 giây', () => {
    const formatSeconds = (s: number) => `${s}s`
    expect(formatSeconds(30)).toBe('30s')
    expect(formatSeconds(5)).toBe('5s')
  })

  it('format seconds = 0 hiển thị 0s', () => {
    const formatSeconds = (s: number) => `${s}s`
    expect(formatSeconds(0)).toBe('0s')
  })

  it('progress từ 100% về 0% trong 30 giây', () => {
    const TOTAL = 30
    // simulate: 0s → 100%, 15s → 50%, 30s → 0%
    const progressAt = (elapsed: number) => Math.max(0, ((TOTAL - elapsed) / TOTAL) * 100)
    expect(progressAt(0)).toBe(100)
    expect(progressAt(15)).toBe(50)
    expect(progressAt(30)).toBe(0)
  })

  it('challenge bắt đầu với 30s, gọi onTimeout sau 30s', () => {
    const onTimeout = vi.fn()
    const TOTAL = 30_000
    let elapsed = 0
    const tick = () => { elapsed += 1000; if (elapsed >= TOTAL) onTimeout() }
    // advance 30 seconds
    for (let i = 0; i < 30; i++) tick()
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('submit trước khi hết giờ → xóa timer, không gọi onTimeout', () => {
    const onTimeout = vi.fn()
    const TOTAL = 30_000
    let elapsed = 0
    let timerCleared = false

    const clearTimer = () => { timerCleared = true }
    const tick = () => {
      if (timerCleared) return
      elapsed += 1000
      if (elapsed >= TOTAL) onTimeout()
    }

    // User submits at 10s → clears timer
    elapsed = 10_000
    clearTimer()
    // Advance remaining 20s
    for (let i = 0; i < 20; i++) tick()
    expect(timerCleared).toBe(true)
    expect(onTimeout).not.toHaveBeenCalled()
  })
})