# Design: Add Rampaging T-Rex GLB Character

## Context & Technical Approach
The character system already supports copy-only GLB sources through `glbModel` manifest entries and `GLTFLoader`. The new T-Rex asset should follow the same convention as `falling_leaf_tree`: copy the source file into `public/character-assets/<id>/source/base.glb`, register all evolution stages, and expose localized character copy.

## Proposed Changes
### `src/lib/characters.ts`
- Add `rampaging_t_rex` as a four-stage epic character.

### `src/lib/character-assets.ts`
- Register `rampaging_t_rex` with `glbModel: true` for stages 1-4.

### `src/i18n/*.json`
- Add Vietnamese and English copy for character and stage labels.

### Public Assets
- Copy `C:\Users\Ocean\Desktop\3D\Rampaging T-Rex.glb` to `public/character-assets/rampaging_t_rex/source/base.glb`.

## Verification
- Focused character and asset tests cover the new catalog item, resolver path, and source file.
- Run `npm run build`.
- Run `npm run test:gate`.
