# Design: Mobile viewport fit for S25 Ultra

## Context & Technical Approach
Several mobile surfaces now preserve desktop spacing too aggressively. On a tall Android device such as S25 Ultra, feed pages can scroll, but short focus screens should keep their primary action in view without unnecessary vertical scroll. The first target is Study Prep; related study/review surfaces should use compact mobile spacing while keeping desktop density unchanged through responsive classes.

## Proposed Changes
### StudyPrepScreen
- Add a mobile compact layout contract for the prep card.
- Reduce mobile padding, icon size, title size, stat row spacing, and action spacing.
- Keep desktop spacing behind `sm:` classes so the existing desktop feel remains.

### StudyPage and Study Actions
- Tighten mobile top/bottom spacing, progress spacing, flashcard aspect ratio, and action margins.
- Keep tap targets at or above 44px.

### Flashcard and Challenge Components
- Apply responsive card padding and text sizes for front/back faces.
- Reduce challenge shell padding on mobile.
- Keep back-face notebook action accessible with a 44px target.

### Mobile Shell/Hub Screens
- Normalize mobile main padding so screens do not double-pad above the bottom nav.
- Fix any sub-44px back actions found during audit.

## Verification
- Add source-level regression coverage for compact mobile focus surfaces.
- Run the focused mobile layout tests.
- Run `npm run build`.
- Run `npm run test:gate`.
