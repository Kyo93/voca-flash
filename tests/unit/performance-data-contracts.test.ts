import { describe, expect, it } from 'vitest'
import { projectFileExists, readProjectFile, readSourceFile } from './source-reader'

const MIGRATION_PATH = 'supabase/migrations/044_route_data_performance.sql'

describe('route data performance contracts', () => {
  it('uses scoped Study Prep RPC data instead of loading every SRS record for the user', () => {
    const hookSource = readSourceFile('hooks/useFlashcard.ts')
    const storageSource = readSourceFile('lib/storage/mastery.ts')

    expect(hookSource).toMatch(/fetchStudyPrepData/)
    expect(hookSource).not.toMatch(/fetchWords,\s*fetchSrsStates/)
    expect(storageSource).toMatch(/export async function fetchStudyPrepData/)
    expect(storageSource).toMatch(/supabase\.rpc\('get_study_prep_data'/)
  })

  it('loads roadmap detail through a single route-shaped RPC', () => {
    const hookSource = readSourceFile('hooks/useRoadmapTopics.ts')
    const storageSource = readSourceFile('lib/storage/roadmap.ts')

    expect(hookSource).toMatch(/fetchRoadmapDetailData/)
    expect(hookSource).not.toMatch(/fetchRoadmaps/)
    expect(hookSource).not.toMatch(/fetchRoadmapStats/)
    expect(hookSource).not.toMatch(/fetchTopicCompletionMap/)
    expect(hookSource).not.toMatch(/fetchResumePointers/)
    expect(storageSource).toMatch(/export async function fetchRoadmapDetailData/)
    expect(storageSource).toMatch(/supabase\.rpc\('get_roadmap_detail_data'/)
  })

  it('ships database RPCs and indexes for the hot roadmap and study paths', () => {
    expect(projectFileExists(MIGRATION_PATH)).toBe(true)
    const migration = readProjectFile(MIGRATION_PATH)

    expect(migration).toMatch(/CREATE EXTENSION IF NOT EXISTS pg_trgm/)
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION get_study_prep_data/)
    expect(migration).toMatch(/CREATE OR REPLACE FUNCTION get_roadmap_detail_data/)
    expect(migration).toMatch(/idx_topics_slug/)
    expect(migration).toMatch(/idx_topic_words_topic_sort_word/)
    expect(migration).toMatch(/idx_topic_words_word_topic/)
    expect(migration).toMatch(/idx_srs_user_word/)
    expect(migration).toMatch(/idx_srs_user_due_unmastered/)
    expect(migration).toMatch(/idx_words_word_trgm/)
    expect(migration).toMatch(/idx_words_definition_trgm/)
  })

  it('does not reload global Mastery stats for every search or filter change', () => {
    const source = readSourceFile('hooks/useMasteryWords.ts')
    const statsEffect = source.match(/\/\/ 2\. Fetch Stats[\s\S]*?\}, \[([^\]]*)\]\)/)?.[0] ?? ''

    expect(statsEffect).toMatch(/getMasteryStats/)
    expect(statsEffect).toMatch(/\[userId\]/)
    expect(statsEffect).not.toMatch(/debouncedSearch/)
    expect(statsEffect).not.toMatch(/activeFilter/)
    expect(statsEffect).not.toMatch(/advancedFilters/)
  })
})
