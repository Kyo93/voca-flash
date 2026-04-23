import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTodayBoundary, getEndOfStudyDay } from '../../src/lib/storage/session'

describe('SRS Boundary Logic', () => {
  describe('getTodayBoundary (Frontend)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should set boundary to 4 AM of current day if it is after 4 AM', () => {
      // 2026-04-20 09:00:00 (Today)
      const now = new Date('2026-04-20T09:00:00')
      vi.setSystemTime(now)
      
      const boundary = getTodayBoundary()
      expect(boundary.getFullYear()).toBe(2026)
      expect(boundary.getMonth()).toBe(3) // April
      expect(boundary.getDate()).toBe(20)
      expect(boundary.getHours()).toBe(4)
    })

    it('should set boundary to 4 AM of previous day if it is before 4 AM', () => {
      // 2026-04-20 03:00:00 (Early morning)
      const now = new Date('2026-04-20T03:00:00')
      vi.setSystemTime(now)
      
      const boundary = getTodayBoundary()
      expect(boundary.getFullYear()).toBe(2026)
      expect(boundary.getMonth()).toBe(3) // April
      expect(boundary.getDate()).toBe(19) // Should be yesterday
      expect(boundary.getHours()).toBe(4)
    })
  })

  describe('getEndOfStudyDay (Frontend)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return 4 AM of the next day when called after 4 AM today', () => {
      const now = new Date('2026-04-20T09:00:00')
      vi.setSystemTime(now)
      
      const endBoundary = getEndOfStudyDay()
      expect(endBoundary.getFullYear()).toBe(2026)
      expect(endBoundary.getMonth()).toBe(3) // April
      expect(endBoundary.getDate()).toBe(21) // Tomorrow
      expect(endBoundary.getHours()).toBe(4)
    })
  })

  describe('SQL Boundary Logic Simulation', () => {
    // This simulates the logic in get_initial_app_data_v2.sql:
    // v_boundary := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '4 hours')::DATE + INTERVAL '4 hours';
    
    function simulateSqlBoundary(nowUtc: Date): Date {
      // 1. AT TIME ZONE 'Asia/Ho_Chi_Minh' converts UTC to local VN
      // (assuming VN is UTC+7)
      const vnTime = new Date(nowUtc.getTime() + 7 * 60 * 60 * 1000)
      
      // 2. Subtract 4 hours
      const minus4h = new Date(vnTime.getTime() - 4 * 60 * 60 * 1000)
      
      // 3. ::DATE (keep only date part)
      const datePart = new Date(minus4h.getFullYear(), minus4h.getMonth(), minus4h.getDate())
      
      // 4. + INTERVAL '4 hours'
      const finalLocal = new Date(datePart.getTime() + 4 * 60 * 60 * 1000)
      
      // 5. THE BUG: Returning it as TIMESTAMPTZ without 'AT TIME ZONE' conversion
      // In Postgres, if session is UTC, then '2026-04-20 04:00:00' becomes '2026-04-20 04:00:00 UTC'
      const resultUtc = new Date(Date.UTC(finalLocal.getFullYear(), finalLocal.getMonth(), finalLocal.getDate(), 4))
      
      return resultUtc
    }

    function simulateFixedSqlBoundary(nowUtc: Date): Date {
      // 1. AT TIME ZONE 'Asia/Ho_Chi_Minh' converts UTC to local VN
      const vnTime = new Date(nowUtc.getTime() + 7 * 60 * 60 * 1000)
      
      // 2. Subtract 4 hours
      const minus4h = new Date(vnTime.getTime() - 4 * 60 * 60 * 1000)
      
      // 3. ::DATE
      const datePart = new Date(minus4h.getFullYear(), minus4h.getMonth(), minus4h.getDate())
      
      // 4. + INTERVAL '4 hours'
      const finalLocal = new Date(datePart.getTime() + 4 * 60 * 60 * 1000)
      
      // 5. THE FIX: Convert BACK to UTC from local VN
      // 4:00 AM VN = 21:00 PM UTC (Previous day)
      const resultUtc = new Date(finalLocal.getTime() - 7 * 60 * 60 * 1000)
      
      return resultUtc
    }

    it('reproduces the bug: boundary in UTC blocks items learned in VN morning', () => {
      // Now is 2026-04-20 09:00:00 VN = 02:00:00 UTC
      const nowUtc = new Date(Date.UTC(2026, 3, 20, 2, 0, 0))
      const boundary = simulateSqlBoundary(nowUtc)
      const itemLearnedAt = nowUtc
      expect(itemLearnedAt.getTime()).toBeLessThan(boundary.getTime())
    })

    it('verifies the fix: boundary in VN time correctly includes morning items', () => {
      // Now is 2026-04-20 09:00:00 VN = 02:00:00 UTC
      const nowUtc = new Date(Date.UTC(2026, 3, 20, 2, 0, 0))
      
      // Fixed boundary calculation results in April 19 21:00:00 UTC (which is April 20 04:00 AM VN)
      const boundary = simulateFixedSqlBoundary(nowUtc)
      
      // Learned at 9:00 AM VN (02:00 UTC)
      const itemLearnedAt = nowUtc
      
      // April 20 02:00 UTC >= April 19 21:00 UTC is TRUE
      expect(itemLearnedAt.getTime()).toBeGreaterThanOrEqual(boundary.getTime())
    })
  })
})
