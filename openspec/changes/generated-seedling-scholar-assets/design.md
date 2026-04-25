# Design: Generated Seedling Scholar Assets

## Context & Technical Approach
The character system already resolves media from `public/character-assets/<character-id>/stage-<n>/<state>`.
This change replaces the starter placeholder media for `seedling_scholar` with an original OC mascot while keeping the current catalog, unlock logic, and manifest unchanged.

## Proposed Changes
### Character Asset Files
- Generate stage 1 states: `idle`, `correct`, `wrong`, `celebrate`, `evolve`.
- Generate stage 2 and stage 3 `idle`.
- Keep both `.webp` posters and `.webm` videos because the current manifest and tests expect both.

### Asset Generation Script
- Add a reproducible local script that renders the cutout source through Chromium canvas.
- Use WebP for still posters and MediaRecorder WebM for animated states.

## Verification
- Confirm all manifest-registered asset files exist.
- Run `npm run build`.
- Run `npm run test:gate`.
