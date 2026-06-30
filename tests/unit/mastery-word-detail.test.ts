import { beforeEach, describe, expect, it, vi } from 'vitest'

const maybeSingle = vi.fn()
const eq = vi.fn()
const select = vi.fn()
const from = vi.fn()

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from,
  },
}))

describe('getMasteryWordDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    maybeSingle.mockResolvedValue({
      data: {
        id: 'word-1',
        pos: 'verb',
        difficulty: 4,
        example_vi: 'Neo ký ức lại.',
        image_position: 'top',
        synonyms: ['steady', 'secure'],
        antonyms: null,
        word_family: ['anchor', 'anchored'],
        tags: ['memory'],
      },
      error: null,
    })
    eq.mockReturnValue({ maybeSingle })
    select.mockReturnValue({ eq })
    from.mockReturnValue({ select })
  })

  it('fetches and normalizes rich word detail fields for mobile dossier', async () => {
    const { getMasteryWordDetail } = await import('../../src/lib/storage/mastery')

    const result = await getMasteryWordDetail('word-1')

    expect(from).toHaveBeenCalledWith('words')
    const selectShape = select.mock.calls[0]?.[0] as string
    expect(selectShape).toContain('pos')
    expect(selectShape).toContain('difficulty')
    expect(selectShape).toContain('example_vi')
    expect(selectShape).toContain('image_position')
    expect(selectShape).toContain('synonyms')
    expect(selectShape).toContain('antonyms')
    expect(selectShape).toContain('word_family')
    expect(eq).toHaveBeenCalledWith('id', 'word-1')
    expect(maybeSingle).toHaveBeenCalled()
    expect(result).toEqual({
      word_id: 'word-1',
      pos: 'verb',
      difficulty: 4,
      example_vi: 'Neo ký ức lại.',
      image_position: 'top',
      synonyms: ['steady', 'secure'],
      antonyms: [],
      word_family: ['anchor', 'anchored'],
      tags: ['memory'],
    })
  })

  it('returns null when detail lookup fails', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })
    const { getMasteryWordDetail } = await import('../../src/lib/storage/mastery')

    await expect(getMasteryWordDetail('missing-word')).resolves.toBeNull()
  })
})
