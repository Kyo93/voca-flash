# Implementation Checklist — Arena UI Glassmorphism 2.0

## Phase 1: Foundations (CSS)
- [ ] 1.1 Add vibrant blob keyframes and colors to `index.css`.
- [ ] 1.2 Implement `.glass-arena-container` and `.glass-arena-item` utilities.
- [ ] 1.3 Add high-contrast text utility classes.

## Phase 2: Layout (ReviewPage)
- [ ] 2.1 Refactor `ReviewPage.tsx` container to `relative` and `fixed`.
- [ ] 2.2 Inject 4 background animated blobs with `blur-3xl`.
- [ ] 2.3 Apply glass styling to the main challenge wrapper.
- [ ] 2.4 Polish Header and Footer text contrast.

## Phase 3: Components (Challenges)
- [ ] 3.1 Refactor `RecognitionChallenge.tsx` (Choice buttons + Word scale).
- [ ] 3.2 Refactor `GhostRecallChallenge.tsx` (Glass card blur + Input glow).
- [ ] 3.3 Refactor `ContextGapChallenge.tsx` (Sentence contrast + Pill hint).
- [ ] 3.4 Refactor `ConstructionChallenge.tsx` / `Phonetics` placeholders.

## Phase 4: Verification
- [ ] 4.1 Manual run-through of 1 review session.
- [ ] 4.2 Browser screenshot audit for all 3 challenge variants.
- [ ] 4.3 Verify mobile responsiveness (stacked layout).
