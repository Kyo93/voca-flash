/**
 * tests/unit/select-quadrant-unified.test.ts
 *
 * RED phase: challenge-logic.ts chỉ nên có 1 hàm selectQuadrant.
 * Bỏ selectQuadrantFreeStudy và selectQuadrantForMasteryWord — thay bằng
 * hàm unified nhận (stability, hasExample, hasChoices?).
 */

import { describe, it, expect } from 'vitest'

describe('selectQuadrant unified — RED', () => {
  it('challenge-logic.ts must NOT export selectQuadrantFreeStudy (merged into selectQuadrant)', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/challenge-logic.ts',
      'utf-8'
    )
    // After fix: selectQuadrantFreeStudy and selectQuadrantForMasteryWord are gone
    expect(source).not.toMatch(/export function selectQuadrantFreeStudy/)
    expect(source).not.toMatch(/export function selectQuadrantForMasteryWord/)
  })

  it('challenge-logic.ts must still export a single unified selectQuadrant function', async () => {
    const mod = await import('../../src/lib/challenge-logic')
    expect(typeof mod.selectQuadrant).toBe('function')
  })

  it('selectQuadrant must accept stability + hasExample (unified API)', async () => {
    const mod = await import('../../src/lib/challenge-logic')
    // Should work with (stability: number, hasExample: boolean)
    const r1 = mod.selectQuadrant(1, false)
    expect(['construction', 'recognition']).toContain(r1)

    const r2 = mod.selectQuadrant(10, false)
    expect(['construction', 'phonetics']).toContain(r2)

    const r3 = mod.selectQuadrant(20, false)
    expect(r3).toBe('ghost_recall')
  })

  it('useFreeStudySession must still work (no longer import removed functions)', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/hooks/useFreeStudySession.ts',
      'utf-8'
    )
    // After fix: no reference to selectQuadrantFreeStudy or selectQuadrantForMasteryWord
    expect(source).not.toMatch(/selectQuadrantFreeStudy/)
    expect(source).not.toMatch(/selectQuadrantForMasteryWord/)
  })
})