import { describe, it, expect } from 'vitest'
import { readSourceFile, readSourceFunction } from './source-reader'

describe('fetchTopicWordCounts optimization', () => {
  it('uses supabase.rpc instead of direct SELECT + JOIN', () => {
    const source = readSourceFile('lib/storage/mastery.ts')
    expect(source).toMatch(/\.rpc\('get_topic_word_counts'\)/)

    const funcBody = readSourceFunction('lib/storage/mastery.ts', 'fetchTopicWordCounts')
    expect(funcBody).not.toMatch(/\.from\('topic_words'\)/)
    expect(funcBody).not.toMatch(/topics\(slug\)/)
  })

  it('still returns Record<string, number>', async () => {
    const mod = await import('../../src/lib/storage/mastery')
    expect(typeof mod.fetchTopicWordCounts).toBe('function')
  })
})
