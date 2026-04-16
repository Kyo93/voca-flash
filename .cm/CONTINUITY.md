# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.


## Active Goal
Study Post-Flip Challenge — Evidence-Based Rating — PLANNING DONE (2026-04-16)
-> Next: cm-execution to implement

## Next Actions
### Study Post-Flip Challenge (READY — 2026-04-16)
- [x] cm-brainstorm-idea -> proposal.md
- [x] cm-planning -> design.md + tasks.md
- [ ] Phase 1: mapTestResultToRating + computeIntervalPreviews + generateChoices
- [ ] Phase 2: StudyChallengeShell + StudyChallengeType enum
- [ ] Phase 3: SRSButtons enhanced with suggestion + interval preview
- [ ] Phase 4: StudyPage state machine (FLIPPED -> CHALLENGING -> RATING)
- [ ] Phase 5: handleChallengeSubmit + timeout + skip button
- [ ] Phase 6: Animation + polish + tests

## Study Post-Flip Challenge Working Context
- **New Flow:** Card -> Flip -> Challenge (1 trong 3 loại ngẫu nhiên) -> Rating gợi ý -> User rate
- **3 Challenge Types:** cloze (ContextGap), listen (GhostRecall), recognition (Recognition)
- **Rating Mapping:** sai->1, đúng+<3s->4, đúng+<8s->3, đúng+>=8s->2
- **Interval Preview:** Tính trước 4 intervals hiện bên dưới mỗi nút
- **Review Session giữ nguyên** — KHÔNG thay đổi Arena flow
- **Plan location:** openspec/changes/study-post-flip-challenge/

---
## Active Goal
Milestone Reward Character Collection — PLANNING DONE ✅ (2026-04-16)
→ Next: cm-execution to implement

## Next Actions
### Milestone Character Collection (READY — 2026-04-16)
- [x] cm-brainstorm-idea → proposal.md ✅
- [x] cm-planning → specs/design.md + specs/tasks.md ✅
- [ ] cm-execution Phase 0: Create migration `026_character_collection.sql`
- [ ] cm-execution Phase 1: Types + character-types.ts + xp-engine.ts
- [ ] cm-execution Phase 2: supabase-storage.ts XP functions
- [ ] cm-execution Phase 3: milestone-engine.ts + tests
- [ ] cm-execution Phase 4: useCharacterCollection hook
- [ ] cm-execution Phase 5: CharacterSprite SVG + CSS animations
- [ ] cm-execution Phase 6: CharacterShelf in RightSidebar
- [ ] cm-execution Phase 7: CharacterDetail panel
- [ ] cm-execution Phase 8: XP investment flow
- [ ] cm-execution Phase 9: UnlockPopup modal
- [ ] cm-execution Phase 10: StudyPage cameo + ribbon
- [ ] cm-execution Phase 11: Dashboard integration
- [ ] cm-execution Phase 12: Milestone trigger in useFlashcard
- [ ] cm-execution Phase 13: Polish + edge cases

## Character Collection Working Context
- **XP per rating:** Again=5, Hard=10, Good=15, Easy=20, Mastery bonus=+50
- **Wallet:** `user_profiles.total_earned_xp` (total) minus sum(`user_characters.invested_xp`)
- **Level thresholds (invested XP):** 0→Lv1, 200→Lv2, 500→Lv3, 1000→Lv4, 2000→Lv5
- **Slot limit:** 5 max, unlock 1/month (based on account age)
- **8 characters:** seedling, spider, butterfly, tree_boy, mini_dragon, farmer, bonsai, golden_dragon
- **Milestone conditions:** streak_7, words_10/30/50/100/500_mastered, roadmap_complete_1, streak_30
- **Plan location:** `openspec/changes/pet-garden-exp-system/specs/`
- **UI preview:** `openspec/changes/pet-garden-exp-system/ui-preview.md`

---

