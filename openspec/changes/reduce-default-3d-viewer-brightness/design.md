# Design: Reduce Default 3D Viewer Brightness

## Context & Technical Approach
The large OBJ/PBR viewer still opens too bright even after adding controls. The default should be comfortable without requiring users to adjust the exposure slider on every open.

## Proposed Changes
### Character Model Viewer Defaults
- Lower default exposure for expanded 3D viewer.
- Lower the `soft` preset light and environment reflection intensities.
- Leave Studio/Vivid available for users who want brighter lighting.

## Verification
- Update regression expectations for the lower default exposure.
- Run focused viewer tests, build, and `npm run test:gate`.
