/**
 * tests/unit/mastery-page-stale-data.test.ts
 *
 * Bug 1: MasteryPage hiển thị 12 từ thay vì 14 (đã học 14 trong session).
 * Bug 2: Tổng số từ hiển thị 24 thay vì 25 (đã học 25).
 *
 * Root cause: visibilitychange listener chỉ gọi getMasteryStats (stat cards)
 * nhưng KHÔNG gọi loadData(0) → totalCount vẫn stale.
 *
 * Fix: visibilitychange handler phải gọi CẢ getMasteryStats VÀ loadData(0)
 * để refresh đầy đủ cả stats cards lẫn tổng số từ trên header.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('MasteryPage — stale data fix via visibilitychange', () => {

  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true })
    Object.defineProperty(document, 'hidden', { value: false, writable: true })
  })

  it('visibilitychange handler must call loadData(0) — not just getMasteryStats', async () => {
    /**
     * Bug: visibilitychange only calls getMasteryStats (stat cards refresh).
     * But getUserVocabulary (which sets totalCount) is NOT called on visibility.
     * Result: stat cards update but header shows stale totalCount.
     *
     * Fix: visibilitychange must call loadData(0) to refresh totalCount.
     */
    const fs = require('fs')
    const path = require('path')
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/pages/MasteryPage.tsx'),
      'utf-8'
    )

    // The visibilitychange useEffect body must include loadData(0) call
    // We find the visibilitychange handler block and check if it calls loadData
    const visibilityBlock = source.match(
      /handleVisibility[\s\S]*?(?=document\.addEventListener|return \(\))/m
    )?.[0] ?? ''

    // Must call loadData(0) — the function that updates totalCount
    expect(visibilityBlock).toMatch(/loadData\(0\)/)
    // Must call getMasteryStats — for stat cards
    expect(visibilityBlock).toMatch(/getMasteryStats/)
  })

  it('has visibilitychange listener that refetches on page become visible', async () => {
    const fs = require('fs')
    const path = require('path')
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/pages/MasteryPage.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/visibilitychange/)
    expect(source).toMatch(/visibilityState.*===.*'visible'/)
  })
})
