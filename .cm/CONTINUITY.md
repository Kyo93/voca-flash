# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Active Goal
- **Code Hygiene (April 2026)**: Completed `cm-clean-code` sprint. Refactored `srs.ts`, `LibraryPage.tsx`, and major isolation of `MasteryPage.tsx` logic.
- **Next Goal**: Performance Optimization (Lazy Loading).

## Lessons Learned
- Always check for `t()` availability in `vi.json` before adding new keys to avoid duplication.
- Centralizing specific UI themes (like Arena Dark Mode) in CSS variables prevents color drift across components.
- **Structural Integrity**: When using `multi_replace_file_content` on large blocks, double-check closing braces to prevent syntax errors.
- **Test Fragility**: Tests that use `fs.readFileSync` on source code must be updated when refactoring logic into hooks.

## Next Actions
### Performance Optimization (ACTIVE)
- [x] 1.1 Create src/components/PageLoader.tsx
- [x] 1.2 Wrap <Outlet /> with <Suspense> in AppLayout.tsx and AdminLayout.tsx
- [x] 1.3 Refactor `MasteryPage.tsx`: Logic isolated in `useMasteryWords.ts`.
- [x] 2.1 Refactor App.tsx: Apply React.lazy to Route pages.
- [x] Optimize Performance: Lazy loading images & Code splitting (Vite chunks)
- [x] Clean Code Sprint: Logic isolation (hooks) & Shared utilities (lib/utils)

## Hoạt động gần đây (Last Session)
- Hoàn thành dọn dẹp code (Clean Code):
    - Tách logic `RoadmapTopicsPage` vào hook `useRoadmapTopics.ts`.
    - Chuẩn hóa helper màu sắc vào `lib/utils.ts`.
    - Chuyển `DashboardPage` sang lazy load để tối ưu bundle.
    - Build thành công, không lỗi Type.
- [x] 4.1 Add loading="lazy" to <img> tags in Landing, Dashboard, Library.

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
