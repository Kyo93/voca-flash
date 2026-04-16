# Tasks: Code Cleanup Review
Date: 2026-04-16

---

## 🔴 HIGH

### H2: `slugify` trùng 2 lần ✅
**File:** `src/lib/import-parser.ts` (line 172–174), `src/lib/utils.ts` (line 18–27)

**Fix:**
1. Write test `tests/unit/slugify-reexport.test.ts`
2. RED: 3 tests fail (no re-export, duplicate definition found)
3. GREEN: `import { slugify } from './utils'` + `export { slugify }` in `import-parser.ts`, delete local definition
4. REFACTOR: verified all callers still work (118/118 pass)

**Status:** ✅ Done 2026-04-16

---

### H3: `todayStr()` UTC inconsistency ✅
**File:** `src/lib/streak.ts` (line 22–24)

**Fix:**
1. Write test `tests/unit/streak-today-boundary.test.ts` (source inspection)
2. RED: 1 test fail (no getTodayBoundary import, has todayStr UTC)
3. GREEN: import `getTodayBoundary` from `supabase-storage`, replace `todayStr()` → `todayBoundaryStr()`
4. REFACTOR: existing `streak.test.ts` updated to use 4 AM boundary dates (was using UTC)

**Status:** ✅ Done 2026-04-16

---

## 🟡 MEDIUM

### M1: `mapRecordToCardProgress()` utility ✅
**Files:** `storage/session.ts` (fetchSrsStates, fetchReviewWords), `srs.ts`

**Fix:**
1. Write test `tests/unit/map-srs-record.test.ts` (5 tests)
2. RED: 5/5 fail (function not exported, session.ts doesn't use it)
3. GREEN: Added `mapSrsRecordToCardProgress` to `srs.ts`, replaced inline mappings in `session.ts`
4. REFACTOR: `fetchSrsStates` + `fetchReviewWords` now call shared utility

**Status:** ✅ Done 2026-04-16

---

### M2: `normalize` trùng logic với `slugify` ✅
**Files:** `src/lib/tag-engine.ts` (line 221–229), `src/lib/utils.ts`

**Fix:**
1. Write test `tests/unit/strip-diacritics.test.ts`
2. RED: `stripDiacritics` not exported from `utils.ts`
3. GREEN: add to `utils.ts`, use in `tag-engine.ts`
4. REFACTOR: remove inline `normalize` from `tag-engine.ts`

**Status:** ✅ Done 2026-04-16

---

### M3: `ReviewChallenge` type trùng ✅
**File:** `src/hooks/useReviewSession.ts` (line 11–17)

**Fix:**
1. Write test `tests/unit/review-challenge-type.test.ts`
2. RED: `useReviewSession` should not redefine `ReviewChallenge`
3. GREEN: re-export from `challenge-logic.ts`, remove local definition
4. REFACTOR: verify no type errors

**Status:** ✅ Done 2026-04-16

---

### M4: `upsertSrsRecord` 2 round-trips ✅
**File:** `src/lib/storage/session.ts` (line 50–55)

**Fix:**
1. Write test `tests/unit/upsert-srs-record.test.ts` (mock Supabase)
2. RED: upsert does SELECT first
3. GREEN: upsert with `lapse_count: supabase.sql('lapse_count + 1')` or RPC
4. REFACTOR: remove SELECT call

**Status:** ✅ Done 2026-04-16

---

### M5: `fetchDashboardStats` hardcoded `weak: 0, orphaned: 0` ✅
**File:** `src/lib/storage/auth.ts` (line 92–104)

**Fix:**
1. Write test `tests/unit/fetch-dashboard-stats.test.ts`
2. RED: 2/3 fail (hardcoded values, no getMasteryStats import)
3. GREEN: import getMasteryStats, replace hardcoded values with real RPC data
4. REFACTOR: Promise.all parallel fetch for mastery + appData

**Status:** ✅ Done 2026-04-16

---

### M6: Comment không khớp logic ✅
**File:** `src/hooks/useFlashcard.ts` (line 74–79)

**Fix:**
1. Clarify intent: is it "unlearned + learning" or "due + unlearned"?
2. Fix comment or fix logic to match comment
3. No test needed (this is comment/logic sync)

**Status:** ✅ Done 2026-04-16

---

## 🟢 LOW

### L1: `parseSheetsUrlIntoRows` alias thừa ✅
**File:** `src/lib/import-parser.ts` (line 321)

**Fix:**
1. Find all callers of `parseSheetsUrlIntoRows`
2. Replace with `parseSheetsUrl`
3. Delete alias export

**Status:** ✅ Done 2026-04-16

---

### L2: Gộp 2 hàm `selectQuadrant*` ✅
**File:** `src/lib/challenge-logic.ts`

**Fix:**
1. After M1 done: unified `selectQuadrant(stability, hasExample, hasChoices?)` → covers all use cases
2. Delete `selectQuadrantFreeStudy` and `selectQuadrantForMasteryWord`
3. Keep only 1 entrypoint

**Status:** ✅ Done 2026-04-16
**Note:** Removed stale `tests/unit/select-quadrant-free-study.test.ts` (was for deleted function)

---

### L3: `fetchTopicWordCounts` optimization ✅
**File:** `src/lib/storage/mastery.ts` (line 66–77)

**Fix:**
1. Write test `tests/unit/fetch-topic-word-counts.test.ts`
2. RED: found client-side SELECT + JOIN (2 round-trips)
3. GREEN: created `supabase/migrations/026_topic_word_counts_rpc.sql` (server-side GROUP BY),
   replaced client JOIN with single `supabase.rpc('get_topic_word_counts')` call
4. REFACTOR: test updated to verify RPC call (not JOIN) in function body

**Status:** ✅ Done 2026-04-16

---

## Summary

| Priority | Task | Status |
|----------|------|--------|
| H2 | `slugify` trùng 2 lần | ✅ |
| H3 | `todayStr()` UTC inconsistency | ✅ |
| M1 | `mapRecordToCardProgress()` utility | ✅ |
| M2 | `normalize` trùng logic với `slugify` | ✅ |
| M3 | `ReviewChallenge` type trùng | ✅ |
| M4 | `upsertSrsRecord` 2 round-trips | ✅ |
| M5 | `fetchDashboardStats` hardcoded values | ✅ |
| M6 | Comment không khớp logic | ✅ |
| L1 | `parseSheetsUrlIntoRows` alias thừa | ✅ |
| L2 | Gộp 2 hàm `selectQuadrant*` | ✅ |
| L3 | `fetchTopicWordCounts` optimization | ✅ |

**All 10 tasks complete. 143/143 tests passing.**