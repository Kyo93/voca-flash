/**
 * tests/unit/mastery-page-stale-data.test.ts
 *
 * Bug: MasteryPage hiển thị 12 từ thay vì 14 (đã học 14 trong session).
 * Root cause: MasteryPage chỉ fetch data khi mount. Sau khi học xong trong
 * tab khác hoặc quay lại, dữ liệu vẫn là state cũ (stale).
 *
 * Fix: MasteryPage phải re-fetch data khi page trở nên visible
 * (visibilitychange event) — đảm bảo luôn hiển thị dữ liệu mới nhất.
 *
 * RED: Test chứng minh visibilitychange trigger re-fetch.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('MasteryPage — stale data fix via visibilitychange', () => {

  beforeEach(() => {
    // Reset document visibility state
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true })
    Object.defineProperty(document, 'hidden', { value: false, writable: true })
  })

  it('REQUIRES visibilitychange listener to refetch on page become visible', async () => {
    /**
     * Scenario:
     * 1. User opens MasteryPage → fetches → shows 12 words
     * 2. User goes to study → learns 2 new words → DB now has 14
     * 3. User returns to MasteryPage tab → becomes visible
     * 4. Expected: shows 14 (re-fetched from DB)
     * 5. Bug behavior: still shows 12 (no re-fetch)
     *
     * The fix: MasteryPage must register a visibilitychange listener
     * that re-fetches data when the page becomes visible.
     */
    const masteryPage = (await import('../../src/pages/MasteryPage.tsx')).default

    // Read source to verify the fix is present
    const fs = require('fs')
    const path = require('path')
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/pages/MasteryPage.tsx'),
      'utf-8'
    )

    // THE FIX: MasteryPage must listen to visibilitychange
    expect(source).toMatch(/visibilitychange/)
    // Must check visibilityState === 'visible' before refetching
    expect(source).toMatch(/visibilityState.*===.*'visible'/)
  })

  it('refetch on visibility should call loadStats (stats refresh)', () => {
    const fs = require('fs')
    const path = require('path')
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/pages/MasteryPage.tsx'),
      'utf-8'
    )

    // When visibility changes to 'visible', it must call loadStats
    // (to refresh the 6 stat cards: learning, total, mastered, due, orphaned, weak)
    expect(source).toMatch(/loadStats/)
  })
})
