# Design: Add Falling Leaf Tree GLB Character

## Context & Technical Approach
The current character system can render copy-only OBJ sources through `CharacterModelAvatar`. The new asset is a single `.glb` file, so the model resolver needs to support a `base.glb` source and the Three.js viewer needs to select `GLTFLoader` when the source path ends in `.glb`.

## Proposed Changes
### `src/lib/character-assets.ts`
- Add a `glbModel` manifest flag and model format metadata.
- Resolve `.glb` sources to `/character-assets/<id>/source/base.glb`.

### `src/components/characters/CharacterModelAvatar.tsx`
- Add `GLTFLoader` support.
- Keep current OBJ material behavior unchanged.
- Use GLB scene/materials as authored, while still allowing runtime PBR environment intensity controls.

### Character Catalog And i18n
- Register `falling_leaf_tree` as a rare four-stage 3D character.
- Add Vietnamese and English copy through existing i18n keys.
- Copy the source asset to `public/character-assets/falling_leaf_tree/source/base.glb`.

## Verification
- Focused unit tests cover catalog registration, resolver paths, loader selection, and source file presence.
- Run `npm run build`.
- Run `npm run test:gate`.
