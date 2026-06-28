# Design: Mobile Roadmap Learning Path

## Context & Technical Approach
Redesign only the mobile roadmap detail page behind `MobileRoadmapTopicsView`. Desktop `RoadmapTopicsPage` and data contracts stay unchanged.

The page should feel like a learning path, not a dashboard/card feed. The canonical QA viewport is S25 Ultra `390x850` CSS px.

## Proposed Changes

### `MobileRoadmapTopicsView.tsx`
- Replace the current roadmap header/progress/up-next/card feed with:
- compact top summary strip with roadmap title, learned count, learned percent, and progress bar
- focus card for the best next learning action, prioritizing an in-progress topic when available
- timeline rows for all topics with status dot, connector, progress, word count, and action label
- sticky bottom continuation CTA when a focus topic exists and search is not active

### i18n
- Add mobile roadmap detail labels for timeline, focus action, progress summary, and topic status.

### Tests
- Update mobile learn route tests to assert the focus card and timeline behavior.

## Verification
- `npx vitest run tests/unit/MobileLearnRoutes.test.tsx`
- `npm run build`
- `npm run test:gate` if broad UI changes pass focused tests.
