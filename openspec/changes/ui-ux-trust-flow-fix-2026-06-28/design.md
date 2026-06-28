# Design: UI/UX Trust and Flow Fix

## Context & Technical Approach

This change implements the first recommendation from `ui-ux-learning-audit-2026-06-28`: fix visible trust-breakers before any broader redesign.

The scope is intentionally narrow:

- Keep current visual direction and page composition.
- Fix user-visible i18n key leakage and mojibake.
- Prevent `/study` from remaining in an indefinite spinner when study prep loading fails.
- Restore the desktop shell layout contract so Mastery content and RightSidebar fit at 1440px.
- Raise important global/admin controls toward the existing 44px ergonomic target.

## Proposed Changes

### i18n Files

- Add missing `settings.profile` keys used by `ProfileSection`.
- Add missing `admin.words.*` keys used by the Admin Words page.
- Correct Vietnamese admin sidebar mojibake strings.
- Keep `vi.json` and `en.json` in parity.

### `useFlashcard`

- Wrap `fetchStudyPrepData` in `try/catch/finally`.
- Store a loading error key in hook state.
- Return a clear prep-screen state instead of leaving `isLoading` true.

### `StudyPage` / `StudyPrepScreen`

- Render a localized error/empty recovery surface when study prep cannot load.
- Preserve existing Study Prep behavior when data loads normally.

### Mastery Desktop

- Keep the desktop Mastery page inside the AppLayout center column.
- Avoid horizontal page overflow caused by wide containers and RightSidebar displacement.
- Keep the internal word table scrollable if columns need more width.

### Shell/Admin Controls

- Raise high-frequency icon buttons and table row actions to at least 44px where practical.
- Preserve desktop density for non-interactive text and compact metrics.

## Verification

- RED/GREEN focused unit tests for:
  - missing translation key regressions
  - `useFlashcard.initialize()` failure state
  - Mastery desktop width contract in source
  - key control target-size classes
- Run focused tests after implementation.
- Run `npm run build`.
- Run final `npm run test:gate`.
