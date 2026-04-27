# UI Preview Blueprint - Mastery Notebook Image Blocks

Generated: 2026-04-26
Source: current `NotebookScreen.tsx`, `.stitch/DESIGN.md`, and the latest full-height notebook screenshot.
Stitch MCP status: unavailable in this Codex session. This is a prompt-only preview blueprint ready to paste into Google Stitch or use as the coding source after confirmation.

## Intent

Review the placement of image blocks in the Mastery Notebook after the book was stretched to fill the available viewport height. The goal is to keep the open-dictionary metaphor, but make the visual mnemonic/photo areas feel intentionally placed on the paper instead of floating as app cards.

## Current Layout Observations

- The desk photo is a full-screen background layer behind the book.
- The main book now fills the notebook main region from just under the header to near the bottom of the viewport.
- The left page has recent additions at the top and one full-width `notebook-visual-mnemonic` image block pinned to the bottom with `mt-auto`.
- The current mnemonic image is short (`h-28 md:h-32`) relative to the now-taller page, so it can feel detached from the saved-word list.
- The right page is text-first and has no primary image block; it uses a sticky note near the lower-right.
- The image toggle lives in the vertical control rail and should stay there.

## Design System

- Platform: Web desktop-first, responsive fallback.
- Visual language: Tactile Scholar, warm academic dictionary on a real study desk.
- Palette: warm paper background `#fff8f0`, white pages `#ffffff`, low surfaces `#f9f3ea` / `#f3ede4`, terracotta `#e67e22` / `#944a00`, sage `#546435` / `#d4e7ac`, warm text `#1d1b16`.
- Typography: Be Vietnam Pro for UI; Newsreader-style serif for book titles and headwords.
- Radius: page/book corners 8-16px; image blocks 8px; chips can remain compact pills.
- Shadows: warm ambient book shadow, subtle inset page shadows, image block should have paper/photo depth but not a heavy dashboard card shadow.
- No direct UI hex in implementation unless already allowed for the notebook special treatment; prefer existing Tailwind theme tokens.

## Recommended Preview Direction

### 1. Background Image Layer

Core function: set the study-desk atmosphere.

- Keep the desk image outside the book as a full-screen background.
- Book should remain the primary focal object; background objects should not compete with text.
- Use a light warm overlay on the desk photo so paper content stays readable.
- Keep the control rail over a quieter background zone; avoid making it sit on top of visually busy desk objects.

### 2. Left Page - Visual Mnemonic Photo Well

Core function: make the selected word memorable without breaking the dictionary page.

- Place the mnemonic as a deliberate lower-page photo well, not a small footer.
- Recommended size on desktop: `height: clamp(150px, 18vh, 220px)` or roughly 22-28% of the left page content height.
- Width: full available page width, but inset inside the page padding. Keep it aligned to the recent-additions text column.
- Position: below the visible saved-word list, with a controlled 20-28px ruled-paper gap. Do not leave a giant blank vertical gulf between list and photo.
- Shape: 8px radius, 1px warm paper border, subtle inner padding like a pasted photo or study clipping.
- Caption: move from a strong black overlay to a quieter warm translucent caption strip. Keep dark overlay only if image contrast requires it; cap caption height to one or two lines.
- Empty/no-image fallback must keep the exact same block dimensions to avoid layout shift. Use the selected word initial or a soft generated study-card placeholder.

### 3. Right Page - Optional Small Image Stamp

Core function: balance the spread without crowding the dictionary entry.

- Do not add a second large image on the right page; the right page should remain text-first.
- If the selected word has an image and images are enabled, optionally show a small "photo stamp" near the headword metadata area, about 96-128px wide, with paper-tape styling.
- The stamp should never reduce the headword, phonetic line, meaning, example, related words, or sticky note readability.
- If the page becomes crowded, omit the right-page stamp and keep only the left-page mnemonic photo well.

### 4. Sticky Note And Image Relationship

Core function: prevent visual blocks from fighting each other.

- The sticky note stays on the lower-right page as the personal-note affordance.
- It should not align exactly with the left-page photo height; offset it slightly so the spread feels natural, like objects placed by hand.
- Keep the sticky note smaller than the mnemonic photo well.

### 5. Responsive Behavior

- Desktop: preserve the full open-book layout; image block grows with viewport height but stays capped.
- Short desktop viewport: reduce photo height first before shrinking typography.
- Narrow screens: preserve the open-book illusion with horizontal scroll; keep image/fallback dimensions stable.
- Images off: preserve layout rhythm by showing the same-size fallback panel, not removing the area entirely.

## Implementation Notes For VocaFlash After Confirmation

- Primary file: `src/components/mastery/NotebookScreen.tsx`.
- Likely components to adjust:
  - `NotebookArchivePage`: replace `className="mt-auto"` with a more controlled image zone wrapper.
  - `NotebookMnemonicPhoto`: update height, caption treatment, border, and fallback state.
  - Optionally add a small right-page image stamp in `NotebookInvestigationPage` only if the preview confirms it improves balance.
- Tests to add/update in `tests/unit/NotebookScreen.test.tsx`:
  - `notebook-visual-mnemonic` keeps stable dimensions when images are hidden.
  - left-page image block is not only a tiny footer block.
  - optional right-page stamp does not render when images are disabled.

## Stitch Prompt Ready To Paste

Refine the VocaFlash Mastery Notebook overlay image-block layout. The screen is a warm Tactile Scholar vocabulary notebook: a real open English dictionary spread on a study desk, with two white ruled-paper pages, terracotta editorial accents, sage learning accents, and a compact glassy header.

Keep the central book full-height in the available viewport, directly under the notebook header and near the bottom of the screen. Preserve the two-page open-book illusion, subtle center binding, warm ambient shadow, white paper pages, and real desk-photo background.

Focus only on image block placement:

1. The desk photo stays as a full-screen atmospheric background behind the book. Add a soft warm overlay so it does not compete with the notebook content. Keep the right-side control rail on a visually quiet area of the background.

2. On the left page, create a deliberate lower-page visual mnemonic photo well for the selected word. It should feel like a pasted study clipping on paper, not a dashboard card. Make it larger than a tiny footer: about 22-28% of the left page content height, full column width inside the page padding, with 8px radius, subtle warm paper border, soft inner padding, and a quiet caption strip. Place it below the recent saved-word list with a controlled 20-28px ruled-paper gap, not a huge blank gulf.

3. Keep the recent-additions list above the image block as editorial rows, not cards. Show 3-4 rows depending on density. The selected row keeps a terracotta left accent.

4. On the right page, keep the dictionary entry text-first. Do not add a second large image. Optionally preview one small photo-stamp thumbnail near the headword metadata area, 96-128px wide, with paper-tape styling. If it makes the headword, phonetic line, definition, example, related words, or sticky note feel crowded, omit it.

5. Keep the sticky personal note on the lower-right page and make it smaller than the left-page photo well. Offset it naturally so the image block and sticky note do not align too mechanically.

6. Images-off state must preserve the same layout space using a monogram or soft placeholder panel. Do not remove the image area and cause the book layout to jump.

Use the warm academic palette from the project design system: page white, warm cream surfaces, terracotta emphasis, sage learning accents, and warm brown text. Use a serif face for page titles/headword and Be Vietnam Pro-style sans for UI. Avoid dense nested cards, heavy black overlays, and decorative clutter. Output a polished desktop preview that makes the image blocks feel intentionally composed on the physical notebook spread.
