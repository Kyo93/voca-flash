# Design: Mastery Notebook Screen

## Context & Technical Approach
VocaFlash already has `user_notebook_entries`, `useNotebook`, and note editing inside the Mastery detail panel. The missing piece is a dedicated saved-word screen.

The implementation will add a Mastery-scoped full-screen overlay instead of a new route. It will fetch saved notebook entries with joined word information and persist local UI preferences in `localStorage`.

## Proposed Changes

### `src/lib/storage/notebook.ts`
- Add `NotebookWordEntry` for saved entries joined to `words`.
- Add `fetchNotebookWordEntries(userId)` ordered by latest notebook update.

### `src/components/mastery/NotebookScreen.tsx`
- New full-screen dialog.
- Supports view styles: `journal`, `study`, `dictionary`.
- Supports personalization controls: style, density, image visibility.
- Displays useful word information: word, phonetic, definition, example, image, saved date, and personal note.
- Allows inline note editing through the existing `RichNoteEditor` and `updateNotebookNote`.

### Revision: Open English Dictionary Layout
- The notebook body should look like an opened physical English dictionary, not a dashboard card list.
- Saved words render inside two page surfaces with a visible center spine.
- Word entries use dictionary-like typography and separators while preserving note editing.
- Personalization still applies to the page density, note emphasis, and image visibility.

### Revision: Dimensional Lexical Archive Layout
- Add dark cover edges, page depth layers, and heavier book shadows so the spread reads as a physical object.
- Left page acts as a recent-additions archive/list.
- Right page uses a raised "word investigation" panel for the selected saved word.
- Selecting a word from the left page updates the detail panel while keeping note editing on the detail side.

### Revision: Stitch Source Ratio Alignment
- Source design folder: `C:\Users\Ocean\Downloads\stitch_l_t_m_anh_ng`.
- Source screenshot is `1600 x 1280`; source book spread uses `aspect-[1.4/1]`.
- Target implementation should make the notebook book itself follow `aspect-ratio: 1.4 / 1` on desktop.
- The visual direction should match the source book proportions: two equal white pages, low-radius page corners, subtle center binding, and warm ambient book shadow.
- `cm-design-system` output is saved to `.stitch/DESIGN.md`.
- `cm-ui-preview` prompt-only blueprint is saved to `.stitch/next-prompt.md` because Stitch MCP tools are not available in this Codex session.

### Revision: Minimal Focus Shell
- The notebook overlay should use a restrained warm background so the physical book is the dominant visual object.
- Header content should be reduced to title, saved count, search, and close only.
- Personalization controls should sit in a vertical rail on the right edge of the book, ordered top-to-bottom: style, density, image visibility.
- The rail must preserve the same labels, callbacks, and pressed states so existing personalization behavior stays intact.

### Revision: Complete Learning Profile
- Increase the physical book stage to make room for richer vocabulary details without turning the screen back into a dashboard.
- Extend notebook storage to fetch available learning fields from `words`: `synonyms`, `antonyms`, and `word_family`.
- Keep the left page as the saved-word index and make the right page a complete learning profile:
  pronunciation and stress, part of speech, meaning, contextual example, word family, synonyms, antonyms, collocations, visual mnemonic, and personal note.
- Since the current schema has no `collocations` column, derive lightweight collocation candidates from the saved example sentence until a dedicated data field exists.

### Revision: Compact No-Scroll Profile
- Increase the book stage again to `max-w-[92rem]` so the page feels closer to a large desk dictionary.
- The right page should not have its own vertical scrollbar in normal reading mode.
- Remove duplicate metadata from the right-page header: the word title stays in the header, while IPA/stress and part-of-speech live only in their dedicated learning blocks.
- Arrange the right page as a compact two-column learning grid with a combined meaning/example row and tighter block padding, so the complete profile is visible at once.

### Revision: Headline Facts
- Pronunciation/stress and part-of-speech should sit beside the selected word title as compact headline facts.
- The lower learning grid should start with meaning/example, then word family, synonyms, antonyms, collocations, image, and note.
- This keeps the top of the page visually balanced and avoids pushing key details below the fold.

### Revision: Minimal Ruled Note
- The right page should read like a handwritten notebook entry rather than a dashboard or card grid.
- Use one title line with the word, IPA, and POS chip, matching the user's reference.
- Render definition, Vietnamese meaning, example, related words, and personal note as natural lines on a ruled-paper background.
- Collapse word family, synonyms, antonyms, and derived collocations into one lightweight related-words panel.

### Revision: Required Field Rows
- Keep the ruled-note page style, but do not hide required vocabulary fields inside a generic merged chip list.
- Meaning, Vietnamese, contextual example, word family, synonyms, antonyms, collocations, and personal note should each have a distinct minimal row.
- The field rows use small left labels and notebook-line spacing instead of card containers.

### Revision: Remove Green Field Container
- Do not wrap the expanded vocabulary fields in one large green panel.
- Word family, synonyms, antonyms, and collocations remain individual ruled-paper rows.
- Subtle chips are acceptable, but the container itself should stay transparent so the page still reads like notebook paper.

### Revision: Bullets And Accent Rules
- Ruled-note rows should use small bullet markers like the reference screenshot.
- The title line keeps a red/orange left accent rule.
- Important text rows such as Vietnamese and example lines can use a subtle red/orange left rule while staying on the paper background.

### `src/components/mastery/MasteryHeader.tsx`
- Add notebook icon button next to Flash Review.
- Show saved count from notebook entries.

### `src/pages/MasteryPage.tsx`
- Track notebook overlay open state.
- Wire saved entries and note update callbacks.

### `src/i18n/{vi,en}.json`
- Add notebook screen labels under `mastery.notebook`.

## Verification
- RED: focused tests fail before implementation.
- GREEN: focused tests pass after implementation.
- Full gates: `npm run build` and `npm run test:gate`.
