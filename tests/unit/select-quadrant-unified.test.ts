import { describe, it, expect } from 'vitest'
import { readSourceFile } from './source-reader'

describe('selectQuadrant unified API', () => {
  it('challenge-logic.ts does not export removed specialized selectors', () => {
    const source = readSourceFile('lib/challenge-logic.ts')
    expect(source).not.toMatch(/export function selectQuadrantFreeStudy/)
    expect(source).not.toMatch(/export function selectQuadrantForMasteryWord/)
  })

  it('challenge-logic.ts still exports a single unified selectQuadrant function', async () => {
    const mod = await import('../../src/lib/challenge-logic')
    expect(typeof mod.selectQuadrant).toBe('function')
  })

  it('selectQuadrant accepts stability + hasExample', async () => {
    const mod = await import('../../src/lib/challenge-logic')

    expect(['construction', 'recognition']).toContain(mod.selectQuadrant(1, false))
    expect(['construction', 'phonetics']).toContain(mod.selectQuadrant(10, false))
    expect(mod.selectQuadrant(20, false)).toBe('ghost_recall')
  })

  it('useFreeStudySession does not reference removed specialized selectors', () => {
    const source = readSourceFile('hooks/useFreeStudySession.ts')
    expect(source).not.toMatch(/selectQuadrantFreeStudy/)
    expect(source).not.toMatch(/selectQuadrantForMasteryWord/)
  })
})