## Previous Active Goals (archive — kept for context)
**Settings Profile Load Bug — COMPLETED 2026-04-16 ✅**
**Root cause:** RPC `get_initial_app_data_v2` không tồn tại (chỉ trong `_orphan_rpc_backup.sql`)
**Fix 1:** Migration 028 tạo RPC mới với đầy đủ profile fields
**Fix 2:** `fetchInitialAppData` thêm fallback direct SELECT nếu RPC fail
**Fix 3:** Test `fetch-profile-settings-load.test.ts` guard regression
**Note:** `avatar_url` DB = empty string → cần user save lại từ Settings page
**Topic Slug Fix — COMPLETED ✅**
**Topic Slug Uniqueness Per-Roadmap — COMPLETED 2026-04-15 ✅**
**Option B Comprehensive Cleanup — COMPLETED 2026-04-15 ✅**

## Next Actions
### Topic Slug Fix ✅ (DONE 2026-04-15)
- [x] Migration 024 applied to Supabase (`topics_roadmap_slug_unique UNIQUE (roadmap_id, slug)`)
- [x] `generateUniqueSlug()` in `import-parser.ts` — `roadmapSlug` prefix added
- [x] `ImportWordsModal.tsx` — `roadmapSlug` prop propagated to slug generation

### Quick Fix: Mark as Learned Button ✅ (2026-04-15)
- Bug: "Mark as Learned" called rate(3) directly without flipping card first
- Fix: markLearned now calls flip() then rate(3) in useFlashcard.ts
- Fix: StudyPage button now calls markLearned (from useFlashcard) instead of rate(3) direct
- Tests: 2 added (tests/unit/mark-as-learned.test.ts)

### Option B Changes (2026-04-15) ✅
- C1: StudyPage inside AppLayout — no own grid/Sidebar
- C2: Sidebar fetches Supabase streak (logged-in), localStorage (anonymous)
- C3: `selectQuadrant` extracted → `src/lib/challenge-logic.ts`
- C4: RightSidebar streak cached with useRef (no redundant fetches)
- M1: `fetchMasteryStats` → `getMasteryStats`, `fetchUserVocabulary` → `getUserVocabulary`
- M2: `wordIds` unused in admin-queries.ts — TODO(M2) documented
- M4: `slugify` moved from useAdminTopics.ts → src/lib/utils.ts
- L1: RoadmapContext NOT dead — used by AdminLayout/WordsPage/TopicsPage
- L2: useFreeStudySession imports ReviewChallenge from challenge-logic
- Type fixes: Word.topic_id optional, Word.tags optional, StudyPage useState import, FreeStudySession full Word shape

## Recent Fixes
- Option B TDD refactor (23 tests added, 73 total) ✅
- Pre-existing TS bug: StudyPage missing useState import ✅
- Pre-existing TS bug: useFreeStudySession topic_id → now in types.ts ✅
- Pre-existing TS bug: ChallengeCard shape mismatch with useReviewSession ✅

