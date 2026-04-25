# Design: Add Playful Dog GLB Character

## Context & Technical Approach
The project already supports copy-only GLB characters via `glbModel`, `GLTFLoader`, legacy specular-glossiness texture restoration, and embedded animation playback. `Playful dog.glb` is a Microsoft-exported GLB with embedded animation clips (`standing`, `sitting`, `shake`, `rollover`, `play_dead`), so it should use the existing GLB path convention and add a few common clip aliases to the animation selector.

## Proposed Changes
### Character Catalog
- Add `playful_dog` as a rare four-stage character.

### Model Assets
- Register `playful_dog` with `glbModel: true` for stages 1-4.
- Copy source to `public/character-assets/playful_dog/source/base.glb`.

### i18n
- Add Vietnamese and English character/stage copy.

### GLB Animation Selection
- Add common dog clip aliases such as `standing`, `shake`, `rollover`, `play_dead`, and `sitting` to the existing clip preference lists.

## Verification
- Focused catalog/asset/model tests.
- `npm run build`.
- `npm run test:gate`.
