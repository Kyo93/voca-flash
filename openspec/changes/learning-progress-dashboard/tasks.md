# Implementation Checklist — Progress & Mastery Hub

## Phase 1: Foundation & Data
- [x] 1.1 Create `src/pages/ProgressPage.tsx` boilerplate with `AppLayout` and `useAuth`.
- [x] 1.2 Implement data fetching logic using `fetchDashboardStats` and `fetchDashboardSummary`.
- [x] 1.3 Add route for `/progress` in `src/App.tsx`.

## Phase 2: UI Components
- [x] 2.1 Build the **Metrics Grid** (Mastered/Streak/Goal cards) with tactile style.
- [x] 2.2 Build the **Arena Hero Card** with the `hero-gradient` and glass effect.
- [x] 2.3 Build the **Roadmap Progress** list fetching all active roadmaps and calculating their individual completion % concurrently using `Promise.all()`.
- [x] 2.4 Create `src/components/ActivityHeatmap.tsx` with a minimalist grid, stubbing past data but reflecting the actual `streak_days`.

## Phase 3: Polish & Refinement
- [ ] 3.1 Verify typography is exclusively "Be Vietnam Pro" with bold headers.
- [ ] 3.2 Ensure colors strictly follow `primary` (#D35400) and `surface` (#FFFBF2).
- [ ] 3.3 Add hover/active tactile effects to buttons.

## Phase 5: Topic-Aware Study Loop
- [x] 5.1 Update `StudyComplete` to preserve URL parameters for 'Học thêm' button.
- [x] 5.2 Verify that the session re-initializes with the correct filtered words.
