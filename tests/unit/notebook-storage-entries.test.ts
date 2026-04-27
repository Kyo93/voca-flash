import { beforeEach, describe, expect, it, vi } from 'vitest'

const order = vi.fn()
const eq = vi.fn()
const select = vi.fn()
const from = vi.fn()

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from,
  },
}))

describe('notebook storage entries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    order.mockResolvedValue({
      data: [
        {
          id: 'note-1',
          user_id: 'user-1',
          word_id: 'word-1',
          personal_note: 'My anchor note',
          created_at: '2026-04-20T00:00:00.000Z',
          updated_at: '2026-04-25T00:00:00.000Z',
          word: {
            id: 'word-1',
            word: 'anchor',
            definition: 'to make something steady',
            phonetic: '/anchor/',
            pos: 'verb',
            difficulty: 5,
            synonyms: ['steady', 'secure'],
            antonyms: ['loosen'],
            word_family: ['anchor', 'anchored', 'anchoring'],
            image_url: null,
            example: 'This image anchors the memory.',
            example_vi: 'Hinh anh nay giup neo tri nho.',
            created_at: '2026-04-11T00:00:00.000Z',
            updated_at: '2026-04-11T00:00:00.000Z',
          },
        },
      ],
      error: null,
    })
    eq.mockReturnValue({ order })
    select.mockReturnValue({ eq })
    from.mockReturnValue({ select })
  })

  it('fetches saved notebook entries with joined vocabulary details', async () => {
    const { fetchNotebookWordEntries } = await import('../../src/lib/storage/notebook')

    const result = await fetchNotebookWordEntries('user-1')

    expect(from).toHaveBeenCalledWith('user_notebook_entries')
    const selectShape = select.mock.calls[0]?.[0] as string
    expect(selectShape).toContain('word:words')
    expect(selectShape).toContain('definition')
    expect(selectShape).toContain('example')
    expect(selectShape).toContain('synonyms')
    expect(selectShape).toContain('antonyms')
    expect(selectShape).toContain('word_family')
    expect(selectShape).toContain('difficulty')
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false })
    expect(result).toHaveLength(1)
    expect(result[0].word?.word).toBe('anchor')
    expect(result[0].word?.difficulty).toBe(5)
    expect(result[0].word?.word_family).toContain('anchored')
  })
})
