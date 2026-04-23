import { describe, it, expect } from 'vitest'
import { generateChoices } from '../../src/lib/challenge-logic'
import { Word } from '../../src/lib/types'

describe('generateChoices Correctness (TDD)', () => {
  const mockWord: Word = {
    id: 'w1',
    word: 'Capital',
    definition: 'thủ đô',
    phonetic: 'kap-i-tl',
    pos: 'noun',
    difficulty: 3,
    created_at: '',
    updated_at: ''
  }

  it('ALWAYS includes the correct definition in the resulting choices', () => {
    // Scenario: Database provides 3 distractors, but NO correct definition
    const distractors = ['nông thôn', 'làng quê', 'tỉnh lẻ']
    
    // This is what useReviewSession currently does (buggy)
    // const choices = distractors.length >= 3 ? distractors : generateChoices(mockWord)
    
    // Proposed fix: useReviewSession should call generateChoices(word, distractors)
    const result = generateChoices(mockWord, distractors as any)
    
    expect(result).toContain('thủ đô')
    expect(result).toContain('nông thôn') // Should use provided distractors
    expect(result.length).toBe(4) // 1 correct + 3 distractors
  })

  it('includes exactly 4 choices when 3 distractors are provided', () => {
    const distractors = ['wrong1', 'wrong2', 'wrong3']
    const result = generateChoices(mockWord, distractors as any)
    expect(result.length).toBe(4)
  })

  it('falls back to hardcoded distractors if pool is empty', () => {
    const result = generateChoices(mockWord, [])
    expect(result).toContain('thủ đô')
    expect(result.length).toBe(4)
  })
})
