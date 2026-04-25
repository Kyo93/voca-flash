# Design: Static Character Thumbnails

## Context & Technical Approach
Character cards and dashboard avatars were loading model-backed characters through the WebGL renderer even at small sizes. That forced Three.js and large OBJ/GLB assets to load in list views, making `/characters` feel slow.

Small and dashboard avatars should use pre-rendered static thumbnails. The full `display` viewer remains the only place that loads the interactive 3D model.

## Proposed Changes
### Model Asset Manifest
- Add optional `thumbnail` availability to model-backed assets.
- Resolve `thumbnailSrc` as `/character-assets/{id}/source/thumbnail.png`.

### CharacterAvatar
- If `modelAsset.thumbnailSrc` exists and `size !== 'display'`, render a static `<img>`.
- Keep the existing WebGL renderer for expanded `display` views.
- Fall back gracefully if a thumbnail image fails.

### Thumbnail Generation
- Add `scripts/thumbnail-renderer.html` as a local Three.js renderer for deterministic 512px transparent thumbnails.
- Generate `thumbnail.png` files for current OBJ/GLB model characters.

## Verification
- Unit tests cover thumbnail resolving, thumbnail render branch, and on-disk thumbnail files.
- Run focused character/avatar tests, `npm run build`, and `npm run test:gate`.
