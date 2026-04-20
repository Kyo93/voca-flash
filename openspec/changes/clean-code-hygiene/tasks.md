# Implementation Checklist: Clean Code Hygiene

## Phase 1: Foundations (Infrastructure)
- [ ] 1.1 Create `src/lib/constants.ts` with SRS/Timer/Mastery thresholds
- [ ] 1.2 Add missing i18n keys to `src/i18n/vi.json` (Pluralized intervals, Mastery stat labels)

## Phase 2: Logic Refactoring (Core)
- [ ] 2.1 Refactor `src/lib/srs.ts` to use hằng số và i18next pluralization
- [ ] 2.2 Strict Typing: Replace `any` in `src/hooks/useStudySessionMode.ts` with `CardProgress`
- [ ] 2.3 Inject timer constants into `useStudySessionMode.ts` logic

## Phase 3: UI Harmonization (Frontend)
- [ ] 3.1 100% i18n pass for `src/pages/MasteryPage.tsx` (Grid headers and stat labels)
- [ ] 3.2 Add accessibility attributes (`aria-label`, `title`) to `AudioButton.tsx`
- [ ] 3.3 Visual verification of StudyPage labels (English labels -> Vietnamese i18n)

## Phase 4: Quality Assurance (Verification)
- [ ] 4.1 Run `npm run test:gate` (Verify 197/197 tests pass)
- [ ] 4.2 E2E Smoke Test: Study -> Challenge -> Rate (Verify interval labels & timing)
- [ ] 4.3 Visual Audit: Mastery Page Stat Grid (Verify correct i18n mapping)
