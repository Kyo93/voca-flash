# Design: Add Quiz Alchemist Character

## Context & Technical Approach
VocaFlash already renders collectible characters from a typed catalog, i18n copy, and a public WebP/WebM asset manifest. The new character should follow that same contract so unlock, select, evolution, Dashboard mascot, Study, and Review reactions continue to work without new runtime logic.

## Proposed Changes
### Character Catalog
- Add `quiz_alchemist` as a rare character with four stages.
- Use existing Material Symbols names and Tailwind theme gradient classes.
- Keep EXP logic unchanged; unlock/evolution costs are data-only.

### Character Copy
- Add Vietnamese source copy in `src/i18n/vi.json`.
- Add matching English copy in `src/i18n/en.json`.

### Character Media
- Add a deterministic asset generator at `scripts/generate-quiz-alchemist-assets.mjs`.
- Save reusable source cutout to `scripts/assets/quiz_alchemist_cutout.png`.
- Export all public media under `public/character-assets/quiz_alchemist/stage-{1..4}/`.

### Asset Manifest And Tests
- Register all five animation states for each stage in `CHARACTER_ASSET_MANIFEST`.
- Add focused tests for catalog definition and asset registration.

## Verification
- Run the generator once to create the source cutout and all WebP/WebM files.
- Run focused unit tests for characters and character assets.
- Run `npm run build` after refactoring data/code.
