# Design: Clean Code Pass — April 23, 2026

## Context
Hygiene sprint sau khi hoàn thành các feature gần đây (FSRS upgrade, Mastery refinements, UI Mint). Quét toàn bộ `src/` (157 files) bằng `cm-clean-code`, phát hiện **47 smells** (6 critical, 22 medium, 19 low). Đợt fix này tập trung vào 8 items low-risk + 1 item medium-risk (`word-queries.ts` typing) — không thay đổi behavior.

## Technical Approach
- TRIZ #2 (Taking Out): Extract logic trùng lặp ra hook chung
- TRIZ #6 (Universality): Một hằng số dùng nhiều nơi → centralize
- TRIZ #10 (Prior Action): Dọn type debt trước khi nó lan rộng

**Risk strategy:** Mỗi fix verify bằng `tsc --noEmit` ngay sau khi apply. Không touch behavior, chỉ thay imports/types/structure.

---

## Smells đã fix

### Group A: DRY — Centralize Constants

#### A1. Magic `3000` → `TIME_CONSTANTS.TIMEOUT_SHORT_MS`
- `src/hooks/useSettingsForm.ts:81`
- `src/components/settings/DangerZoneSection.tsx:44, 59`

Hằng số đã tồn tại sẵn trong `lib/constants.ts` nhưng không được sử dụng tại 3 chỗ này.

#### A2. `POINTS_PER_CORRECT` / `POINTS_GHOST_RECALL_BONUS` (đã làm trước đó)
Extract vào `REVIEW_SESSION_CONFIG` trong `constants.ts`.
- `src/hooks/useReviewSession.ts`
- `src/hooks/useFreeStudySession.ts`

#### A3. Magic `30` ("days per month") trong `srs.ts`
Add `DAYS_PER_MONTH: 30` vào `TIME_CONSTANTS`.

---

### Group B: Type Safety

#### B1. `longest_streak` field missing from `UserProfile`
**Before:**
```ts
const currentLongest = (profile as any).longest_streak ?? 0
const lastDate = profile.last_study_date as string | null
const currentStreak = (profile.streak_days as number) ?? 0
```
**After:** Add `longest_streak: number` to `UserProfile` interface trong `lib/types.ts`. Xóa 3 redundant casts trong `lib/storage/auth.ts`.

#### B2. `MasteryStatsGrid` props typed as `any`
**Before:** `interface MasteryStatsGridProps { stats: any }`
**After:** `stats: MasteryStats | null` (type đã có sẵn nhưng chưa connect).

#### B3. `ScholarlyFilterBar.setActiveFilter` typed as `any`
**Before:** `setActiveFilter: (filter: any) => void`
**After:** `setActiveFilter: (filter: FilterType) => void` (import từ `useMasteryWords.ts`).

#### B4. `word-queries.ts` — 3× `as any` casts trên Supabase joins
**Before:**
```ts
for (const j of (junctions ?? [])) {
  const t = (j as any).topics
  if (t) topicNameMap.set(j.word_id, { name: t.name, color: t.color ?? '#f97316' })
}
for (const w of words as Word[]) {
  const t = topicNameMap.get(w.id)
  if (t) (w as any).topics = { ... }
  else (w as any).topics = null
}
const { topic_id: _dropped, ...cleanWord } = word as any
```
**After:** Define `TopicWordJoin` interface, rename single-letter vars (`j`, `t`, `w` → `junction`, `topic`, `word`), extract `DEFAULT_TOPIC_COLOR` constant. Còn lại 1 cast `as unknown as TopicWordJoin[]` (an toàn vì có interface document shape).

---

### Group C: Variable Shadow

#### C1. `const t = setTimeout` shadow `useTranslation().t`
- `src/pages/admin/WordsPage.tsx:44`
- Rename `t` → `timer`

---

### Group D: Dead Code Removal

#### D1. Stale comment block trong `RoadmapSetupPage.tsx:246-249`
```jsx
{/*
  Bottom 3 cards removed (2026-04-15)
  Auto-Gen Meanings | Retention Insight | Drag & Drop Assets
*/}
```
Lịch sử thuộc về git, không phải source code → xóa.

