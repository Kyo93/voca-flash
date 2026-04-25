# Design: Add Sunlit Scholar OBJ Character

## Context & Technical Approach
The app already supports copy-only 3D characters through `CharacterModelAvatar`, `CHARACTER_MODEL_ASSET_MANIFEST`, and source files under `public/character-assets/<id>/source`. The new exported folder contains `base.obj` plus diffuse, normal, roughness, metallic, PBR, and shaded texture files.

Use the existing OBJ-backed character path rather than adding a generator. The renderer currently applies the diffuse texture; the extra texture files are copied into the public source folder so the asset contract stays forward-compatible with PBR improvements.

## Proposed Changes
### `src/lib/characters.ts`
- Add `sunlit_scholar` as a rare 4-stage character.
- Keep `costXp: 0` to match current unlocked-by-default character additions.

### `src/lib/character-assets.ts`
- Register all four stages in `CHARACTER_MODEL_ASSET_MANIFEST`.
- Mark `model`, `diffuseTexture`, `normalTexture`, `roughnessTexture`, `metallicTexture`, and `pbrTexture` as available.

### `src/i18n/vi.json` and `src/i18n/en.json`
- Add localized character and stage copy.

### `public/character-assets/sunlit_scholar/source/`
- Copy the exported OBJ and texture source files from the user-provided Downloads folder.

## Verification
- Add focused unit tests for catalog registration, model manifest registration, resolver paths, and copied source files.
- Run focused character tests.
- Run `npm run build`.
- Run `npm run test:gate`.
