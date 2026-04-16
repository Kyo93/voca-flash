# Implementation Checklist: Topic Slug Uniqueness Per-Roadmap

## Task 1: Database Migration

- [x] **1.1** Create `supabase/migrations/024_topic_slug_unique_per_roadmap.sql`
  - Drop `UNIQUE` constraint on `topics.slug` (find constraint name via `pg_get_constraintdef` or from migration logs)
  - Add `UNIQUE (roadmap_id, slug)` constraint to `topics` table
  - Add `NOT NULL` to `roadmap_id` column (safety — already enforced by FK, but explicit makes intent clear)
  - Fire `NOTIFY pgrst, 'reload schema'`
- [x] **1.2** Run migration against local Supabase (`mcp__supabase__apply_migration`)

## Task 2: Frontend — `import-parser.ts`

- [x] **2.1** Update `generateUniqueSlug()` signature — add `roadmapSlug?: string` parameter
- [x] **2.2** Prepend `roadmapSlug-` prefix to base slug when parameter is provided
- [x] **2.3** Verify all existing calls to `generateUniqueSlug()` still work (no breaking change for callers that don't pass the new param)

## Task 3: Frontend — `ImportWordsModal.tsx`

- [x] **3.1** Fetch roadmap slug from `roadmapId` (use `getRoadmapById()` from `admin-queries.ts`)
- [x] **3.2** Pass `roadmapSlug` to `generateUniqueSlug()` call in `handleParse`
- [x] **3.3** Update `existingSlugs` build to account for new prefixed format
- [x] **3.4** TypeScript: update `generateUniqueSlug` import signature if needed

## Task 4: Verification

- [x] **4.1** Import test: Create Roadmap A, import CSV with topic "Animals" → verify slug = `{ra-slug}-animals`
- [x] **4.2** Import test: Create Roadmap B, import CSV with same topic name "Animals" → verify slug = `{rb-slug}-animals`, no DB error
- [x] **4.3** Verify words: same 2 words in DB (case-insensitive dedup), each linked to respective topic via `topic_words`
- [x] **4.4** UI check: Topics list in each roadmap shows the correct topic with distinct slugs
- [x] **4.5** Study page: Both topics work correctly in study flow (topic slug in URL, topic_id linking)

## Verification Commands

```sql
-- After migration: verify constraint exists
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'topics'::regclass AND contype = 'u';

-- After import: verify topics per roadmap
SELECT roadmap_id, slug, name FROM topics WHERE slug LIKE '%animals%';

-- After import: verify words still deduplicated
SELECT word, COUNT(*) FROM words GROUP BY word HAVING COUNT(*) > 1;
```