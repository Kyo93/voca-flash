# Design: Zen Arena 2.0 (The Reward & Flow Update)

## Context & Technical Approach
This initiative focuses on transforming the Review Arena from a functional tool into a premium, high-engagement experience. We will use **Framer Motion** for kinetic UI and enhance the **Session Summary** to provide meaningful feedback and habit-building triggers.

### Technical Pillars:
1.  **Kinetic Motion**: Integrating `framer-motion` to handle complex layout animations (like word fragments sliding) and micro-interactions.
2.  **Feedback Loops**: Visual and auditory (optional) rewards for correct actions.
3.  **Active Review**: The summary page will no longer just be stats; it will be a learning terminal where "Mistakes" are reviewed.

## Proposed Changes

### 1. Foundation & Dependencies
#### [MODIFY] [package.json](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/package.json)
- Add `framer-motion` for fluid animations.

### 2. Kinetic Challenges
#### [MODIFY] [ConstructionChallenge.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/review/ConstructionChallenge.tsx)
- Wrap blocks in `AnimatePresence`.
- Use `layoutId` to animate characters sliding from the "Source" area to the "Built" area.
- Add `whileHover` and `whileTap` scaling.

#### [MODIFY] [RecognitionChallenge.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/review/RecognitionChallenge.tsx)
- Add entrance animations for choice buttons.
- Implement a "Pop" animation using Framer Motion when a correct choice is made.

### 3. Habit-Building Summary
#### [MODIFY] [SessionSummary.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/review/SessionSummary.tsx)
- **XP Progression**: Animate the XP number counting up.
- **Mistakes Audit**: Add a section displaying the words the user got wrong during the session, allowing for "Passive Review" before leaving.
- **Glassmorphic Particles**: Add subtle background particle animations to celebrate completion.

## Verification Plan

### Automated Tests
- `npm test`: Ensure core SM-2 logic and component rendering still pass after wrapping in Framer Motion providers.

### Manual Verification (UAT Flow 6)
1.  **Flow**: Start Review Arena.
2.  **Interaction**: Click characters in `ConstructionChallenge`. 
    - **Pass Criteria**: Characters must slide smoothly (not jump) to the target area.
3.  **Session End**: Complete session.
    - **Pass Criteria**: XP counts up visually. Mistakes list is visible and accurate.
