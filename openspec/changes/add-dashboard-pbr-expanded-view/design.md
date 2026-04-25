# Design: Dashboard PBR Expanded Character View

## Context & Technical Approach
Dashboard currently renders the selected character through `DashboardMascotDock` and `CharacterAvatar`. OBJ-backed characters are rendered by `CharacterModelAvatar`, which currently loads `base.obj` plus the diffuse texture only. `sunlit_scholar` already has normal, roughness, metallic, and PBR texture files registered in the model manifest.

Keep normal Dashboard rendering lightweight by default. Add an explicit high-quality material mode that loads PBR texture maps only when the selected Dashboard mascot is opened in an expanded view.

## Proposed Changes
### `CharacterModelAvatar`
- Add a material quality prop with a default lightweight mode.
- In default mode, load only diffuse texture.
- In PBR mode, additionally load normal, roughness, and metallic maps when registered.
- Dispose loaded texture resources on unmount.

### `CharacterAvatar`
- Pass the material quality prop through only for model-backed characters.
- Existing media and fallback characters keep current behavior.

### `DashboardMascotDock`
- Keep single-click reaction cycling.
- Add double-click support on the Dashboard mascot to open a large modal-style viewer.
- Render the expanded avatar with PBR material quality.
- Provide close behavior through an icon button and Escape key.

### i18n
- Add accessible labels for expanded character view and close action under `characters.actions`.

## Verification
- Add unit tests for PBR being opt-in in `CharacterModelAvatar`.
- Add component tests for double-click opening the expanded Dashboard view and passing PBR quality there.
- Run focused tests, `npm run build`, and `npm run test:gate`.
