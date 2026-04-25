# Design: Move Character Expanded View To Characters

## Context & Technical Approach
The Dashboard mascot should stay lightweight and not open the large PBR viewer. The large character viewer belongs on `/characters`, where users manage and inspect the collection.

## Proposed Changes
### DashboardMascotDock
- Remove expanded viewer state, portal rendering, Escape handling, and double-click/two-click open behavior.
- Keep single-click reaction cycling only.

### CharacterExpandedViewer
- Extract the full-screen PBR viewer into a reusable character component.
- Render as a body portal with Escape and backdrop close behavior.

### CharactersPage
- Add per-character avatar preview interaction.
- Open the extracted viewer with `materialQuality="pbr"` from the collection screen.

## Verification
- Dashboard tests assert double-click and quick two-click no longer open any dialog.
- Characters page tests assert the collection opens a full-screen PBR viewer and closes it with Escape.
- Run focused tests, build, and `npm run test:gate`.
