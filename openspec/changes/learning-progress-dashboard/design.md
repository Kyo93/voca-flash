# Design: Progress & Mastery Hub

## Context & Technical Approach
The user needs a centralized hub to track learning progress, visualized through high-fidelity metrics and a "Daily Review Arena" launchpad. We will implement the `ProgressPage.tsx` using the "Tactile Scholar" (Warm Light Mode) aesthetic.

### Data Strategy & Performance
We will leverage existing Supabase storage functions:
1. **Global Mastery**: `fetchDashboardStats` provides total words, mastered words, and current streak.
2. **Review Readiness**: `fetchDashboardSummary` provides the `globalReviewCount` (words due for review).
3. **Roadmap Progress**: We will fetch the list of roadmaps via `fetchRoadmaps`. To avoid N+1 query performance issues, we must use `Promise.all()` to calculate `fetchRoadmapStats` for all roadmaps concurrently.

> [!WARNING]
> **Heatmap Data Constraint**: The database currently does not store historical session logs (`study_logs`); `user_srs_records` only stores the *latest* review date per word. Therefore, a true 30-day GitHub-style heatmap is impossible without a backend schema change. For Phase 1, `ActivityHeatmap.tsx` will be rendered as a UI placeholder (stubbed past data) mixed with the current `streak_days` to represent recent continuous activity.

### UI Approach
- **Layout**: Tri-column grid using `AppLayout`.
- **Styling**: Tailwind v4 with the custom tokens defined in `index.css` (`primary`, `surface`, `glass-panel`, `hero-gradient`).
- **Typography**: Be Vietnam Pro (Extra Bold for headlines).

## Proposed Changes

### [NEW] ProgressPage.tsx
A new page component that aggregates all learning data.
- **Section 1: Metrics Grid** (Mastered, Learning, Streak).
- **Section 2: Daily Arena** (Hero card with review count and CTA to `/review`).
- **Section 3: Roadmap Progress** (List of active roadmaps with percentage bars).
- **Section 4: Activity Heatmap** (Grid component visualizing study frequency).

### [MODIFY] App.tsx
- Connect the `/progress` route to the new `ProgressPage`.

### [NEW] ActivityHeatmap.tsx
- A reusable component to render the study consistency grid. Data will be stubbed for past activity (due to lack of history table), but the most recent continuous days will light up based on `streak_days` and `last_study_date`.

## Verification
1. **Visual Match**: Verify colors and typography match the "Tactile Scholar" design system.
2. **Data Accuracy**: Confirm metrics (Mastered, Streak, Review Count) match the values shown on the Dashboard.
3. **Navigation**: Ensure the "ENTER THE ARENA" button correctly redirects to `/review`.
4. **Roadmap Sync**: Verify that progress bars for "Vỡ lòng" and "English Mastery" reflect actual mastery counts.
