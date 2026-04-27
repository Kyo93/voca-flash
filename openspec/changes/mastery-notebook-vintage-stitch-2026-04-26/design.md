# Design: Mastery Notebook Vintage Stitch Book

## Context & Technical Approach
The current Mastery Notebook already has saved-word data, search, personalization controls, and note editing. The new target is the downloaded Stitch reference at `C:\Users\Ocean\Downloads\stitch_l_t_m_anh_ng (2)`, especially `chi_ti_t_t_v_ng_t_p_trung_quy_n_s_ch_2\screen.png`: a dark wood desk with an open parchment dictionary, recent additions on the left page, and a selected vocabulary profile on the right page.

The implementation stays inside `NotebookScreen.tsx` and avoids external texture URLs. Wood, parchment, paper edges, dividers, polaroid, quote frame, and sticky note are simulated with CSS gradients, shadows, and existing Material Symbols.

## Proposed Changes

### `src/lib/storage/notebook.ts`
- Include `difficulty` in joined saved-word data so the UI can render CEFR-like badges from real vocabulary metadata.

### `src/components/mastery/NotebookScreen.tsx`
- Replace the ruled-note book body with a vintage desk/book frame.
- Use the downloaded screen ratio (`1.833333333 / 1`) and a `max-w-[88rem]` desktop book width.
- Render left page as editorial recent additions plus a tilted photo mnemonic.
- Render right page as a centered dictionary entry with phonetic, POS, level, definition, Vietnamese line, quote frame, word family, synonyms/antonyms, collocations, and sticky personal note.
- Preserve search, view style controls, density controls, image toggle, selected word behavior, and note editing.

## Verification
- Focused notebook UI/storage tests.
- Full `npm run test:gate`.
- Production build.
