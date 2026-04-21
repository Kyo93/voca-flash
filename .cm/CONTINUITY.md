# CM Working Memory — VocaFlash

> Auto-updated by CM skills. Read at session start.

## Active Goal
Performance Optimization (Code Splitting & Chunking) — COMPLETED

## Next Actions
### Performance Optimization (PLANNED — 2026-04-21)
- [ ] 1.1 Tạo src/components/PageLoader.tsx
- [ ] 1.2 Bọc <Outlet /> với <Suspense> tại AppLayout.tsx và AdminLayout.tsx
- [ ] 2.1 Refactor App.tsx: Áp dụng React.lazy cho các Route pages.
- [ ] 3.1 Chỉnh sửa ite.config.ts: Define manualChunks.
- [ ] 4.1 Thêm loading="lazy" cho thẻ <img> tại Landing, Dashboard, Library.

## Performance Optimization Working Context
- **Code Splitting Approach**: Lazy loading routes that are not critical for initial paint (Admin, Study, Progress).
- **Safe Suspense Boundary**: Placing <Suspense> inside Layouts (wrapping <Outlet />) instead of overriding the whole App tree to prevent Navbar unmounting.
- **Chunking Strategy**: Hardcoded groups in Vite: 
eact-core, 
outer, and ui-heavy to prevent circular dependencies.

---

## Previous Goals (Archived)
- [x] MasteryPage Optimization (Master-Detail Refactor) — COMPLETED
- [x] Admin Module Refactoring (Clean Code SRP) — COMPLETED

## Mistakes & Learnings (Latest)
- **Suspense Layout UX Bug**: Wrapping <Routes> directly with <Suspense> unmounts the entire Layout including the Sidebar when switching routes. Fix: Place <Suspense> INSIDE the Layout component wrapping the <Outlet /> element. (2026-04-21)
- **TopicFormModal Save Button**: Buttons in footer div OUTSIDE <form> tag don't trigger onSubmit. Fix: Add id="topic-form" to <form> and orm="topic-form" to submit button. (2026-04-20)
- **Refactor Type Mismatch**: Extracting components without verifying child component props causes type errors. Fix: Use `view_file` on child components and run `npm run build` after refactoring to ensure type safety. (2026-04-21)
