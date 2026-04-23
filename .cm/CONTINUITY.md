# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Active Goal
- **Clean Code April 2026 v2**: Fix all 20+ hygiene issues from scan report — 5 bugs, 10 duplication clusters, 10 large functions. Plan at `openspec/changes/clean-code-april-2026-v2/`.

## Current Phase
- planning → ready for execution

## Next Actions
### Clean Code April 2026 v2 (ACTIVE)
- [ ] 1.1 Fix `useFlashcard.ts:186` stale `refreshInitialData` dep
- [ ] 1.2 Fix `AuthContext.tsx:263–285` stale-closure `useMemo` deps
- [ ] 1.3 Fix `StudyPage.tsx:59` `useRef<string|undefined>(null)` type error
- See full list: `openspec/changes/clean-code-april-2026-v2/tasks.md`

## Working Context (Clean Code v2)
- Order: bugs → quick cleanups → extract primitives → refactor large functions. Primitives land BEFORE large-function refactors so consumers shrink for free.
- Key primitives to create: `AdminModal`, `ErrorBanner`, `LoadingSpinner`, `ImageUrlField`, `SlugField`, `useAdminResource<T>`, `ChallengeTextInput`, `mapFSRSCardToProgress`, `buildChoicePayload`.
- Largest targets (touch last, with tests green): `AuthProvider` (236 lines, 5 concerns), `RoadmapSetupPage` (245 lines God Page), `useFlashcard` (198 lines).
- Verification between every commit: `npm run test` + `npm run typecheck`.

## Previous Goal (archived)
- **Finalize Spaced Repetition (SRS) Integration**: Refining the SRS algorithm implementation, updating storage layers for FSRS v5, and ensuring full data synchronization across devices.

## Lessons Learned
- Always check for `t()` availability in `vi.json` before adding new keys to avoid duplication.
- Centralizing specific UI themes (like Arena Dark Mode) in CSS variables prevents color drift across components.
- **Structural Integrity**: When using `multi_replace_file_content` on large blocks, double-check closing braces to prevent syntax errors.
- **Test Fragility**: Tests that use `fs.readFileSync` on source code must be updated when refactoring logic into hooks.
- **Identity Guard**: Always verify identity and token lifecycle before pushing to production or interacting with Supabase/Cloudflare.

## Next Actions (archived — SRS)
### Review Core Study Flow (DONE / archived)
- [x] Implement integrated test for Roadmap -> Study -> Exit flow.
- [x] Add choices to StudyPrepScreen: "Only New" vs "New + Learning".
- [x] Update useFlashcard session logic to support new selection modes.
- [x] Verify persistence after learning 1 word and exiting.
- [x] Ensure mastered words are correctly classified in prep stats.
- [x] Modularize StudyPage buttons and stabilize SRS flow.
- [x] Synchronize i18n structure and fix audit failures.
- [ ] 5.5 DB Migration Script (Chuyển đổi 21 records SM-2 sang FSRS)
- [ ] 5.6 Update Types & SRS Algorithm (`ts-fsrs`)
- [ ] 5.7 Update Storage Layer (Mastery & Auth sync)
- [ ] 5.8 Update Hooks (`useFlashcard`, `useReviewSession`, `useFreeStudySession`)
- [ ] 5.9 Update UI Components & Verify Integration

## Hoạt động gần đây (Last Session)
- Hoàn thành dọn dẹp code (Clean Code) và tối ưu hiệu suất (Lazy Loading).
- Sửa lỗi Type mismatch của `Topic` (`sort_order`, `icon`) trong unit test.
- Đã kiểm tra identity với `cm-identity-guard` và push toàn bộ refactor lên nhánh `production` trên GitHub.

## Hoạt động gần đây (Last Session)
- Hoàn thành dọn dẹp code (Clean Code):
    - Tách logic `RoadmapTopicsPage` vào hook `useRoadmapTopics.ts`.
    - Chuẩn hóa helper màu sắc vào `lib/utils.ts`.
    - Chuyển `DashboardPage` sang lazy load để tối ưu bundle.
    - Build thành công, không lỗi Type.
- [x] 4.1 Add loading="lazy" to <img> tags in Landing, Dashboard, Library.
- **Tách biệt chỉ số Mastery (April 22)**:
    - Cập nhật RPC `get_topic_completion_stats` để trả về cả `learned` và `mastered`.
    - Cập nhật `RoadmapTopicsPage` hiển thị 3 chỉ số: Tổng số từ, Đã học, Đã thuộc.
    - Sửa logic Progress Bar dựa trên Mastery % thực tế.
    - Đã chạy unit test `roadmap-page-metrics.test.tsx` đạt 100%.
- **Cập nhật UI Mint Green (April 22)**:
    - Thêm token màu `mint` vào `index.css`.
    - Thay đổi màu nền `WordDetailPanel` sang xanh Mint theo yêu cầu.
- **Sửa lỗi Memory Health (April 22)**:
    - Loại bỏ giá trị fix cứng 90%, tính toán `retention_rate` thực tế từ review logs.
    - Cập nhật RPC `get_initial_app_data_v2` và storage layer frontend.

## Working Context
- **Code Splitting Approach**: Lazy loading routes that are not critical for initial paint (Admin, Study, Progress).
- **Safe Suspense Boundary**: Placing <Suspense> inside Layouts (wrapping <Outlet />) instead of overriding the whole App tree to prevent Navbar unmounting.
- **Chunking Strategy**: Hardcoded groups in Vite: react-core, router, and ui-heavy to prevent circular dependencies.

---

## Previous Goals (Archived)
- [x] MasteryPage Optimization (Master-Detail Refactor) — COMPLETED
- [x] Admin Module Refactoring (Clean Code SRP) — COMPLETED

## Mistakes & Learnings (Latest)
- **Suspense Layout UX Bug**: Wrapping <Routes> directly with <Suspense> unmounts the entire Layout including the Sidebar when switching routes. Fix: Place <Suspense> INSIDE the Layout component wrapping the <Outlet /> element. (2026-04-21)
- **TopicFormModal Save Button**: Buttons in footer div OUTSIDE <form> tag don't trigger onSubmit. Fix: Add id="topic-form" to <form> and form="topic-form" to submit button. (2026-04-20)
- **Refactor Type Mismatch**: Extracting components without verifying child component props causes type errors. Fix: Use `view_file` on child components and run `npm run build` after refactoring to ensure type safety. (2026-04-21)
