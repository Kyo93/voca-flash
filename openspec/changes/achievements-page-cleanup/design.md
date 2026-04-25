# Design: Achievements Page Cleanup

## Context
The Progress dashboard currently renders too many achievement rows in the right column. Some rows are placeholders without a reliable data source, which makes the UI look longer than the surrounding dashboard cards and risks misleading learners.

## Proposed Changes
### Achievement Domain
- Move achievement eligibility into a pure `src/lib/achievements.ts` module.
- Keep only achievements backed by existing metrics: EXP, streak days, mastered words, and total study time.
- Exclude placeholder achievements until the product has a real source of truth for them.

### Progress Dashboard
- Keep the Progress card compact by showing a limited recent/nearby achievement list.
- Link the card header to a full badge page.

### Full Badge Page
- Add `/achievements` under the authenticated app layout.
- Show reward level progress, unlock count, and all badges grouped by metric category.

## Verification
- Unit-test achievement unlock rules and compact-list limiting.
- Run focused tests, build, and the project test gate.
