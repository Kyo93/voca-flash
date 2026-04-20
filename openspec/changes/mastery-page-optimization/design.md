# Design: MasteryPage Master-Detail Optimization

## Context & Technical Approach
The current **MasteryPage (Kho Từ Vựng)** uses an inline expansion model (`expandedId`) to show word details. As we integrate richer linguistic data (synonyms, antonyms, collocations, phonetics, and multiple examples) and detailed SRS performance metrics (FSRS stability charts), the vertical expansion becomes unmanageable, leading to excessive scrolling and poor scannability.

This initiative refactors the page to a **Master-Detail** architecture using a high-performance **Right-Side Detail Panel**.

### Key Technical Decisions:
1. **Drawer Component**: Create a `WordDetailPanel.tsx` that functions as a side-sheet.
2. **State Transition**: Shift from `expandedId` (boolean toggle per row) to `selectedWordId` (single active focus).
3. **Responsive Full-Screen**: Mobile will trigger a `w-full` overlay from the right, ensuring focus and space for dense data.
4. **Halo Modern Styling**: Implementation of glassmorphism and high-density typography to maintain a premium feel.

## Proposed Changes

### [NEW] [WordDetailPanel.tsx](file:///C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/components/WordDetailPanel.tsx)
- Use `framer-motion` for smooth entrance/exit.
- **Header Section**: Word, Audio playback, Phonetic, Notebook (Heart) toggle.
- **Content Tabs**:
    - **Overview**: Core meaning and primary example.
    - **Linguistic**: Placeholders for synonyms, antonyms, and usage patterns.
    - **Notebook**: Direct entry for personal notes.
    - **Analytics**: Visualization of FSRS metrics.

### [MODIFY] [MasteryPage.tsx](file:///C:/Users/Ocean/Documents/VibeCode/English/Voca-flash/src/pages/MasteryPage.tsx)
- Remove `expandedId` logic.
- Integrate `WordDetailPanel` at the root level of the page.
- Implement selection logic on `CardRow` click.

### [MODIFY] [CardRow] (Component within MasteryPage)
- **Extreme Cleanliness**: Remove inline actions (Audio icon, Heart icon) from the row.
- **Density optimization**: Shrink row height and focus on Word + Primary Meaning.

## Verification
- **Functional**: Clicking any word opens the correct detail panel.
- **Notebook Sync**: Saving a note in the panel reflects in the list state (and vice versa).
- **Responsive**: Full-screen overlay on screens < 768px.
- **Performance**: Ensure selection/deselection is instant even with 50+ words loaded.
