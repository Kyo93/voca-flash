# Design: Mobile Codex Minimal Redesign

## Context & Technical Approach

VocaFlash already has mobile-specific components behind the `max-width: 767px` shell. Preserve desktop and data behavior. Redesign mobile by adding scoped design primitives and applying them to the mobile shell and views.

The target aesthetic is Codex-like minimalism:

- Flat off-white/white surfaces
- Hairline borders instead of rings and heavy shadows
- No glassmorphism, no backdrop blur, no decorative blobs
- Moderate radius, generally 12-16px
- Desktop palette is reused for maintainability: terracotta primary, sage secondary, and existing container tokens remain the source of truth
- Primary action clear but quiet
- Lists and forms feel like app workspace rows, not marketing cards
- S25 Ultra target: 390x850, no horizontal overflow

## Proposed Changes

### `src/index.css`

Add mobile-only primitives under `@media (max-width: 767px)`:

- `--mobile-*` tokens mapped to existing desktop theme variables for background, surface, border, muted text, and action color
- `.mobile-shell-minimal`
- `.mobile-topbar-minimal`
- `.mobile-bottom-nav-minimal`
- `.mobile-page`
- `.mobile-section`
- `.mobile-panel`
- `.mobile-row`
- `.mobile-primary-action`
- `.mobile-secondary-action`
- `.mobile-chip`
- `.mobile-sheet`
- `.mobile-input`

Also neutralize `backdrop-filter` in the mobile shell and reduce decorative shadow/radius only in mobile-scoped surfaces. Do not override `text-primary`, `text-secondary`, `bg-primary`, or `bg-secondary` to monochrome; those must keep desktop color semantics.

### `src/components/mobile/MobileAppLayout.tsx`

Replace translucent/blurred header and bottom nav with flat Codex-like bars:

- Header: white/off-white, bottom border, no blur, compact title
- Bottom nav: floating but flat, 5 tabs, active state as subtle filled pill
- Keep search route support for Library and Roadmap detail
- Keep focus routes full-screen

### Mobile Feed Screens

Update the existing mobile views without changing data contracts:

- Dashboard: one quiet “next action” panel, compact stats, row-like forecast/quote
- Library: filters as segmented chips, roadmaps as flat rows/cards
- Roadmap detail: compact progress panel and topic rows; remove dark gradient hero
- Mastery: reduce stat grid noise, convert word cards to rows, keep detail bottom sheet
- Progress/Achievements/Characters/Settings: use common panel/row/action patterns

### Focus Screens

Update Study and Review mobile visual language while preserving learning behavior:

- Study Prep: flat panel, no blobs, no hardcoded green/stone styling in mobile UI
- Flashcards: calmer border/radius, no decorative offset shadow
- Review Arena mobile: dark mode can remain for focus, but reduce animated blobs and glass controls on mobile
- Note drawer: flat bottom sheet, no blur overlay

## Assumptions

- Primary UI language remains Vietnamese; English remains academic/content language.
- Desktop visual identity is preserved.
- Admin desktop is not part of this mobile redesign unless exposed through the mobile app shell later.
- Current route/data behavior remains unchanged.

## Verification

- `npm run build`
- `npm run test:gate` if runtime/UI changes are broad enough
- Focused unit tests for mobile shell classes and no `backdrop-blur` in mobile shell
- Playwright smoke at 390x850 for:
  - `/dashboard`
  - `/library`
  - `/library/:roadmapSlug`
  - `/study`
  - `/review`
  - `/mastery`
  - `/progress`
  - `/achievements`
  - `/characters`
  - `/settings`
  - `/login`
  - `/`

Pass criteria:

- No horizontal overflow at 390x850
- Bottom nav does not obscure primary content
- Touch targets are at least 44px
- No mobile shell blur/glass treatment
- Primary action is visually obvious on each screen
