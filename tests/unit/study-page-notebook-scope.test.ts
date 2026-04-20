/**
 * RED TEST — StudyPage Notebook Scoping
 * ======================================
 * Bug: ReferenceError in FlashcardBack component.
 * It tries to access 'isDrawerOpen', 'setIsDrawerOpen', etc. which are 
 * NOT in its local scope or props.
 * 
 * Run: npm test -- tests/unit/study-page-notebook-scope.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('StudyPage — Scoping Verification', () => {
  it('FlashcardBack must NOT reference isDrawerOpen directly (it is a scope error)', () => {
    const source = readFile('pages/StudyPage.tsx')
    
    // Find the definition of FlashcardBack
    const fbStart = source.indexOf('function FlashcardBack')
    const fbEnd = source.indexOf('function StudyComplete')
    const fbContent = source.substring(fbStart, fbEnd)

    // CHECK: FlashcardBack props
    const propsMatch = fbContent.match(/FlashcardBack\(\{([\s\S]*?)\}\)/)
    const props = propsMatch ? propsMatch[1] : ''
    
    // Variables used in JSX but missing from props
    const sensitiveVars = [
      'isDrawerOpen',
      'setIsDrawerOpen',
      'setPendingWordId',
      'handleSaveNote',
      'getNote'
    ]

    sensitiveVars.forEach(v => {
      // If variable is used in content but NOT defined as a prop in FlashcardBack, it's a bug
      if (fbContent.includes(v)) {
        expect(props).toContain(v)
      }
    })
  })
})
