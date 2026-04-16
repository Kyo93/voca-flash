/**
 * tests/unit/review-challenge-type.test.ts
 *
 * RED phase: useReviewSession.ts không nên định nghĩa ReviewChallenge riêng.
 * Nên re-export từ challenge-logic.ts — single source of truth.
 */

import { describe, it, expect } from 'vitest'
import path from 'path'

const SRC_ROOT = path.resolve(__dirname, '../../src')

describe('ReviewChallenge type — RED', () => {
  it('useReviewSession.ts must NOT redefine ReviewChallenge interface', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      path.join(SRC_ROOT, 'hooks/useReviewSession.ts'),
      'utf-8'
    )
    // After fix: should NOT have "interface ReviewChallenge" in useReviewSession.ts
    expect(source).not.toMatch(/interface ReviewChallenge/)
  })

  it('challenge-logic.ts must export ReviewChallenge type', async () => {
    // TypeScript types are erased at runtime — verify via source instead
    const fs = await import('fs')
    const source = fs.readFileSync(
      path.join(SRC_ROOT, 'lib/challenge-logic.ts'),
      'utf-8'
    )
    expect(source).toMatch(/export\s+(interface|type)\s+ReviewChallenge/)
  })

  it('useReviewSession must import ReviewChallenge from challenge-logic', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      path.join(SRC_ROOT, 'hooks/useReviewSession.ts'),
      'utf-8'
    )
    // Should import ReviewChallenge from challenge-logic
    expect(source).toMatch(/import.*ReviewChallenge.*from.*challenge-logic/)
  })

  it('QuadrantType must be imported from challenge-logic in useReviewSession', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      path.join(SRC_ROOT, 'hooks/useReviewSession.ts'),
      'utf-8'
    )
    // After fix: should have QuadrantType import (needed for the type)
    expect(source).toMatch(/import.*QuadrantType.*from.*challenge-logic/)
  })
})