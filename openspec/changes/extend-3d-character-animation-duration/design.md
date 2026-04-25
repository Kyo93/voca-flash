# Design: Extend 3D Character Animation Duration

## Context & Technical Approach
OBJ-backed characters use procedural Three.js reactions in `CharacterModelAvatar`. Their reaction timeouts are shorter than the visual feedback users expect in the large character viewer.

## Proposed Changes
### CharacterModelAvatar
- Increase the 3D reaction timeout values so `correct`, `wrong`, `celebrate`, and `evolve` stay visible longer before returning to `idle`.
- Keep the existing procedural motion and WebM media behavior unchanged.

## Verification
- Add source-level regression coverage for the longer 3D reaction durations.
- Run focused character model tests, build, and `npm run test:gate`.
