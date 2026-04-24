# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Active Goal
- **Clean Code April 2026 v2 — 35/39 tasks complete**. 13 commits on `production`. All phases done except high-risk A4/A1 splits (permanently deferred) and B2 AdminModal (design decision pending). Plan: `openspec/changes/clean-code-april-2026-v2/`.

## Current Phase
- execution → complete. Only V.4 manual smoke test remains. All code changes committed.

## Next Actions
- [ ] V.4 Manual smoke test — login, study session, review challenges (GhostRecall/ContextGap/Construction), admin CRUD (word/topic/roadmap), import flow (file + Sheets URL), word pool tag filter + bulk assign
- Archive OpenSpec folder to `openspec/changes/archive/2026-04-23-clean-code-v2/` after smoke test passes

## Working Context (Clean Code v2)
- 13 commits landed: `d874c22` (Phase 1), `6aca5c2` (Phase 2), `c540e40` (Phase 3 primitives), `5623646` (A10), `069c90e` (B1 useAdminResource), `dca414e` (A5 useRoadmapForm), `9482f9a` (A9 NoteTab), `4d39e15` (A2+B10 useRoadmapSetup + refreshAll), `d162d39` (A7 useDragReorder + AdminTopicCard), `6dbd9a1` (A8 useImportFlow), `ca4e088` (fix stale closure startSession), `bcbdc63` (A3 WrongChoicesInput), `935836d` (A6 WordPool sub-components).
- New sub-components: `WordFormModal/WrongChoicesInput.tsx`, `word-pool/TagFilterChips.tsx`, `word-pool/BulkAssignBar.tsx`, `word-pool/WordPoolTable.tsx`.
- Bug fixed: `useFlashcard.startSession` stale closure — `profile` added to dep array so `daily_target` is always current.
- 382 tests pass. Typecheck clean. Build succeeds (715ms).
- Permanently deferred: A4 (useFlashcard split — stateRef + two-way AuthContext coupling), A1 (AuthProvider split — atomic applyAppData batch, no unit tests), B2 (AdminModal — ImportWordsModal 4-state footer incompatible with shared slot API).

## Lessons Learned (this session)
- Primitives-first ordering paid off: each consumer migration was isolated, typecheck stayed green between commits.
- Don't over-unify — when two "similar" UIs diverge in critical ways (slug with prefix vs plain slug), keeping them separate beats an awkward options-soup component.
- `parseSource((load) => ...)` callback-injection pattern collapses two near-identical try/catch wrappers into one — same trick as the `useAdminResource.runMutation` helper.
- Generic admin-CRUD factory works cleanly with `<T, Args extends unknown[] = []>` so `getAllWords(topicFilter, search)` and `getAllTopics()` both fit one base hook.
- `useDragReorder<T extends {id: string}>` was straightforward to extract because TopicPanel's drag logic was pure HTML5 — no library coupling.
- React 19 `useRef<T | undefined>(null)` no longer compiles — pass `undefined` explicitly.
- File-grep tests that reference moved code need updating in the same commit; verify with `npx vitest run --reporter=dot` before pushing.

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
