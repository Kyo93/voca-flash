# Implementation Checklist — Zen Arena 2.0

## Phase 1: Foundation & Motion Setup
- [ ] 1.1 Install dependencies: `npm install framer-motion`
- [ ] 1.2 Verify `framer-motion` installation and build health
- [ ] 1.3 Audit `ConstructionChallenge.tsx` for layout animation hooks

## Phase 2: Kinetic Challenges (The "Flow" Update)
- [ ] 2.1 Refactor `ConstructionChallenge.tsx`:
    - [ ] Wrap with `AnimatePresence`
    - [ ] Add `layoutId` to characters for sliding motion
    - [ ] Add Tap/Hover micro-animations
- [ ] 2.2 Enhance `RecognitionChallenge.tsx`:
    - [ ] Add staggered entrance animations for choices
    - [ ] Add "Success/Fail" visual feedback animations

## Phase 3: Habit-Building Summary (The "Reward" Update)
- [ ] 3.1 Refactor `SessionSummary.tsx`:
    - [ ] Implement XP Counter (Animate from 0 to target)
    - [ ] Create "Recent Mistakes" list component
    - [ ] Add celebratory background motion (Motion-driven particles)
- [ ] 3.2 Update `useReviewSession.ts` to track "Mistakes list" through the session state

## Phase 4: Final Polish & Verification
- [ ] 4.1 UI/UX Audit: Ensure all motion aligns with the "Zen" aesthetic (subtle, not distracting)
- [ ] 4.2 Update `UAT-GUIDE.md` with Flow 6
- [ ] 4.3 Final Build & Push to production branch