---

### Group E: DRY — Hook Reuse

#### E1. Streak fetch logic duplicated (3 places)
`useStreak()` hook đã tồn tại nhưng `Sidebar.tsx` và `RightSidebar.tsx` đều fetch streak độc lập với manual cache ref.

**Before:** ~30 dòng duplicate fetch+state+cache logic trong 2 component
**After:** Cả 2 component dùng `useStreak()` → xóa `streakData: any` state, xóa `useRef` cache, xóa `useEffect` fetch.

---

### Group F: Performance — Parallelize Queries

#### F1. `fetchDashboardSummary` chạy 4 query tuần tự
**Before:** 4 sequential `await` → ~300-600ms latency mỗi lần load dashboard.
**After:** 2-tier parallel với `Promise.all`:
- **Tier 1 (parallel):** `globalReviewCount`, `pointer`, `roadmap`
- **Tier 2 (parallel, depends on tier 1):** `resumeTopic` (cần `pointer`), `fallbackTopics` (cần `roadmap`)

---

### Group G: Cleanup từ scan trước (đã hoàn thành)

- `useFlashcard.ts`, `useReviewSession.ts`: re-alias `selectQuadrant = sharedSelectQuadrant` không cần thiết → import trực tiếp
- `lib/utils.ts`: `catch (e)` không dùng biến → bare `catch`
- `lib/srs.ts`: comment apologetic về magic `30` → dùng `TIME_CONSTANTS.DAYS_PER_MONTH`

---

## Verification
- `tsc --noEmit` pass với **0 errors** sau từng group fix
- Không thay đổi behavior — chỉ refactor types, imports, structure
- Existing tests không bị ảnh hưởng (không touch logic core)

---

## Files Changed

| File | Group | Risk |
|------|-------|------|
| `src/lib/constants.ts` | A1, A2, A3 | Low |
| `src/lib/types.ts` | B1 | Low |
| `src/lib/storage/auth.ts` | B1 | Low |
| `src/lib/storage/roadmap.ts` | F1 | Low |
| `src/lib/srs.ts` | A3, G | Low |
| `src/lib/utils.ts` | G | Low |
| `src/lib/queries/word-queries.ts` | B4 | Medium |
| `src/hooks/useSettingsForm.ts` | A1 | Low |
| `src/hooks/useReviewSession.ts` | A2, G | Low |
| `src/hooks/useFreeStudySession.ts` | A2 | Low |
| `src/hooks/useFlashcard.ts` | (verified clean) | — |
| `src/components/settings/DangerZoneSection.tsx` | A1 | Low |
| `src/components/Sidebar.tsx` | E1 | Low |
| `src/components/RightSidebar.tsx` | E1 | Low |
| `src/components/mastery/MasteryStatsGrid.tsx` | B2 | Low |
| `src/components/mastery/ScholarlyFilterBar.tsx` | B3 | Low |
| `src/pages/admin/WordsPage.tsx` | C1 | Low |
| `src/pages/admin/RoadmapSetupPage.tsx` | D1 | Low |

---

## Smells còn lại (chưa fix — cần quyết định)

| # | Severity | Smell | Lý do hoãn |
|---|----------|-------|-----------|
| 1 | 🔴 Critical | Hardcoded admin email trong `AuthContext.tsx:41` | Cần setup env var `VITE_ADMIN_EMAILS` — ảnh hưởng deploy |
| 2 | 🟠 Medium | `WordFormModal.tsx` (313 lines) — split needed | Refactor lớn, cần test UI thủ công |
| 3 | 🟠 Medium | `WordsPage.tsx` `handleBulkDelete`/`handleBulkAssign` duplicate scaffolding | Cần wrapper helper, có thể introduce bug |
| 4 | 🟠 Medium | `recordStreak` nesting depth 4 | Cần extract pure function, low-priority |
| 5 | 🟢 Low | `console.error` swallowed silently ở ~12 hooks | Cần thiết kế toast/notification system |
| 6 | 🟢 Low | Duplicate Tailwind class string trong `WordFormModal.tsx` (8×) | Sẽ giải quyết khi split modal |
