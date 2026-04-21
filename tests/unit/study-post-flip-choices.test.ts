import { describe, it, expect } from 'vitest'
import { generateChoices } from '../../src/lib/challenge-logic'
import type { Word } from '../../src/lib/types'

const mockWord: Word = {
  id: '1',
  word: 'remember',
  phonetic: '/rɪˈmembər/',
  pos: 'verb',
  definition: 'ghi nhớ, nhớ lại',
  example: 'I need to remember this word.',
  example_vi: 'Tôi cần nhớ từ này.',
  image_url: null,
  image_position: null,
  tags: [],
  roadmap_id: null,
  topic_id: null,
}

describe('generateChoices', () => {
  it('trả về đúng 4 items', () => {
    const choices = generateChoices(mockWord)
    expect(choices).toHaveLength(4)
  })

  it('definition đúng nằm trong choices', () => {
    const choices = generateChoices(mockWord)
    expect(choices).toContain(mockWord.definition)
  })

  it('4 items không trùng nhau', () => {
    const choices = generateChoices(mockWord)
    const unique = new Set(choices)
    expect(unique.size).toBe(4)
  })

  it('word definition trùng với distractor → chỉ xuất hiện 1 lần', () => {
    const wordWithDistractorDef = {
      ...mockWord,
      definition: 'để nhớ lại điều gì đó',
    }
    const choices = generateChoices(wordWithDistractorDef)
    const count = choices.filter(c => c === wordWithDistractorDef.definition)
    expect(count.length).toBe(1)
  })
})