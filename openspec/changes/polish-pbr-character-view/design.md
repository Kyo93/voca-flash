# Design: Polish PBR Character View

## Context & Technical Approach
Sunlit Scholar has the full OBJ source and PBR texture set, but the current expanded viewer still uses a very neutral light setup. High ambient light flattens the model, and the transparent WebGL canvas has no grounding shadow or cinematic light direction, so the larger view does not feel meaningfully better.

Keep standard Dashboard avatar rendering unchanged. Improve only `materialQuality="pbr"` rendering with a stronger display preset.

## Proposed Changes
### `CharacterModelAvatar`
- Enable sRGB output and ACES tone mapping for PBR mode.
- Reduce flat ambient light in PBR mode.
- Add hemisphere, warmer key, softer fill, and rim/back light for shape separation.
- Add a CSS grounding shadow under PBR display models.
- Add normal-map scale and material tuning to make texture detail more visible.

## Verification
- Add unit/static tests that guard the PBR display preset.
- Run focused character model tests.
- Run `npm run build`.
- Run `npm run test:gate`.
