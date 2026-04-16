# Design: Topic Slug Uniqueness Per-Roadmap

## Context & Problem

### Current State

- `topics.slug` has a **global UNIQUE constraint** in the DB (`001_initial_schema.sql:24`)
- `generateUniqueSlug()` in `import-parser.ts` only checks slug uniqueness **within the importing roadmap's existing topics** — not cross-roadmap
- Migration 021 attempted to add `roadmap_slug-` prefix to existing topic slugs at DB level, but:
  1. The UI code (`ImportWordsModal`) does NOT generate roadmap-prefixed slugs when creating new topics
  2. So newly created topics after migration 021 still get bare slugs (`animals`) instead of `roadmap-slug-animals`
  3. This causes a **DB constraint violation** when two roadmaps create a topic with the same name

### Expected Behavior

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Import into Roadmap A → topic "Animals" | Topic created, slug = `roadmap-a-slug-animals` |
| 2 | Import into Roadmap B → topic "Animals" | Topic created, slug = `roadmap-b-slug-animals` (no conflict) |
| 3 | Both roadmaps have distinct topics with same name | ✅ |

### Word behavior is correct — no change needed

- `words` table has `ON CONFLICT (lower(word)) DO UPDATE` — words are deduplicated globally, case-insensitive
- This matches the user's expectation (words stay unique across roadmaps)

---

## Technical Approach

### Two-part fix:

**Part 1: DB migration** — Change `topics.slug` from globally unique to **unique per roadmap**
- Constraint: `UNIQUE (roadmap_id, slug)` instead of `UNIQUE (slug)`
- Null-safe: topics with `roadmap_id = NULL` can share slugs (no two NULLs are equal in PostgreSQL, so this is safe)
- Handles existing data: `roadmap_id` is never null for imported topics, so uniqueness is guaranteed

**Part 2: UI code fix** — Add roadmap slug prefix to newly created topic slugs
- `generateUniqueSlug()` receives `roadmapSlug` parameter
- Prefix format: `{roadmapSlug}-{baseSlug}` (e.g., `kids-animals`)
- Avoids collision even without the constraint, and makes slugs human-readable

---

## Proposed Changes

### 1. `supabase/migrations/024_topic_slug_unique_per_roadmap.sql` (new)

- Drop the old `UNIQUE` constraint on `topics.slug`
- Add composite `UNIQUE (roadmap_id, slug)`
- Since `roadmap_id` is NOT NULL for imported topics, this works correctly
- Old topics with migration 021 prefix (`roadmap-a-animals`) will already satisfy this new constraint
- No data migration needed

### 2. `src/lib/import-parser.ts` — `generateUniqueSlug()`

```typescript
// Signature change: add roadmapSlug optional parameter
export function generateUniqueSlug(
  base: string,
  existingSlugs: Set<string>,
  roadmapSlug?: string
): string {
  // Prefix with roadmap slug to avoid cross-roadmap collisions
  const prefixed = roadmapSlug ? `${roadmapSlug}-${base}` : base
  if (!existingSlugs.has(prefixed)) return prefixed
  let i = 1
  while (existingSlugs.has(`${prefixed}-${i}`)) i++
  return `${prefixed}-${i}`
}
```

### 3. `src/components/admin/ImportWordsModal.tsx` — `handleParse`

- Get `roadmapSlug` from `roadmapId` (via `getRoadmapById` or cached)
- Pass `roadmapSlug` to `generateUniqueSlug()`
- `existingSlugs` still built from current roadmap's topic map (correct)

---

## Verification Plan

| Step | What to test |
|------|-------------|
| 1 | Run migration 024 — verify no error, topics table unchanged |
| 2 | Import CSV with topic "Animals" into Roadmap A → slug = `{ra-slug}-animals` |
| 3 | Import CSV with topic "Animals" into Roadmap B (same name) → slug = `{rb-slug}-animals`, no error |
| 4 | Verify words are still deduplicated (same 2 words in DB) |
| 5 | Verify each roadmap's topic list shows the correct topic with different slugs |
| 6 | Verify both topics still link to the same 2 words via `topic_words` |

---

## Out of Scope

- Changes to `TopicFormModal` (admin UI topic creation) — same fix needed there, but separate task
- Changes to `words` table or word dedup logic — working correctly
- Backwards migration / rollback of migration 021 slug prefixes — not needed