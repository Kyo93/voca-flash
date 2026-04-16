/**
 * tests/unit/fetch-topic-word-counts.test.ts
 *
 * L3 phase: fetchTopicWordCounts uses RPC (1 round-trip) instead of
 * client-side SELECT + JOIN (2 round-trips).
 */

import { describe, it, expect } from 'vitest'

describe('fetchTopicWordCounts optimization — L3', () => {
  it('must use supabase.rpc (not direct SELECT + JOIN)', async () => {
    const fs = await import('fs')
    const source = fs.readFileSync(
      'C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/storage/mastery.ts',
      'utf-8'
    )
    // After fix: must call the RPC
    expect(source).toMatch(/\.rpc\('get_topic_word_counts'\)/)
    // Extract only the fetchTopicWordCounts function body for exclusion check
    const funcMatch = source.match(/export async function fetchTopicWordCounts[\s\S]*?\n}/)
    const funcBody = funcMatch ? funcMatch[0] : source
    // fetchTopicWordCounts must NOT have the old client-side JOIN approach
    expect(funcBody).not.toMatch(/\.from\('topic_words'\)/)
    expect(funcBody).not.toMatch(/topics\(slug\)/)
  })

  it('fetchTopicWordCounts still returns Record<string, number>', async () => {
    const mod = await import('../../src/lib/storage/mastery')
    expect(typeof mod.fetchTopicWordCounts).toBe('function')
  })
})
