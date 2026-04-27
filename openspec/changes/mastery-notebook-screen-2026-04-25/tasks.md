# Implementation Checklist

- [x] 1.1 Add failing tests for notebook storage joined-word query.
- [x] 1.2 Add failing tests for notebook screen rendering and personalization.
- [x] 2.1 Implement `fetchNotebookWordEntries` and types.
- [x] 2.2 Implement `NotebookScreen` overlay.
- [x] 2.3 Add notebook button to `MasteryHeader`.
- [x] 2.4 Wire notebook overlay in `MasteryPage`.
- [x] 2.5 Add i18n keys for Vietnamese and English.
- [x] 3.1 Run focused tests.
- [x] 3.2 Run `npm run build`.
- [x] 3.3 Run `npm run test:gate` without unrelated suite failures.
- [x] 4.1 Add RED test for an open two-page dictionary spread.
- [x] 4.2 Replace notebook card list with the two-page open-book surface.
- [x] 4.3 Re-run focused notebook tests and build.
- [x] 5.1 Add RED test for dimensional cover edges and word investigation panel.
- [x] 5.2 Add i18n labels for lexical archive page sections.
- [x] 5.3 Refine notebook spread with 3D cover depth, left archive list, and right detail panel.
- [x] 5.4 Re-run focused notebook tests, build, and full gate.
- [x] 6.1 Read supplied Stitch design source from `C:\Users\Ocean\Downloads\stitch_l_t_m_anh_ng`.
- [x] 6.2 Extract book ratio and design tokens into `.stitch/DESIGN.md`.
- [x] 6.3 Save cm-ui-preview prompt-only blueprint to `.stitch/next-prompt.md`.
- [x] 6.4 After user confirmation, implement the `aspect-ratio: 1.4 / 1` book proportions in `NotebookScreen`.
- [x] 7.1 Add RED test for minimal notebook shell and right-side vertical personalization rail.
- [x] 7.2 Replace the heavier header/menu controls with a compact header and book-focused stage.
- [x] 7.3 Move style, density, and image controls into the vertical rail beside the book.
- [x] 7.4 Re-run focused notebook tests, `npm run test:gate`, and `npm run build`.
- [x] 8.1 Add RED tests for complete learning profile fields and larger book stage.
- [x] 8.2 Fetch `synonyms`, `antonyms`, and `word_family` in notebook joined-word storage.
- [x] 8.3 Rework the right dictionary page into pronunciation, POS, meaning, example, word-family, synonym/antonym, collocation, image, and note sections.
- [x] 8.4 Re-run focused notebook/storage tests, `npm run test:gate`, and `npm run build`.
- [x] 9.1 Add RED test for larger non-scrolling compact right page and duplicate metadata removal.
- [x] 9.2 Increase the book stage to `max-w-[92rem]`.
- [x] 9.3 Compact the right page into a two-column learning grid and remove duplicate phonetic/POS header metadata.
- [x] 9.4 Re-run focused notebook tests, `npm run test:gate`, and `npm run build`.
- [x] 10.1 Add RED test for headline-aligned pronunciation and part-of-speech facts.
- [x] 10.2 Move pronunciation and POS into compact cards beside the selected word title.
- [x] 10.3 Remove pronunciation and POS from the lower learning grid.
- [x] 10.4 Re-run focused notebook tests, `npm run test:gate`, and `npm run build`.
- [x] 11.1 Add RED test for a minimal ruled-note right page with no card/grid layout.
- [x] 11.2 Replace the right-page learning grid with a natural lined notebook entry.
- [x] 11.3 Keep word, IPA, and POS on a single title line and merge expansion data into a lightweight related-words panel.
- [x] 11.4 Re-run focused notebook tests, `npm run test:gate`, and `npm run build`.
- [x] 12.1 Add RED test for all required vocabulary fields as labeled ruled-note rows.
- [x] 12.2 Render meaning, Vietnamese, example, word family, synonyms, antonyms, collocations, and note as distinct minimal rows.
- [x] 12.3 Keep the ruled-note style without reverting to a grid/card UI.
- [x] 12.4 Re-run focused notebook tests, `npm run test:gate`, and `npm run build`.
- [x] 13.1 Add RED test that expansion fields are not wrapped in one green block.
- [x] 13.2 Remove the green wrapper from the related vocabulary section.
- [x] 13.3 Keep word family, synonyms, antonyms, and collocations as ruled-paper rows.
- [x] 13.4 Re-run focused notebook tests, `npm run test:gate`, and `npm run build`.
- [x] 14.1 Add RED test for bullet markers and red/orange accent rules.
- [x] 14.2 Add bullet markers to ruled-note vocabulary rows.
- [x] 14.3 Add red/orange accent rules to the title line and VN/example rows.
- [x] 14.4 Re-run focused notebook tests, `npm run test:gate`, and `npm run build`.

## Verification Note

Bullet and accent-rule verification passed: focused notebook tests passed, `npm run test:gate` passed with 503 tests, and `npm run build` passed.
