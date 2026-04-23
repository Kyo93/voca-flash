# Implementation Checklist: Clean Code April 23, 2026

> Status: ✅ **COMPLETED** — TypeScript compile clean (0 errors).

---

## Phase 1: Constants Centralization ✅

- [x] 1.1 Add `DAYS_PER_MONTH: 30` to `TIME_CONSTANTS` in `lib/constants.ts`
- [x] 1.2 Add `REVIEW_SESSION_CONFIG.{POINTS_PER_CORRECT, POINTS_GHOST_RECALL_BONUS}` to `lib/constants.ts`
- [x] 1.3 Replace magic `30` in `srs.ts:196,199` with `TIME_CONSTANTS.DAYS_PER_MONTH`
- [x] 1.4 Replace magic `3000` in `useSettingsForm.ts:81` with `TIME_CONSTANTS.TIMEOUT_SHORT_MS`
- [x] 1.5 Replace magic `3000` in `DangerZoneSection.tsx:44, 59` with `TIME_CONSTANTS.TIMEOUT_SHORT_MS`
- [x] 1.6 Update `useReviewSession.ts` to use `REVIEW_SESSION_CONFIG`
- [x] 1.7 Update `useFreeStudySession.ts` to use `REVIEW_SESSION_CONFIG`

---

## Phase 2: Type Safety ✅

- [x] 2.1 Add `longest_streak: number` to `UserProfile` in `lib/types.ts`
- [x] 2.2 Remove `(profile as any).longest_streak` cast in `lib/storage/auth.ts:80`
- [x] 2.3 Remove redundant `as string | null` / `as number` casts in `auth.ts:60-61`
- [x] 2.4 Connect `MasteryStats` type to `MasteryStatsGrid.tsx` (replace `stats: any`)
- [x] 2.5 Narrow `setActiveFilter: any` → `FilterType` in `ScholarlyFilterBar.tsx`

---

## Phase 3: Word Queries Type Refactor ✅

- [x] 3.1 Define `TopicWordJoin` interface for Supabase embedded relation shape
- [x] 3.2 Extract `DEFAULT_TOPIC_COLOR = '#f97316'` constant
- [x] 3.3 Replace `(j as any).topics` cast with `as unknown as TopicWordJoin[]` (typed)
- [x] 3.4 Replace 2× `(w as any).topics = ...` with direct assignment (Word.topics already optional)
- [x] 3.5 Rename single-letter loop vars (`j`, `t`, `w` → `junction`, `topic`, `word`)
- [x] 3.6 Remove `word as any` cast in `updateWord` destructure (use proper `void _dropped`)

---

## Phase 4: Variable Shadow & Dead Code ✅

- [x] 4.1 Rename `const t = setTimeout(...)` → `const timer` in `WordsPage.tsx:44` (fix shadow)
- [x] 4.2 Delete dead comment block in `RoadmapSetupPage.tsx:246-249` (4 lines)

---

## Phase 5: DRY — Hook Reuse ✅

- [x] 5.1 Refactor `Sidebar.tsx` to use `useStreak()` hook instead of inline fetch
- [x] 5.2 Refactor `RightSidebar.tsx` to use `useStreak()` hook
- [x] 5.3 Remove `streakData: any` state, `useRef` cache, `useEffect` fetch from both
- [x] 5.4 Remove unused imports (`fetchStreakFromSupabase`, `loadStreak`, `useAuth`, `useState`, `useEffect`, `useRef`)

---

## Phase 6: Performance Parallelization ✅

- [x] 6.1 Refactor `fetchDashboardSummary` in `lib/storage/roadmap.ts`
- [x] 6.2 Tier 1: Parallel `globalReviewCount` + `pointer` + `roadmap` queries
- [x] 6.3 Tier 2: Parallel `resumeTopic` + `fallbackTopics` (depend on tier 1)
- [x] 6.4 Expected gain: ~300-600ms latency reduction on dashboard load

---

## Phase 7: Cleanup từ scan trước (đã hoàn thành sớm) ✅

- [x] 7.1 Remove pointless `selectQuadrant = sharedSelectQuadrant` re-alias in `useReviewSession.ts`
- [x] 7.2 Change `catch (e)` → bare `catch` in `lib/utils.ts` (2 spots)

---

## Phase 8: Verification ✅

- [x] 8.1 Run `tsc --noEmit` — **0 errors**
- [x] 8.2 Verify no behavior change (only types/structure modified)
- [x] 8.3 Update `.cm/CONTINUITY.md` với summary
- [x] 8.4 Document changes vào `openspec/changes/clean-code-april-2026/design.md`

---

## Commit Strategy (suggested)

```
clean: extract magic 3000 to TIME_CONSTANTS.TIMEOUT_SHORT_MS
clean: add longest_streak to UserProfile, remove as any casts in auth.ts
clean: type MasteryStatsGrid props with MasteryStats interface
clean: narrow setActiveFilter type in ScholarlyFilterBar
clean: define TopicWordJoin interface, remove 3x as any in word-queries.ts
clean: rename shadowed t variable to timer in WordsPage
clean: remove dead comment block in RoadmapSetupPage
refactor(dry): use useStreak() hook in Sidebar and RightSidebar
perf: parallelize fetchDashboardSummary queries with Promise.all
```

---

## Outstanding Smells (cần thảo luận trước khi fix)

| # | File | Smell | Action |
|---|------|-------|--------|
| 1 | `contexts/AuthContext.tsx:41` | 🔴 Hardcoded admin email | Setup `VITE_ADMIN_EMAILS` env var |
| 2 | `WordFormModal.tsx` (313 lines) | 🟠 Split into sub-components | Cần test UI thủ công |
| 3 | Multiple hooks | 🟢 Silent `console.error` swallow | Cần thiết kế toast system |
