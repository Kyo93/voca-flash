import { describe, it, expect } from 'vitest'
import { mapWordToCard } from '../../src/lib/storage/mastery'

describe('mapWordToCard', () => {
  it('should map the phonetic field correctly from DB shape to Card shape', () => {
    const dbWord = {
      id: 'test-id',
      word: 'dangerous',
      definition: 'likely to cause harm',
      phonetic: 'ˈdeɪndʒərəs',
      example: 'It is a dangerous road.',
      image_url: 'http://example.com/img.jpg',
      image_position: 'top',
      created_at: '2023-01-01T00:00:00Z',
      topics: { slug: 'travel' }
    }

    const card = mapWordToCard(dbWord, 'travel')

    expect(card.front).toBe('dangerous')
    expect(card.phonetic).toBe('ˈdeɪndʒərəs')
  })

  it('should fallback to undefined if phonetic is missing in DB word', () => {
    const dbWord = {
      id: 'test-id',
      word: 'safe',
      definition: 'not dangerous',
      phonetic: null,
      created_at: '2023-01-01T00:00:00Z'
    }

    const card = mapWordToCard(dbWord)
    expect(card.phonetic).toBeUndefined()
  })
})
