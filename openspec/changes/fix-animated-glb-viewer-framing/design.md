# Design: Fix Animated GLB Viewer Framing

## Context & Technical Approach
`rampaging_t_rex` is a long skinned GLB with embedded animation. The current viewer fits the camera with the same padding used for compact OBJ characters, and the expanded display canvas is capped at `64rem`, leaving parts of the full-screen overlay outside the draggable OrbitControls surface.

## Proposed Changes
### `CharacterAvatar`
- Make `display` avatars fill the expanded stage (`h-full w-full`) so the WebGL canvas receives pointer input across the large viewer.

### `CharacterModelAvatar`
- Detect animated/skinned GLB models and use a larger camera-fit padding.
- Keep OrbitControls rotation explicitly enabled.
- Preserve existing OBJ fitting behavior.

## Verification
- Source-level regression tests cover display canvas sizing and animated GLB fit padding.
- Run focused character viewer tests.
- Run `npm run build`.
- Run `npm run test:gate`.
