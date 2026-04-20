# Design: Clean Code Fixes — Voca-flash

## Context

Sau khi chạy cm-clean-code scan toàn bộ codebase Voca-flash, phát hiện một số code smells cần fix. Tất cả đều là **low-to-medium risk refactor** — không thay đổi behavior, chỉ cải thiện code quality, maintainability.

## Technical Approach

**Nguyên tắc áp dụng:**
- TRIZ #2 (Taking Out): Tách logic trùng lặp
- TRIZ #6 (Universality): Mỗi function một mục đích
- TRIZ #10 (Prior Action): Dọn dẹp trước khi nó thối rữa

**Risk strategy:** Fix từng nhóm nhỏ, chạy tests sau mỗi lần change để verify không break behavior.

---

## Proposed Changes

### Group A: Magic Numbers → Constants (Quick wins, 0 risk)

#### A1. `src/lib/srs.ts:45` — Hardcoded mastered threshold
```ts
// BEFORE
const isMasteredStatus = update.stability >= 21

// AFTER
import { SRS_STABILITY_LEVELS } from './constants'
const isMasteredStatus = update.stability >= SRS_STABILITY_LEVELS.MASTERED  // 21
```

#### A2. `src/lib/storage/session.ts:6` — Hardcoded PAGE_SIZE
```ts
// BEFORE
const PAGE_SIZE = 1000  // Magic number inline

// AFTER: Add to constants.ts
export const FETCH_PAGE_SIZE = 1000

// Then import in session.ts
import { FETCH_PAGE_SIZE } from '../lib/constants'
```

**Verification:** Run existing tests — no behavior change expected.

---

### Group B: Dead Code Removal (Risk-free cleanup)

#### B1. `src/lib/admin-queries.ts:185-192` — Remove unused `wordIds` variable
```ts
// BEFORE
let wordIds: string[] = [] // TODO: used for uncategorized word filtering — wire up in future
// ... code that builds wordIds ...
if (topicIds.length > 0 && junctions.length > 0) {
  wordIds = [...new Set(junctions.map(j => j.word_id))]
}
void (wordIds) // TODO(M2): wire up uncategorized word filtering

// AFTER: Simplify — remove unused variable
// The function returns all words and enriches with junctionMap (correct behavior)
// wordIds was dead code for uncategorized filtering that was never wired
```

#### B2. `src/lib/tag-engine.ts` — Remove duplicate keyword entries
```ts
// Line 154: 'justice' duplicated
['law', [..., 'justice', 'justice', ...]]

// Line 206: 'colleague' duplicated
['relationship', [..., 'colleague', 'colleague', ...]]

// AFTER: Remove duplicates, keep one of each
```

**Verification:** Tag matching behavior unchanged, just cleaner keyword lists.

---

### Group C: DRY Violations — Extract Shared Logic

#### C1. `src/lib/import-parser.ts` — Extract row normalization duplication

Lines 78–84 and 142–147 are nearly identical:

```ts
// EXTRACT to helper function:
function normalizeParsedRows(parsedData: Record<string, unknown>[]): RawRow[] {
  return parsedData.map(row => {
    const normalized: Record<string, string> = {}
    for (const [key, val] of Object.entries(row)) {
      normalized[key] = parseRawValue(val)  // key already normalized via transformHeader
    }
    return normalized as unknown as RawRow
  })
}

// REPLACE usages:
const rows = normalizeParsedRows(results.data as Record<string, unknown>[])
```

This appears in both `parseCSV()` (line 78) and `parseGoogleSheetsUrl()` (line 142).

#### C2. `src/components/admin/TopicFormModal.tsx` — Move `generateUniqueSlug` to utils.ts

The function at `TopicFormModal.tsx` (lines 4–13, local `slugify`) and `import-parser.ts` (lines 182–192) duplicate logic. Move to `utils.ts` and import in both places.

```ts
// utils.ts — ADD:
/**
 * Generate a slug that is unique within existingSlugs.
 * If roadmapSlug is provided, prefix the slug with "roadmapSlug-" to avoid
 * cross-roadmap collisions.
 * If base slug is not taken → return it.
 * Otherwise append -1, -2, ... until unique.
 */
export function generateUniqueSlug(
  base: string,
  existingSlugs: Set<string>,
  roadmapSlug?: string,
): string {
  const prefixed = roadmapSlug ? `${roadmapSlug}-${base}` : base
  if (!existingSlugs.has(prefixed)) return prefixed
  let i = 1
  while (existingSlugs.has(`${prefixed}-${i}`)) i++
  return `${prefixed}-${i}`
}

// import-parser.ts — REPLACE import:
import { slugify, generateUniqueSlug } from './utils'

// TopicFormModal.tsx — REPLACE:
import { slugify, generateUniqueSlug } from '../../lib/utils'
// Remove local slugify function
```

#### C3. `src/lib/storage/session.ts` — Fix `getTodayBoundary` import

`getTodayBoundary` is imported from `supabase-storage` but defined in `session.ts`. Import should come from the definition file directly.

```ts
// session.ts already has getTodayBoundary defined (line 177)
// streak.ts imports it from supabase-storage — verify and fix
```

---

### Group D: Type Safety Improvements

#### D1. `src/components/admin/WordFormModal.tsx` — Remove `as any` casts

```ts
// BEFORE
setSynonyms((word as any).synonyms?.join(', ') ?? '')

// AFTER: The Word interface already has synonyms/antonyms/word_family
// word prop is typed as Word | null — no cast needed if interface is complete
// Just ensure the cast is removed if interface is correct:
setSynonyms(word?.synonyms?.join(', ') ?? '')
```

Verify `Word` interface includes these fields first (it does — types.ts lines 44-46).

**Verification:** Build must succeed after changes.

---

## Verification Strategy

```
After each Group fix:
  1. npm run build (TypeScript compile check)
  2. npm test (existing tests must pass)
  3. Manual smoke test on affected feature
```

**Test files to verify stability:**
- `tests/unit/srs-boundary.test.ts` — SRS state machine
- `tests/unit/upsert-srs-record.test.ts` — Storage upsert
- `tests/unit/import-parser-normalization.test.ts` — Parser
- `tests/unit/tts.test.ts` — Tag engine indirectly via import

---

## Files Changed

| File | Change Type | Risk |
|------|-------------|------|
| `src/lib/srs.ts` | Magic number → constant | Low |
| `src/lib/storage/session.ts` | Magic number → constant | Low |
| `src/lib/constants.ts` | Add FETCH_PAGE_SIZE | Low |
| `src/lib/admin-queries.ts` | Remove dead code | Low |
| `src/lib/tag-engine.ts` | Remove duplicate keywords | Low |
| `src/lib/import-parser.ts` | Extract shared function | Medium |
| `src/components/admin/TopicFormModal.tsx` | DRY: use utils slugify | Medium |
| `src/lib/utils.ts` | Add generateUniqueSlug | Low |
| `src/components/admin/WordFormModal.tsx` | Remove as any cast | Low |
| `src/lib/streak.ts` | Fix import path | Low |