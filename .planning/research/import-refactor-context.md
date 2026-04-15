# Research: Import Refactor Context

## Current Import Locations
- **WordsPage** (`src/pages/admin/WordsPage.tsx`): Header button "Nhập từ vựng" → opens `ImportWordsModal` with `roadmapId={selectedRoadmap?.id ?? undefined}`
- **RoadmapSetupPage** (`src/pages/admin/RoadmapSetupPage.tsx`): "Nhập từ" button in `WordPool` → opens `ImportWordsModal` with `roadmapId={roadmapId}`

## The Bug (Root Cause)
`ImportWordsModal.handleParse` (line 84-105):
```ts
// BUG: roadmapId can be undefined → topic gets roadmap_id = null (ORPHAN)
const { data, error } = await createTopic({
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  roadmap_id: roadmapId ?? null,  // ← NULL when roadmapId undefined
  ...
})
```

Slug gen: `name.toLowerCase().replace(/\s+/g, '-')` — no uniqueness check → duplicate slug possible.

## Topic ↔ Roadmap Relationship
- `Topic.roadmap_id` is NOT NULL in DB (enforced at model level)
- Roadmap "300 từ tiếng Anh cơ bản" is one of the default roadmaps
- Topic can have same name across different roadmaps (different slug)
- `resolveTopics` in `import-parser.ts` only matches by `name.toLowerCase()`, not slug

## Option B Changes Needed
1. **Guard:** If `!roadmapId` → show inline warning, disable upload
2. **Auto-create:** Always set `roadmap_id = roadmapId` (never null)
3. **Slug uniqueness:** Check existing slugs in page topics, append `-1`, `-2` if duplicate
4. **UI:** Show "Importing into: [RoadmapName]" label from step 1
5. **Remove:** Delete import button from WordsPage header

## Files to Change
- `src/components/admin/ImportWordsModal.tsx`
- `src/pages/admin/WordsPage.tsx`
- `src/lib/import-parser.ts` (slug gen + resolveTopics)
