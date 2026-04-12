# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Active Goal
**Progress Dashboard Layered Analytics** — Integrate detailed SRS memory health metrics into the Progress Page using Tactile Scholar Glassmorphism design.

## Current Phase
`execution` — Hoàn tất việc chèn 6 chỉ số chuyên sâu vào trang Tiến độ (`/progress`).

## Next Actions
1. Review lại UI trên trình duyệt.
2. Setup Git push cho tính năng mới.

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

### Pattern: Implicit Any Indexing
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