## Working Context
- **Color Tokens:** Dùng bảng token từ `design.md` — KHÔNG dùng generic `text-secondary`, `bg-orange-*`
- **Progress bar:** LUÔN màu `bg-secondary` (#546435/xanh lá) — KHÔNG dùng `topic.color`
- **Add Word button:** `bg-secondary text-on-secondary` (xanh lá) — KHÔNG phải cam
- **No-Line Rule:** KHÔNG dùng border 1px solid — dùng background shifts
- **Design reference:** `C:\Users\Ocean\Downloads\stitch_vocabmaster\code.html` (source of truth)

## Working Context
- **Layout:** 2 cột — TopicPanel (trái) + WordPool (phải)
- **Word-first:** Import words → gán vào topics
- **user_srs_records:** gắn word_id (không phụ thuộc topic) → KHÔNG ảnh hưởng user learning
- **topic_words junction:** admin quản lý qua bulk assign
- **FK cascade:** `topics.roadmap_id ON DELETE SET NULL` → xóa topic không ảnh hưởng `user_srs_records`
- **Block roadmap delete:** Query topics count trước khi xóa → warning nếu còn topics

## Next Actions
### Topic Slug Fix (ACTIVE — 2026-04-15)
- [ ] 1.1 Create migration `024_topic_slug_unique_per_roadmap.sql`
- [ ] 2.1 Update `generateUniqueSlug()` in `import-parser.ts` — add `roadmapSlug` param + prefix
- [ ] 3.1 Update `handleParse` in `ImportWordsModal.tsx` — pass `roadmapSlug` to `generateUniqueSlug()`
- [ ] 4.1 Run migration + verify

## Working Context
- **Import guard:** ImportWordsModal requires `roadmapId` (mandatory). No `roadmapId` → shows warning UI, no upload.
- **Auto-create topics:** Always set `roadmap_id = roadmapId`. No `null` fallback.
- **Slug uniqueness:** `generateUniqueSlug(name, existingSlugs)` → append `-1`, `-2` on collision.
- **Import now lives ONLY in RoadmapSetupPage** — removed from WordsPage.
2. **1.2** Gắn `<RoadmapProvider>` vào `AdminLayout.tsx`
3. **2.1** Thêm roadmap selector dropdown vào `AdminSidebar.tsx`
4. **3.1** TopicsPage lọc theo `selectedRoadmap.id`
5. **4.1** WordsPage cột Chủ đề hiển thị topic + roadmap

## Vocab Import Spec Summary
- **3 input formats:** CSV, Excel (.xlsx), Google Sheets URL
- **12-column CSV:** word, phonetic, pos, difficulty, definition, example, example_vi, image_url, topics, wrong1, wrong2, wrong3
- **Duplicate handling:** Per-row — Keep Existing | Update | Skip
- **Transaction:** Batch RPC, chunk 50 rows
- **Template download:** YES — nút trong modal

## RPC Audit Results (2026-04-13)

### Dropped (4 orphan RPCs — CORRECTED 2026-04-16):
- `get_progress_page_data_v2(uuid)` ✅
- `get_user_memory_health(uuid)` ✅
- `get_user_memory_health_v2(uuid)` ✅
- `get_user_vocabulary(uuid)` ✅

### Fixed TypeScript:
- `InitialAppData.stats` missing field → added ✅
- `UserStats` unused import → removed ✅
- `MasteryStats` return type fixed in `fetchDashboardStats` ✅
- `Number()` coercion for `bigint` fields ✅

### New Files:
- `supabase/migrations/_orphan_rpc_backup.sql` (backup)
- `supabase/migrations/017_sync_cloud_local.sql` (documentation)

### Pre-existing bugs found & fixed:
- `src/lib/storage/auth.ts`: `fetchDashboardStats` returned wrong shape — now matches `MasteryStats`
- `src/lib/types.ts`: `InitialAppData` missing `stats` field — now aligned with RPC return shape
4. Phase 4.1: Check `src/lib/streak.ts` usage → deduplicate

- **Plan location:** `openspec/changes/rpc-audit/`
- **Total tasks:** 13 (~3.5 hrs)

## What Was Done (2026-04-13)

### 🔍 Root Cause Analysis (cm-debugging output)
- **Issue:** New user → Progress page spinner hangs indefinitely
- **Root 1:** `user_profiles` record missing (Supabase Auth creates auth user, no profile upsert)
- **Root 2:** `fetchDashboardStats()` uses `.single()` → throws 406 for null profile
- **Root 3:** `Promise.all` in `ProgressPage.tsx` rejects entirely when one query throws
- **Root 4:** `recordStreak()` also uses `.single()` — fails silently on first study session
- **Race condition:** AuthContext fires profile fetch non-blocking (`then()`) → ProgressPage may read before profile exists

### 📋 OpenSpec Plan Written
- `openspec/changes/new-user-onboarding-fix/design.md` ✅
- `openspec/changes/new-user-onboarding-fix/tasks.md` ✅
  - Step 0: Audit all `.single()` calls
  - Step 1: `ensureUserProfile()` in AuthContext
  - Step 2: Defensive queries in supabase-storage (2 locations)
  - Step 3: `Promise.allSettled` in ProgressPage
  - Step 4: Manual verification tests

## Working Context
- **Zen Arena 2.0:** Đã hoàn tất (Motion + Rewards). Các thử thách hiện có độ "flow" và phần tổng kết đã tích hợp cơ chế xây dựng thói quen.
- **Review Arena:** Xây riêng một thế giới mới (`/review`), không phá vỡ UI Study.

## What Was Done (2026-04-12)

### ✅ Review Arena Implementation (Active Recall)
- **Framework:** Xây dựng `ChallengeManager.tsx` và `useReviewSession.ts` để quản lý luồng câu hỏi.
- **Challenge Types:** Đã triển khai `Recognition`, `Construction`, `ContextGap`, `Phonetics`, `GhostRecall`.
- **Adaptive Logic:** Thuật toán tự động chọn loại thử thách dựa trên số lần lặp lại (`repetitions`) và dữ liệu có sẵn (choices/examples).
- **Navigation:** Triển khai `ConfirmExitModal` tùy chỉnh thay thế `window.confirm` giúp việc thoát session 100% ổn định.
- **Git:** Đã push toàn bộ code lên `origin production` (tài khoản `Kyo93`).

### ✅ Audio Poltergeist Fix
- **Speech Utility:** Tạo `src/lib/speech.ts` để quản lý tập trung `window.speechSynthesis`.
- **Queue Control:** Ép buộc `cancel()` trước khi phát âm thanh mới, loại bỏ hoàn toàn hiện tượng lặp tiếng hoặc nhảy từ.
- **Cleanup:** Thêm logic xóa hàng đợi âm thanh khi unmount component hoặc thoát session.

### ✅ Domain Naming Refactor (Ubiquitous Language)
- Đổi tên DB tables/columns (`user_progress` → `user_srs_records`, v.v.) qua migration SQL.
- Refactor `src/lib/types.ts` và `src/lib/supabase-storage.ts` để đồng bộ hoàn toàn với Model Interface mới (`SrsRecord`, `ResumePointer`).
- Dọn dẹp nợ kỹ thuật: Không còn lỗi nhầm lẫn giữa Progression completion rates và SRS Repetitions.

### ✅ Admin Bug Fixes
- Sửa lỗi Crash Trắng Trang (White Screen of Death) ở Modal sửa thiết lập từ vựng (WordFormModal.tsx) bằng cách thêm an toàn null-safety (`?? ''`).
- Đưa tính năng `word_choices` (Đáp án sai trắc nghiệm) hoạt động đúng chức năng khi bấm nút Edit từ vựng.

### ✅ Supabase Setup (Phase 1)
- Project: `voca-flash-admin` (Singapore `ap-southeast-1`) → ID: `nhnusgnlhnzwavpltbqj`
- URL: `https://nhnusgnlhnzwavpltbqj.supabase.co`
- Schema: 7 tables + RLS + triggers ✅
- Credentials: `.env` ✅

### ✅ Phase 2: Core Setup
- `src/lib/supabase.ts` ✅
- `src/lib/types.ts` ✅
- `src/lib/auth.ts` ✅
- `src/contexts/AuthContext.tsx` ✅
- `src/pages/LoginPage.tsx` ✅
- `App.tsx` updated ✅ (AuthProvider + routes)

### ✅ Phase 3: Admin Routes + Layout
- `src/components/AdminLayout.tsx` ✅ (dùng `<Outlet>`)
- `src/components/AdminSidebar.tsx` ✅
- `src/App.tsx` — nested `/admin/*` routes với RequireAdmin guard ✅
- `src/components/Sidebar.tsx` — updated với `useAuth()` + admin link ✅
- `LandingPage.tsx` — login buttons → `/login` ✅

### ✅ Phase 4: Words CRUD
- `src/lib/admin-queries.ts` ✅
- `src/hooks/useAdminWords.ts` ✅
- `src/components/ConfirmDialog.tsx` ✅
- `src/components/WordFormModal.tsx` ✅
- `src/pages/AdminWordsPage.tsx` ✅

### ✅ Phase 5: Topics CRUD + Drag & Drop
- `src/hooks/useAdminTopics.ts` ✅
- `src/components/TopicFormModal.tsx` ✅ (Added `description` field)
- `src/pages/AdminTopicsPage.tsx` ✅ (@dnd-kit)
- `database migrations` ✅ (Added `description` to `topics` table)
- `Roadmap Topics Page` ✅ (Render Topic description with Premium Tactile cards)

### ✅ Phase 6: Roadmaps CRUD
- `src/hooks/useAdminRoadmaps.ts` ✅
- `src/components/RoadmapFormModal.tsx` ✅
- `src/pages/AdminRoadmapsPage.tsx` ✅

### ✅ Phase 7: Admin Dashboard
- `src/pages/AdminDashboardPage.tsx` ✅ (stats cards + recent words)

### ✅ Phase 8: Users View
- `src/pages/AdminUsersPage.tsx` ✅ (user list + slide-over progress panel)

### ✅ Phase 9: Seed Data
- 1 roadmap: "English Mastery"
- 5 topics: Daily, Travel, Business, Technology, Food
- 15 words (từ sampleCards)
- **Xong via Supabase MCP**

### ✅ Phase 10: Student → Supabase Sync (HOÀN TẤT 2026-04-11)
- `src/lib/supabase-storage.ts` ✅ — fetchWords, fetchUserProgress, upsertUserProgress, fetchUserStats, fetchTopicWordCounts, recordStreak
- `src/hooks/useFlashcard.ts` ✅ — async init + rate → upserts to Supabase (fire-and-forget)
- `src/lib/streak.ts` ✅ — fetchStreakFromSupabase + localStorage fallback
- `src/pages/DashboardPage.tsx` ✅ — async stats + topic counts from Supabase
- `src/pages/LibraryPage.tsx` ✅ — async topic counts from Supabase + localStorage fallback
- Migration applied: `ALTER TABLE user_profiles ADD last_study_date DATE`
- Build: 128 modules, no errors ✅
- `storage.ts` preserved as offline fallback (LibraryPage uses it when not logged in)

### ✅ Phase 10.5: App Layout Standardization & Refactor
- `src/components/AppLayout.tsx` ✅ (Centralized layout pattern for all main pages)
- Extracted and unified `Sidebar` and `Header` components ✅
- Applied grid-based layout standardization consistently across Dashboard, Library, and Roadmap Topics pages ✅
- Fixed navigation state, scroll behaviors, and data fetching logic within the new layout ✅
- **Global Right Sidebar** ✅ (Streak + Reminders visible everywhere)
- **Bottom-Aligned Toggle** ✅ (Navigation stability improved)

### ✅ Code Quality & Documentation (2026-04-12)
- Created `ARCHITECTURE.md` (System overview + Mermaid diagrams) ✅
- Created `UAT-GUIDE.md` (Manual verification flows) ✅
- Created `CODE-REVIEW.md` (Technical health assessment) ✅
- Created `.cm/skeleton.md` (Layer 0 Intelligence Index) ✅
- Cập nhật tài liệu: Hoàn tất 24-step Domain Refactor checklist.
- **Cleanup**: Deleted `src/lib/storage.ts` (Legacy localStorage logic) ✅

### ⏸️ Phase 11: Deploy (CHỜ SAU)
- GitHub repo: **https://github.com/Kyo93/voca-flash** (public) ✅ Pushed
- Cloudflare Pages: cần `CLOUDFLARE_API_TOKEN` hoặc manual setup
- Env vars cần deploy:
  - `VITE_SUPABASE_URL=https://nhnusgnlhnzwavpltbqj.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=eyJhbG...`

## Architecture (Option A — Final)

```
src/
├── lib/
│   ├── supabase.ts         ✅ Supabase client
│   ├── types.ts            ✅ 7 interfaces
│   ├── auth.ts             ✅ signIn/signUp/signOut
│   ├── admin-queries.ts    ✅ Tất cả CRUD queries
│   ├── srs.ts              ✅ existing
│   ├── storage.ts          ✅ (phase 10 mới thay)
│   └── streak.ts           ✅ existing
├── contexts/
│   └── AuthContext.tsx     ✅ useAuth() + isAdmin check
├── components/
│   ├── AdminLayout.tsx     ✅
│   ├── AdminSidebar.tsx    ✅
│   ├── Sidebar.tsx         ✅ updated với useAuth()
│   ├── ConfirmDialog.tsx   ✅
│   ├── WordFormModal.tsx   ✅
│   ├── TopicFormModal.tsx  ✅
│   └── RoadmapFormModal.tsx ✅
├── hooks/
│   ├── useAdminWords.ts    ✅
│   ├── useAdminTopics.ts   ✅
│   └── useAdminRoadmaps.ts ✅
└── pages/
    ├── LoginPage.tsx        ✅
    ├── AdminDashboardPage.tsx ✅
    ├── AdminWordsPage.tsx   ✅
    ├── AdminTopicsPage.tsx  ✅
    ├── AdminRoadmapsPage.tsx ✅
    └── AdminUsersPage.tsx  ✅
```

## Next Actions (Khi nào public)
1. Deploy lên Cloudflare Pages (cần API token hoặc manual dashboard)
2. Thêm admin user vào Supabase:
   ```sql
   INSERT INTO admin_users (id, email, role)
   SELECT id, email, 'superadmin'
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```
   *(Sau khi tạo account student)*
3. Test login → vào `/admin` → CRUD words

## Open Issues
- Phase 10 (Student sync) — hoãn lại
- Deploy — chờ Cloudflare token
- Admin user — chờ user tạo account

## Key Files
| File | Status |
|---|---|
| `.env` | ✅ Credentials ready |
| `supabase/migrations/001_initial_schema.sql` | ✅ Applied |
| `openspec/changes/admin-panel/design.md` | ✅ Option A |
| `openspec/changes/admin-panel/tasks.md` | ✅ Updated |
| `GitHub: Kyo93/voca-flash` | ✅ Pushed |
| `src/index.css` | ✅ Design tokens sẵn dùng |

## User Context
- Một mình làm fullstack
- Thích dev locally, deploy khi cần public URL
- Chốt: Option A — KHÔNG tách

## Mistakes & Learnings

- What Failed: Settings page `display_name` và `avatar_url` không load dù user đã lưu trước đó.
- Why It Failed: `fetchInitialAppData()` gọi RPC `get_initial_app_data_v2` — nhưng RPC này chỉ tồn tại trong file `_orphan_rpc_backup.sql` (underscore prefix = không bao giờ được apply bởi Supabase CLI). RPC không tồn tại trên Supabase → fail silent → `profile: null`.
- How to Prevent:
  1. KHÔNG BAO GIỜ giữ RPC đang dùng trong file backup (underscore prefix không nên dùng cho code đang active).
  2. Backup file nên đặt tên `YYYYMMDD_backup_*.sql` hoặc move ra khỏi thư mục migrations.
  3. Trước khi refactor RPC, LUÔN verify RPC thực sự tồn tại: `supabase db diff` hoặc check Supabase dashboard SQL Editor.
  4. Luôn có fallback trong TypeScript: khi RPC fail, gọi direct SELECT từ table thay vì return null.
- Scope: `module:database:rpc`
- Timestamp: 2026-04-16
- What Failed: Sidebar "Library" link sometimes returned to default list instead of active roadmap after starting a session.
- Why It Failed: Brittle Supab- 🏆 Master Goal: Stabilize learning flow & finalize progress tracking.
- 🎯 Active Goal: Study Page Rescue & Build Hardening.
- 🚀 Next Actions:
  - [x] Fix Study Page crash (TTS NaN signature).
  - [x] Resolve all TypeScript errors (100% clean build).
  - [x] Document Incident History.
  - [ ] Investigate "Reset Progress" impact on roadmap state.
- 🕒 Current Phase: testing
- 🧠 Working Context:
  - Initiative: `learning-progress-dashboard`
  - Design: Tactile Scholar (Warm Light Mode, #FFFBF2 background, #D35400 primary).
  - Routes: `/progress` Needs to be connected in App.tsx.
  - Data: Uses `fetchDashboardStats` and `fetchDashboardSummary`.
"Dễ" 5 times in different sessions.
- Why It Failed: The `users_progress` DB schema did not store `repetitions` directly. Instead `fetchUserProgress` mapped it dynamically from `correct_count > 0 ? 1 : 0`, which caused `repetitions` to cap at 1 upon every app refresh.
- How to Prevent: Always align React local state schema (e.g. `CardProgress`) 1:1 with DB schema properties. I bypassed schema limitations by re-purposing the `correct_count` column to store `repetitions`, thus capturing true streaks.
- Scope: `module:srs`
- Scope: `file:src/components/admin/WordFormModal.tsx`

- What Failed: White Screen of Death (crash) on Study Page navigation.
- Why It Failed: `setTtsConfig` signature mismatch + `NaN` rate passed to `speechSynthesis.speak()`. Chromium browsers throw fatal errors when talking with `rate: NaN`.
- How to Prevent: Always validate numeric inputs for browser APIs using `isNaN()`. Maintain standardized signatures across the codebase.
- Scope: `module:tts`
- Timestamp: 2026-04-12
- Agent: Antigravity

### Pattern: RPC backup files with underscore prefix = NEVER deployed by Supabase CLI
- What Failed: `get_initial_app_data_v2` đang được gọi trong code nhưng không tồn tại trên Supabase — vì nó chỉ nằm trong `_orphan_rpc_backup.sql` (underscore prefix).
- Why It Failed: Supabase CLI chỉ deploy migrations thường, không deploy file backup. Underscore prefix không phải quy ước chuẩn — dễ gây nhầm lẫn giữa "đang dùng" và "đã bỏ".
- How to Prevent:
  1. Đặt tên backup: `YYYYMMDD_backup_*.sql` hoặc move ra khỏi `migrations/`
  2. Luôn verify: chạy `supabase db diff` hoặc check SQL Editor trên Supabase dashboard trước khi dùng RPC
  3. Hoặc đơn giản: giữ RPC trong migrations chính thức, không tách ra backup
- Scope: `global`
- Timestamp: 2026-04-16
- What Failed: `topics[someSlug]` errored as type 'string' can't index type 'RoadmapTopics'.
- Why It Failed: TypeScript strict mode doesn't allow indexing objects with dynamic strings unless typed as `Record<string, T>`.
- How to Prevent: Explicitly cast dynamic keys or use proper `Record<>` types for map objects.
- Scope: `global`
- What Failed: `get_user_vocabulary` RPC returned 0 rows or errored out.
- Why It Failed: PostgreSQL `RETURN QUERY` requires strict type matching. `ease_factor` in `user_srs_records` is `double precision` (float8), but the RPC defined it as `REAL`.
- How to Prevent: Always use `FLOAT8` for decimal numbers in Postgres functions to match default table types.
- Scope: `module:database:rpc`

- What Failed: Mastery Vault showed duplicate rows for words belonging to multiple topics.
- Why It Failed: `JOIN topic_words` created a row for every topic-word association.
- How to Prevent: Use `GROUP BY` and `string_agg(t.name, ', ')` to aggregate many-to-many associations into a single row.
- Scope: `module:database:rpc`

- What Failed: Progress UI badgettes displayed illogical context (`+5 hôm nay` for "Từ đã thuộc", `5/35 thẻ mới` for "Mục tiêu ngày").
- Why It Failed: Blindly applied `newToday` (words first encountered today) to UI components that structurally meant `masteredToday` (words mastered today) or progress towards daily mastery targets.
- How to Prevent: Distinguish carefully between UI text labels vs actual data domains when replacing mockups with dynamic values. Ensure daily targets correspond correctly to app logic (mastery vs learning).
- Scope: `module:ui:dashboard`
- What Failed: Users studying at 2 AM saw their progress reset at midnight, splitting single study sessions across two calendar days.
- Why It Failed: Used standard midnight reset (`setHours(0,0,0,0)`) which doesn't align with human night-owl study habits.
- How to Prevent: Use a 4:00 AM "Session Boundary" for all daily metrics (`getTodayBoundary()`). This groups late-night sessions into the previous "day" logically.
- Scope: `module:logic:time`

### Pattern: Daily Goal vs Total Vocabulary
- What Failed: Dashboard showed "10/35" where 10 was the total word count and 35 was the goal, making it impossible to "reach" the goal without adding 25 more words.
- Why It Failed: Calculated daily progress as `Math.min(totalWords, dailyGoal)` instead of `Math.min(newWordsToday, dailyGoal)`.
- How to Prevent: Clearly define "Daily Goal" as "New words encountered during today's sessions" to make it an achievable activity-based metric.
- Scope: `module:ui:dashboard`
