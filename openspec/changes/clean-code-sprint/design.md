# Design: Clean Code Sprint (April 2026)

## Context & Technical Approach
Post-feature hygiene pass. Focus on modularizing `WordDetailPanel` (350+ lines) and unifying SRS state logic across frontend and backend storage layers.

## Proposed Changes

### Lib & Storage
- **constants.ts**: Centralize `FSRS_STATES`.
- **srs.ts**: Standardize status checks.
- **session.ts**: Remove redundant logic, use `isMastered`.

### UI Components
- **WordDetailPanel.tsx**: Extract tabs into focused sub-components.
- **SrsLevelBadge.tsx**: Share badge logic between Table rows and Detail panel.

## Verification
- Unit tests pass.
- Manual check of Word Detail tabs.
