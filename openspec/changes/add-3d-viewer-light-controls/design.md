# Design: Add 3D Viewer Light Controls

## Context & Technical Approach
The large 3D character viewer can overexpose glossy OBJ/PBR models. Users need lightweight controls inside the expanded viewer to reduce brightness or switch lighting presets without affecting normal Dashboard/card previews.

## Proposed Changes
### Character Model Rendering
- Add model viewer settings for exposure and light preset.
- Use a lower default PBR exposure and softer light preset in expanded view.
- Apply settings only to OBJ-backed Three.js characters.

### Expanded Viewer UI
- Show a compact control panel only when the selected character has a registered model source.
- Add segmented light preset buttons and an exposure slider.
- Keep controls accessible with i18n labels.

## Verification
- Add tests for 3D-only controls in `/characters`.
- Add source-level coverage that the Three.js viewer accepts exposure/light settings.
- Run focused tests, build, and `npm run test:gate`.
