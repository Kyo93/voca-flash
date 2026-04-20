# Implementation Checklist: Clean Code Fixes — Voca-flash

> Run `npm test` AND `npm run build` after every task group. All must pass before moving on.

---

## Phase 1: Constants & Magic Numbers (Quick wins — ~10 min)

### 1.1 Extract PAGE_SIZE to constants
- [ ] Open `src/lib/constants.ts`
- [ ] Add: `export const FETCH_PAGE_SIZE = 1000`
- [ ] Open `src/lib/storage/session.ts`
- [ ] Replace `const PAGE_SIZE = 1000` with `import { FETCH_PAGE_SIZE } from '../constants'`
- [ ] Verify: `npm run build` passes

### 1.2 Fix hardcoded `21` in srs.ts
- [ ] Open `src/lib/srs.ts`
- [ ] Add `SRS_STABILITY_LEVELS` to existing import from `./constants`
- [ ] Line 45: Replace `>= 21` with `>= SRS_STABILITY_LEVELS.MASTERED`
- [ ] Verify: `npm test` passes

---

## Phase 2: Dead Code Removal (~5 min)

### 2.1 Remove unused `wordIds` in admin-queries.ts
- [ ] Open `src/lib/admin-queries.ts`
- [ ] Locate `getWordsWithTopicsByRoadmap` function
- [ ] Remove lines 185–192: `let wordIds: string[] = []`, its assignment, and `void (wordIds)`
- [ ] Keep the `junctionMap` logic — it correctly enriches words with topicIds
- [ ] Verify: `npm run build` passes

### 2.2 Remove duplicate keywords in tag-engine.ts
- [ ] Open `src/lib/tag-engine.ts`
- [ ] Line 154: Remove one duplicate `'justice'` in the law tag array
- [ ] Line 206: Remove one duplicate `'colleague'` in the relationship tag array
- [ ] Verify: `npm run build` passes

---

## Phase 3: DRY — Extract Shared Logic (~15 min)

### 3.1 Extract normalizeParsedRows in import-parser.ts
- [ ] Open `src/lib/import-parser.ts`
- [ ] Add new helper function after `parseRawValue`:
  ```ts
  function normalizeParsedRows(parsedData: Record<string, unknown>[]): RawRow[] {
    return parsedData.map(row => {
      const normalized: Record<string, string> = {}
      for (const [key, val] of Object.entries(row)) {
        normalized[key] = parseRawValue(val)
      }
      return normalized as unknown as RawRow
    })
  }
  ```
- [ ] Replace the duplication in `parseCSV` (lines 78–84): use `normalizeParsedRows(results.data as ...)`
- [ ] Replace the duplication in `parseGoogleSheetsUrl` (lines 142–148): use `normalizeParsedRows(results.data)`
- [ ] Verify: `npm run build` + `npm test` pass

### 3.2 Move generateUniqueSlug to utils.ts
- [ ] Open `src/lib/utils.ts`
- [ ] Add `generateUniqueSlug` function from import-parser.ts (lines 182–192)
- [ ] Open `src/lib/import-parser.ts`
- [ ] Remove the `generateUniqueSlug` function
- [ ] Add to existing `import { slugify } from './utils'`: `import { slugify, generateUniqueSlug } from './utils'`
- [ ] Open `src/components/admin/TopicFormModal.tsx`
- [ ] Remove local `slugify` function (lines 4–13)
- [ ] Add `generateUniqueSlug` to existing imports from `../../lib/utils`
- [ ] Verify: `npm run build` + `npm test` pass

---

## Phase 4: Type Safety (~5 min)

### 4.1 Remove `as any` in WordFormModal.tsx
- [ ] Open `src/components/admin/WordFormModal.tsx`
- [ ] Lines 69–71: Remove `as any` casts:
  ```tsx
  // BEFORE:
  setSynonyms((word as any).synonyms?.join(', ') ?? '')
  setAntonyms((word as any).antonyms?.join(', ') ?? '')
  setWordFamily((word as any).word_family?.join(', ') ?? '')

  // AFTER:
  setSynonyms(word?.synonyms?.join(', ') ?? '')
  setAntonyms(word?.antonyms?.join(', ') ?? '')
  setWordFamily(word?.word_family?.join(', ') ?? '')
  ```
- [ ] Verify: `npm run build` passes

### 4.2 Fix getTodayBoundary import in streak.ts
- [ ] Open `src/lib/streak.ts`
- [ ] Check: `getTodayBoundary` is imported from `supabase-storage` but defined in `session.ts`
- [ ] Fix import to point to `session.ts` where it is defined: `import { getTodayBoundary } from './storage/session'`
- [ ] Verify: `npm run build` passes

---

## Phase 5: Verification (~10 min)

- [ ] Run `npm run build` — must compile without errors
- [ ] Run `npm test` — all 44+ tests must pass
- [ ] Manual smoke test:
  - [ ] Admin: Import CSV words (test import-parser)
  - [ ] Admin: Create topic (test TopicFormModal)
  - [ ] Admin: Edit word (test WordFormModal)
  - [ ] User: Study session (test SRS/storage)
- [ ] Update `.cm/CONTINUITY.md` — mark active goal complete, archive this plan

---

## Commit Strategy

Create one commit per phase group:
```
clean: extract magic numbers in srs.ts and session.ts
clean: remove dead code in admin-queries.ts and tag-engine.ts
clean: apply DRY — extract shared row normalization to import-parser
clean: extract generateUniqueSlug to utils.ts (DRY)
clean: remove as any casts in WordFormModal.tsx
clean: fix getTodayBoundary import in streak.ts
```
