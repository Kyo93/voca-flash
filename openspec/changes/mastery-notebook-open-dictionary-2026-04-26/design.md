# Design: Mastery Notebook Open Dictionary

## Context & Technical Approach
The user wants the Mastery notebook to return to the supplied open-dictionary HTML design: a bright paper-focused two-page spread with ruled pages, large academic vocabulary detail, visual mnemonic, and handwritten personal notes.

## Proposed Changes

### `src/components/mastery/NotebookScreen.tsx`
- Replace the dark wood-desk stage with a light paper-texture shell.
- Keep saved-word data, search, style/density/image preferences, and note editing behavior.
- Rebuild the book frame as a large two-column dictionary spread (`max-w-[1720px]`, `min-h-[900px]` style intent).
- Render left page as Recent Additions plus Visual Mnemonic.
- Render right page as headword, phonetics, meaning, example, word family, synonyms, antonyms, collocations, SMART vocabulary, and sticky personal note.

### `tests/unit/NotebookScreen.test.tsx`
- Lock the open-dictionary visual markers so the screen does not drift back to the previous dark desk book.

## Verification
- Focused notebook and hygiene tests.
- Full `npm run test:gate`.
- Production `npm run build`.
