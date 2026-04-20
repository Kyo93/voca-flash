# Implementation Checklist - Clean Code Unification

## Phase 1: Shared Core Foundations
- [ ] 1.1 Create `src/components/common/AudioButton.tsx` (Logic extraction)
- [ ] 1.2 Replace ad-hoc audio logic in `StudyPage`, `LibraryPage`, `MasteryPage`
- [ ] 1.3 Add `getSrsLevelConfig` helper to `src/lib/srs.ts`
- [ ] 1.4 Synchronize SRS labels in `MasteryPage` and `WordDetailPanel`
- [ ] Verification: `npm run test:gate` pass 197/197

## Phase 2: Segmentation (StudyPage Surgery)
- [ ] 2.1 Create `src/components/study/FlashcardFront.tsx` & `FlashcardBack.tsx`
- [ ] 2.2 Create `src/components/study/StudyComplete.tsx`
- [ ] 2.3 Implement `useStudySessionMode.ts` (Timer + Phase logic with Guard Clauses)
- [ ] 2.4 Inject new components into `StudyPage.tsx` and delete dead code
- [ ] Verification: Check Study Session stability (Tab switching persistence)

## Phase 3: Roadmap & Mastery Refactoring
- [ ] 3.1 Create `src/components/roadmap/TopicCard.tsx` (Supports Standard/Featured/UpNext)
- [ ] 3.2 Refactor `RoadmapTopicsPage.tsx` to use the unified Card component
- [ ] 3.3 Extract `CardRow` to `src/components/mastery/CardRow.tsx`
- [ ] 3.4 Verification: Final pixel-perfect UI check on Mobile/Desktop

## Phase 4: Final Hygiene Pass
- [ ] 4.1 Global scan for Magic Numbers and Hex Colors replacement
- [ ] 4.2 Final test pass and Walkthrough documentation
- [ ] Verification: `npm run build` to ensure no regression
