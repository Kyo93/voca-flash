# Design: Clean Code Hygiene & Polish (Standard CM)

## Context & Technical Approach
Following the 1A Architecture refactoring, several "magic numbers" and hardcoded strings remain, creating technical debt and blocking multi-language scalability. 

**Approach**:
1. **Abstraction**: Move all domain logic parameters (SRS levels, timer thresholds) to a centralized `constants.ts`.
2. **Standardization**: Implement `i18next` pluralization for time intervals to handle complex naming (1 day vs 2 days) natively.
3. **Strict Typing**: Eliminate `any` in core hooks to prevent runtime errors during future refactors.

## Proposed Changes

### Configuration Layer
#### [NEW] [constants.ts](file:///C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/constants.ts)
- Trích xuất hằng số: `SRS_STABILITY_LEVELS` (90, 21, 3), `STUDY_SESSION_DEFAULTS` (Timer 30s, Rating thresholds 3s/8s), `MASTERY_CONFIG` (Page size 50).
- Rationale: Single source of truth for balancing game logic.

### Logic & SRS
#### [MODIFY] [srs.ts](file:///C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/lib/srs.ts)
- Refactor `formatInterval` to support pluralization keys.
- Replace literal numbers with imported constants.

#### [MODIFY] [useStudySessionMode.ts](file:///C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/hooks/useStudySessionMode.ts)
- Replace `any` with `CardProgress` interface.
- Inject timer constants into session orchestration logic.

### Internationalization (i18n)
#### [MODIFY] [vi.json](file:///C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/i18n/vi.json)
- Add required keys for `srs.interval` (with `_other` suffix for plural) and `mastery.stats`.

### UI Components
#### [MODIFY] [MasteryPage.tsx](file:///C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/pages/MasteryPage.tsx)
- Apply `t()` to all headers, stat labels, and pagination logic.

#### [MODIFY] [AudioButton.tsx](file:///C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/components/common/AudioButton.tsx)
- Add `aria-label` and `title` for accessibility compliance.

## Verification
### Automated Tests
- `npm run test:gate`: Must pass 100% to ensure SRS logic remains intact.

### Manual Verification
- **Visual i18n Audit**: Verify "Daily Mastery" and stat labels in MasteryPage show correct Vietnamese strings.
- **SRS Loop**: Verify interval previews on the assessment screen use the new pluralized logic.
- **A11y**: Verify tooltips appear on hover for `AudioButton`.
