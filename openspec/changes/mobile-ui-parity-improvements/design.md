# Design: Mobile UI Parity Improvements

## Context & Technical Approach
The Android/mobile shell added dedicated mobile surfaces for core routes, but several workflows still lose desktop capabilities or carry desktop-heavy review layouts. Keep the existing React/Tailwind architecture, add focused props only where required, and preserve i18n through existing translation keys plus small mobile-specific additions.

## Proposed Changes

### MobileAppLayout and Roadmap Topics
- Add a compact search affordance to the mobile app header for learn/notebook contexts that already consume Outlet search state.
- Let roadmap topic search remain directly available on mobile without introducing a separate search route.

### MobileMasteryView
- Add mobile access to advanced filters: roadmap, stability, A-Z jump, and sort.
- Add a note editing flow inside the mobile word detail sheet using the existing `onSaveNote` contract.
- Increase small interactive controls to 44px or larger tap targets.

### MobileCharactersView
- Preserve both character actions when unlocked characters can evolve: evolution remains primary, select/display remains available as a secondary action.

### Review Focus Route
- Add mobile-responsive classes to the arena shell and challenge layouts so review sessions fit 375px devices and remove desktop hotkey clutter on small screens.

### MobileProgressView
- Fix the unlocked/total badge summary so it reflects all badges, not only unlocked badges.

## Verification
- Add focused unit tests for each missing behavior before implementation.
- Run focused mobile tests.
- Run `npm run build`.
- Run `npm run test:gate` before completion.
