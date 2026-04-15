# Design: Import Refactor — Context-Aware Vocabulary Import

## Context & Technical Approach

### Problem
Topic model now requires `roadmap_id` (NOT NULL). ImportWordsModal auto-creates topics with `roadmap_id: roadmapId ?? null`, causing:
- Orphan topics when `roadmapId` is undefined
- Topics accidentally landing in "300 từ tiếng Anh cơ bản" (first roadmap by default)
- Duplicate slug generation (no uniqueness check)

### Approach
Implement **Option B** from brainstorm: Guard + Context-Aware Auto-Create.

Core principle: **Import always lives in the context of a specific Roadmap.** The only page with guaranteed roadmap context is `RoadmapSetupPage` (`/admin/roadmaps/:roadmapId`). We will:
1. Remove the import button from WordsPage entirely (no global import)
2. Keep/enhance the import button in RoadmapSetupPage's WordPool
3. Add guard in ImportWordsModal: if no `roadmapId` → show warning, no upload
4. Auto-create topics always set `roadmap_id = roadmapId` (guaranteed by page context)
5. Add slug uniqueness suffix logic

---

## Proposed Changes

### 1. `src/pages/admin/WordsPage.tsx`
- **Remove** the "Nhập từ vựng" import button from the page header (lines ~179-185)
- Remove import of `ImportWordsModal` if no longer used elsewhere in this file
- (Optional) Add small hint text: "Để nhập từ vựng, vào trang Roadmap tương ứng"

### 2. `src/components/admin/ImportWordsModal.tsx`
**Guard — Step 0 (new state 'no-roadmap'):**
- When `!roadmapId` prop → show a centered warning instead of the upload UI
- Message: "Cần chọn Roadmap trước để nhập từ vựng. Vui lòng vào trang Roadmap."
- CTA button → link or navigate to `/admin/roadmaps`
- State machine: `'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error' | 'no-roadmap'`

**Roadmap context label (steps 1-3):**
- Add label below header: `roadmapId ? "Đang nhập vào: [Roadmap Name]" : ""`
- Pass `roadmapName` prop to display the name

**Auto-create topic fix:**
```ts
// Before (BUG):
roadmap_id: roadmapId ?? null,

// After (FIX):
roadmap_id: roadmapId ?? (() => { throw new Error('NO_ROADMAP') })(),
```
The guard above ensures `roadmapId` is never null at this point. Still keep the explicit check.

**Slug uniqueness:**
- Before calling `createTopic`, check if slug already exists in `topicMap`
- If duplicate: append `-1`, `-2`, etc. until unique
```ts
function generateUniqueSlug(base: string, existingSlugs: Set<string>): string {
  if (!existingSlugs.has(base)) return base
  let i = 1
  while (existingSlugs.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}
```

### 3. `src/lib/import-parser.ts`
**resolveTopics — add slug fallback:**
```ts
// Current: match by name only
// Enhanced: if name not found, try slug match
for (const name of topicNames) {
  const lower = name.toLowerCase()
  let found: Topic | undefined
  // Try exact name match
  for (const [, topic] of topicMap) {
    if (topic.name.toLowerCase() === lower) { found = topic; break }
  }
  // Try slug match as fallback
  if (!found) {
    const slugAttempt = lower.replace(/\s+/g, '-')
    for (const [, topic] of topicMap) {
      if (topic.slug === slugAttempt) { found = topic; break }
    }
  }
  if (found) topicIds.push(found.id)
  else unmatched.push(name)
}
```

**Slug generation utility (export for use in modal):**
```ts
export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
```

### 4. `src/pages/admin/RoadmapSetupPage.tsx`
- Pass `roadmapName` to `ImportWordsModal`
- `ImportWordsModal` receives new props: `roadmapName: string`

---

## Props Changes

### ImportWordsModal props
| Prop | Before | After |
|---|---|---|
| `roadmapId` | optional | **required** (no longer `?`) |
| `roadmapName` | — | **new** `string` |
| `topics` | `Topic[]` | unchanged |

---

## Verification

1. **Orphan topic prevention:** Import a CSV with a new topic name from RoadmapSetupPage → verify topic was created with correct `roadmap_id` in DB
2. **Slug uniqueness:** Import twice a CSV with same topic name → verify slugs are `travel` and `travel-1`
3. **No-roadmap guard:** Directly render ImportWordsModal with `roadmapId={undefined}` → verify warning UI appears
4. **WordsPage:** Verify import button is gone, page still loads and works
5. **Breadcrumb context:** After import, breadcrumb shows correct roadmap name
