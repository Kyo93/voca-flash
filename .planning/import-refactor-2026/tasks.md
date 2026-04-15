# Implementation Checklist: Import Refactor

> Effort estimate: ~4 giờ (Option B: Guard + Context-Aware Auto-Create)
> All changes in `src/`

---

## Step 1 — Remove import button from WordsPage

**File:** `src/pages/admin/WordsPage.tsx`

- [ ] 1.1 Remove the `<button onClick={() => setShowImportModal(true)}>` import button block (header area, ~lines 179-185)
- [ ] 1.2 Remove the `showImportModal` state if no longer referenced anywhere in file
- [ ] 1.3 Remove the `ImportWordsModal` component usage (bottom of JSX, ~lines 503-509)
- [ ] 1.4 Verify: run `npm run build` or `npm run dev` — page loads, no import modal references remain
- [ ] **Verification:** WordsPage header no longer has "Nhập từ vựng" button

---

## Step 2 — Add slug utility + slug-unique generateUniqueSlug

**File:** `src/lib/import-parser.ts`

- [ ] 2.1 Export `slugify(name: string): string` — lowercase, replace spaces with `-`, strip special chars
  ```ts
  export function slugify(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
  ```
- [ ] 2.2 Add `generateUniqueSlug(base: string, existingSlugs: Set<string>): string`
  - If base not in existingSlugs → return base
  - Otherwise append `-1`, `-2`... until unique
- [ ] 2.3 Enhance `resolveTopics` to add slug fallback (see design.md for logic)
- [ ] **Verification:** `import-parser.ts` exports `slugify` and `generateUniqueSlug`; `resolveTopics` slug fallback works

---

## Step 3 — Add guard + roadmap label in ImportWordsModal

**File:** `src/components/admin/ImportWordsModal.tsx`

- [ ] 3.1 Update `Props` interface:
  - `roadmapId: string` (required, remove `?`)
  - Add `roadmapName: string` (new prop)
  - Keep `topics: Topic[]`
- [ ] 3.2 Update `ImportState` type — add `'no-roadmap'` state (or handle via inline conditional)
  - Better: keep state machine clean, use early return at top if `!roadmapId`
- [ ] 3.3 Add early-return UI when `!roadmapId`:
  - Show centered card with warning icon
  - Message: "Cần chọn Roadmap trước để nhập từ vựng"
  - CTA button → "Đi tới Roadmaps"
  - Render this instead of the normal upload UI (don't change state machine)
- [ ] 3.4 Add roadmap context label below header step label:
  ```tsx
  {roadmapId && (
    <p className="text-xs font-bold text-primary mt-1">
      📍 Đang nhập vào: {roadmapName}
    </p>
  )}
  ```
- [ ] 3.5 Fix auto-create topic in `handleParse`:
  ```ts
  // Replace roadmapId ?? null with explicit throw if missing
  roadmap_id: roadmapId ?? (() => { throw new Error('NO_ROADMAP_GUARD_FAILED') })(),
  ```
  Or use a guard before the create loop:
  ```ts
  if (!roadmapId) throw new Error('NO_ROADMAP_GUARD_FAILED')
  ```
- [ ] 3.6 In `handleParse`, call `generateUniqueSlug` before creating each missing topic:
  - Build `existingSlugs` Set from `topicMap.values().map(t => t.slug)`
  - For each unmatched topic name, generate unique slug before calling `createTopic`
- [ ] **Verification:**
  - ImportWordsModal with `roadmapId={undefined}` → shows guard warning UI
  - ImportWordsModal with `roadmapId="valid-id"` → shows "📍 Đang nhập vào: [name]" label
  - Import a CSV with new topic name from RoadmapSetupPage → topic gets correct roadmap_id

---

## Step 4 — Update RoadmapSetupPage to pass roadmapName

**File:** `src/pages/admin/RoadmapSetupPage.tsx`

- [ ] 4.1 Pass `roadmapName={roadmap?.name ?? ''}` to `<ImportWordsModal>`
- [ ] 4.2 Update `ImportWordsModal` usage — add `roadmapName` prop
- [ ] **Verification:** Import modal header shows correct roadmap name

---

## Step 5 — Verify all integration

- [ ] 5.1 Navigate to `/admin/roadmaps` → click any roadmap → verify "Nhập từ" button exists in WordPool
- [ ] 5.2 Open import modal → verify "📍 Đang nhập vào: [RoadmapName]" label visible
- [ ] 5.3 Import CSV with topic "Travel" (not existing) → verify topic created with correct roadmap_id
- [ ] 5.4 Import CSV with another new topic "Travel" → verify slugs are `travel` and `travel-1`
- [ ] 5.5 Navigate to `/admin/words` → verify no import button in header
- [ ] 5.6 Run `npm run build` → must succeed with no TypeScript errors

---

## Effort Summary

| Step | Description | Est. Time |
|------|-------------|-----------|
| 1 | Remove import button from WordsPage | 15 min |
| 2 | Slug utility + uniqueness logic | 30 min |
| 3 | Guard + roadmap label + auto-create fix | 90 min |
| 4 | Pass roadmapName to modal | 15 min |
| 5 | Integration verification | 30 min |
| **Total** | | **~4 giờ** |
