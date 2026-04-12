# Implementation Checklist — Domain Naming Refactor

## Phase 1: Database Migration
- [ ] 1.1 Tạo `supabase/migrations/003_rename_domain_objects.sql`
- [ ] 1.2 Chạy migration trên Supabase SQL Editor (4 câu ALTER)
- [ ] 1.3 Verify: Query `SELECT * FROM user_srs_records LIMIT 1` thành công

## Phase 2: Core Type Layer
- [ ] 2.1 `types.ts` — Rename `UserProgress` → `SrsRecord` (+ fields)
- [ ] 2.2 `types.ts` — Rename `UserLearningState` → `ResumePointer`

## Phase 3: Data Layer
- [ ] 3.1 `supabase-storage.ts` — Xóa `SupabaseCardProgress`, dùng `SrsRecord`
- [ ] 3.2 `supabase-storage.ts` — Rename 6x `.from('user_progress')` → `.from('user_srs_records')`
- [ ] 3.3 `supabase-storage.ts` — Rename 2x `.from('user_learning_state')` → `.from('user_resume_pointers')`
- [ ] 3.4 `supabase-storage.ts` — Rename hàm `fetchUserProgress` → `fetchSrsStates`
- [ ] 3.5 `supabase-storage.ts` — Rename hàm `upsertUserProgress` → `upsertSrsRecord`
- [ ] 3.6 `supabase-storage.ts` — Rename hàm `fetchUserStats` → `fetchDashboardStats`
- [ ] 3.7 `supabase-storage.ts` — Rename hàm `fetchUserLearningStates` → `fetchResumePointers`
- [ ] 3.8 `supabase-storage.ts` — Rename hàm `upsertLearningState` → `saveResumePointer`
- [ ] 3.9 `supabase-storage.ts` — Rename hàm `fetchTopicProgressMap` → `fetchTopicCompletionMap`
- [ ] 3.10 `supabase-storage.ts` — Update tất cả column references (`correct_count`→`repetitions`, `wrong_count`→`lapse_count`)

## Phase 4: Admin Data Layer
- [ ] 4.1 `admin-queries.ts` — Rename `getUserProgress` → `getUserSrsRecords`
- [ ] 4.2 `admin-queries.ts` — Update `.from('user_progress')` → `.from('user_srs_records')`
- [ ] 4.3 `admin-queries.ts` — Update import `UserProgress` → `SrsRecord`

## Phase 5: Consumer Pages
- [ ] 5.1 `useFlashcard.ts` — Update imports + call sites (3 chỗ)
- [ ] 5.2 `DashboardPage.tsx` — Update import + call site (1 chỗ)
- [ ] 5.3 `LibraryPage.tsx` — Update imports + state type + call sites (3 chỗ)
- [ ] 5.4 `RoadmapTopicsPage.tsx` — Update imports + call sites (2 chỗ)
- [ ] 5.5 `UsersPage.tsx` — Update imports + component name + state + display labels

## Phase 6: Verification
- [ ] 6.1 `npm run build` — 0 errors
- [ ] 6.2 Grep check: 0 references to old names in `src/`
- [ ] 6.3 Browser smoke test: Dashboard → Library → Study → Admin
- [ ] 6.4 Update `.cm/CONTINUITY.md` with completed refactor
