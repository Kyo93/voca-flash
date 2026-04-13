# Design: Arena UI Glassmorphism 2.0

## Context & Technical Approach
The user is experiencing significant contrast and legibility issues in the current "Arena" (Review) interface. The chosen fix is a **Glassmorphism 2.0 (Vibrant Accent)** aesthetic. 

This approach combines:
1.  **Dynamic Depth**: High-opacity glass panels on top of animated background blobs.
2.  **Visual Friction Control**: Using `backdrop-filter: blur(40px)` rather than just transparency to ensure text background is "quiet" enough for readability.
3.  **High-Contrast Typography**: Utilizing pure white/neon-accent colors and increased font weights ($ font-black $) to prevent text from washing out.

## Proposed Changes

### 1. Global CSS Foundations [MODIFY] [index.css](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/index.css)
- **Blobs**: Refine `animate-blob` to be more organic. Define 3 specific blob colors:
    - Primary Splash: `#D35400`
    - Cyan Glow: `#0891B2`
    - Deep Slate: `#1E293B`
- **Glass V2 Utility**: 
    - `.glass-arena-container`: `bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl`.
    - `.glass-arena-item`: `bg-white/10 hover:bg-white/20 transition-all active:scale-95`.
- **Text Utilities**: `.text-shadow-glow` to add a subtle drop shadow to primary headings, ensuring they "pop" from the background.

### 2. Layout Overhaul [MODIFY] [ReviewPage.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/pages/ReviewPage.tsx)
-   **Background Stage**: Add the blob container as the first child of the viewport.
-   **Structure**: 
    - The main container will maintain `bg-[#0a0a0c]` as the absolute base.
    - Blobs will be `absolute` with `z-0`.
    - Content will be `relative` with `z-10`.
-   **Glass Container**: Wrap the `{session.currentChallenge}` area in a `glass-arena-container` card to ground the interactive elements.

### 3. Challenge Component Polish

#### [RecognitionChallenge.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/review/RecognitionChallenge.tsx)
- **Main Word**: High-contrast white, scaled up.
- **Phonetic**: `text-white/40` (up from 20) with a slightly larger font size.
- **Buttons**:
    - Default: `.glass-arena-item`.
    - Correct Selection: Neon border glow with increased opacity.
    - Wrong Selection: Soft Red glow.

#### [GhostRecallChallenge.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/review/GhostRecallChallenge.tsx)
- **Blur Logic**: Ensure the "ghost" blur is heavy enough to be unreadable but visually distinct as a "glass" panel. Use `grayscale` + `blur` for a more "archival" feel.
- **Input**: Neon underline that pulses on focus.

#### [ContextGapChallenge.tsx](file:///c:/Users/Ocean/Documents/VibeCode/English/voca-flash/src/components/review/ContextGapChallenge.tsx)
- **Sentence**: `text-white/95` for the main parts, with the gap highlighted in a vibrant primary color.
- **Hint Panel**: Shift from a flat box to a floating glass pill.

## Verification
1.  **Visual Audit**: Use the browser subagent to capture high-res screenshots of each stage.
2.  **Contrast Check**: Verify that "White on Primary" and "White on Glass" meet a minimum 4.5:1 ratio.
3.  **Flow Test**: Complete a full session of 5 words to ensure animations don't stutter and transitions remain fluid.
