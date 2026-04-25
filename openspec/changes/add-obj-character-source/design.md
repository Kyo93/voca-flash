# Design: Add OBJ Character Source

## Context & Technical Approach
The character system currently prefers static public media through `CHARACTER_ASSET_MANIFEST`.
The new requirement is copy-only OBJ support, so model-backed characters use a second manifest:
`CHARACTER_MODEL_ASSET_MANIFEST`. `CharacterAvatar` still renders WebP/WebM first when available,
then falls back to a Three.js OBJ canvas when a model source is registered.

## Proposed Changes
### `public/character-assets/arcane_brawler/source/`
- Store `base.obj` as the required copy-only source.
- Optional texture maps can sit next to it; `texture_diffuse.png` is used when registered.

### `src/lib/characters.ts`
- Register `arcane_brawler` as a rare four-stage character.
- Reuse existing EXP, unlock, select, and evolution behavior unchanged.

### `src/lib/character-assets.ts`
- Register OBJ model stages and resolve `/character-assets/{id}/source/base.obj`.

### `src/components/characters/CharacterModelAvatar.tsx`
- Load OBJ models with Three.js and `OBJLoader`.
- Normalize scale/center, add simple lights, and animate reaction states in canvas.
- Lazy-load this component from `CharacterAvatar` so Three.js is only downloaded when a model-backed character is rendered.
- Use `OrbitControls` for true 3D inspection: drag/touch rotates the model, scroll/pinch zooms within limits, and idle auto-rotation pauses while the user is interacting.
- Fit the camera from the loaded model bounds and current canvas aspect ratio so wide/tall OBJ characters stay inside the frame on Dashboard, collection grids, and mobile.

### `src/lib/character-model-viewer.ts`
- Provide a testable `calculateCameraFitDistance` helper shared by the viewer.

### `src/i18n/{vi,en}.json`
- Add localized name, description, pose, and stage copy.

## Verification
- Focused character domain and asset tests.
- Model interaction contract test.
- Camera fit distance tests.
- `npm run build`.
- `npm run test:gate`.
