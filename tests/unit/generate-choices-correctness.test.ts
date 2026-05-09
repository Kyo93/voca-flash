import { describe, it, expect } from 'vitest'
import { generateChoices } from '../../src/lib/challenge-logic'
import { Word } from '../../src/lib/types'

describe('generateChoices Correctness (TDD)', () => {
  const mockWord: Word = {
    id: 'w1',
    word: 'Capital',
    definition: 'thá»§ Ä‘Ã´',
    phonetic: 'kap-i-tl',
    pos: 'noun',
    difficulty: 3,
    example: null,
    example_vi: null,
    image_url: null,
    image_position: null,
    created_at: '',
    updated_at: '',
  }

  it('ALWAYS includes the correct definition in the resulting choices', () => {
    const distractors = ['nÃ´ng thÃ´n', 'lÃ ng quÃª', 'tá»‰nh láº»']
    const result = generateChoices(mockWord, distractors)

    expect(result).toContain('thá»§ Ä‘Ã´')
    expect(result).toContain('nÃ´ng thÃ´n')
    expect(result.length).toBe(4)
  })

  it('includes exactly 4 choices when 3 distractors are provided', () => {
    const distractors = ['wrong1', 'wrong2', 'wrong3']
    const result = generateChoices(mockWord, distractors)
    expect(result.length).toBe(4)
  })

  it('falls back to hardcoded distractors if pool is empty', () => {
    const result = generateChoices(mockWord, [])
    expect(result).toContain('thá»§ Ä‘Ã´')
    expect(result.length).toBe(4)
  })
})
