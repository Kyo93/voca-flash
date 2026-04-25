# Design: Dashboard Mascot Interactions

## Context & Technical Approach
The Dashboard mascot is currently rendered as a decorative, non-interactive avatar docked beside the centered content block. It uses `CharacterAvatar` with `size="lg"`, so the generated character reads too small compared with the adjacent Dashboard block.

## Proposed Changes
### DashboardMascotDock
- Make the dock a real button with accessible labeling.
- Increase the avatar size to a new `xl` size so the visual height better matches the adjacent Dashboard block.
- Cycle click reactions through `correct`, `celebrate`, `wrong`, and `evolve`; reset to `idle` when a non-idle video ends.

### CharacterAvatar / Fallback
- Add an `xl` avatar size used by Dashboard only.
- Keep existing `sm`, `md`, and `lg` behavior unchanged for grids and study flows.

### Character Assets
- Extend generated `seedling_scholar` reaction assets to stages 2 and 3 so click animation works after evolution.

## Verification
- Add behavior tests for Dashboard click reactions.
- Verify all manifest-registered assets exist.
- Run build and test gate.
