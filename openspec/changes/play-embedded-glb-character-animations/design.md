# Design: Play Embedded GLB Character Animations

## Context & Technical Approach
GLB files can carry authored animation clips. `rampaging_t_rex` contains `run`, `bite`, `roar`, `attack_tail`, and `idle`, but the current viewer only renders `gltf.scene` and applies procedural transforms. The fix is to create a `THREE.AnimationMixer` for GLB files with embedded clips and update it every frame.

## Proposed Changes
### `CharacterModelAvatar`
- Detect `gltf.animations`.
- Create an `AnimationMixer` after loading a GLB scene.
- Select a clip from the current character reaction state, preferring `idle` for display and themed action clips for non-idle states.
- Update the mixer in the render loop when `animated` is enabled.

## Verification
- Regression test checks for mixer creation, clip selection, action playback, and per-frame mixer updates.
- Run focused model/avatar tests.
- Run `npm run build`.
- Run `npm run test:gate`.
