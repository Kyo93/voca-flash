import { describe, it, expect } from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

const SRC = path.resolve(__dirname, '../../src')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8')
}

describe('Quiz Timer Bug — useEffect race condition', () => {
  it('Initialization effect (READY_FOR_QUIZ) must NOT contain setInterval', () => {
    const source = readFile('hooks/useStudySessionMode.ts')
    
    // Look for the block that starts the challenge (READY_FOR_QUIZ -> CHALLENGING)
    const initEffectMatch = source.match(/\/\/ 1\. Challenge Initialization Effect[\s\S]*?useEffect\(\(\) => \{([\s\S]*?)\}\s*,\s*\[[\s\S]*?phase[\s\S]*?\]\)/)
    
    if (!initEffectMatch) {
        throw new Error('Could not find the Initialization Effect comment and block.')
    }
    
    const body = initEffectMatch[1]
    const hasSetPhase = body.includes("setPhase('CHALLENGING')")
    const hasSetInterval = body.includes("setInterval")
    
    expect(hasSetPhase, 'Initialization effect should handle the phase transition').toBe(true)
    expect(hasSetInterval, `Initialization effect matched:\n${body}\n\nIt should NOT contain setInterval`).toBe(false)
  })

  it('Timer effect (CHALLENGING) must contain setInterval', () => {
    const source = readFile('hooks/useStudySessionMode.ts')
    
    // Look for the active timer block
    const timerEffectMatch = source.match(/\/\/ 2\. Active Challenge Timer Effect[\s\S]*?useEffect\(\(\) => \{([\s\S]*?)\}\s*,\s*\[[\s\S]*?phase[\s\S]*?\]\)/)
    
    if (!timerEffectMatch) {
        throw new Error('Could not find the Active Challenge Timer Effect comment and block.')
    }
    
    const body = timerEffectMatch[1]
    const hasSetInterval = body.includes("setInterval")
    
    expect(hasSetInterval, 'Timer effect must contain setInterval').toBe(true)
  })
})
