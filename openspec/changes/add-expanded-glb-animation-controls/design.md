# Design: Expanded GLB Animation Controls

## Context & Technical Approach
GLB-backed characters can contain embedded animation clips, but the expanded character viewer currently renders every character with `animationState="idle"`. The renderer already maps character reaction states to GLB clip names, so the missing piece is exposing available animation states in the expanded viewer and passing the selected state through.

The expanded PBR view also renders large canvases at up to device pixel ratio 2. On high-DPI displays this can create a much larger WebGL render target than needed for an inspection modal, causing visible lag. PBR mode should cap render resolution more conservatively while keeping normal small avatars sharp.

## Proposed Changes
### `src/lib/character-assets.ts`
- Add optional `embeddedAnimationStates` to GLB model availability and resolved model assets.
- Register animation-capable GLB characters with the states they can preview in the expanded viewer.

### `src/components/characters/CharacterExpandedViewer.tsx`
- Resolve the model asset once and read its animation states.
- Keep selected expanded-view animation state in local state.
- Show an animation segmented control only for model assets that declare embedded animations.
- Pass the selected animation state into `CharacterAvatar`.

### `src/components/characters/CharacterModelAvatar.tsx`
- Keep existing embedded GLB `AnimationMixer` playback.
- Reduce PBR render pixel ratio cap and request a high-performance WebGL context to make large view interaction smoother.

### i18n
- Add viewer animation labels in `vi.json` and `en.json`.

## Verification
- Unit tests cover animation metadata resolution, expanded viewer controls, and PBR render performance guardrails.
- Run focused Vitest tests, `npm run build`, then `npm run test:gate`.
