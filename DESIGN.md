# Design System Strategy: The Tactile Scholar

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Tactile Scholar."** 

In educational design, we often fall into the trap of sterile, "SaaS-blue" interfaces or overly childish primary colors. This system rejects that dichotomy. It aims to feel like a high-end, independent bookstore or a bespoke academic journal—warm, grounded, and deeply intentional. We achieve this by blending the earthy vigor of Terracotta (`#E67E22`) with the intellectual calm of Sage (`#829460`).

The experience moves beyond the "standard template" by embracing **Editorial Asymmetry**. Instead of rigid, centered grids, we use generous whitespace, overlapping imagery, and a hierarchy that treats the screen like a physical page. The `roundedness` level 2 (moderate rounding) is our signature: it provides a "cozy" friendliness while the refined typography maintains professional authority.

## 2. Colors & Atmospheric Depth
This system is built on a foundation of warmth. We are moving away from cold grays in favor of an organic palette that feels human.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined solely through:
- **Background Color Shifts:** Placing a `surface-container-low` component against a `surface` background.
- **Tonal Transitions:** Using subtle shifts between the cream-toned neutrals (derived from `#4A4741` for surfaces in light mode) and the Sage (`#829460`)/Terracotta (`#E67E22`) accents.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of fine, heavy-weight paper.
- **Base Layer:** `surface` (derived from our neutral intent, a light background that complements `#4A4741`) serves as our canvas.
- **Nesting:** To highlight a specific module (like a quiz or a reading list), use `surface-container`. For internal interactive elements within that module, use `surface-container-highest`. This creates "natural" depth without visual noise.

### The "Glass & Gradient" Rule
To elevate the "Modern" aspect of the brief, floating navigation or overlay modals should utilize **Glassmorphism**. Use semi-transparent versions of `surface` with a 20px-40px backdrop-blur. 
- **Signature Textures:** For primary CTAs and Hero sections, do not use flat hex codes. Use a subtle linear gradient (135°) transitioning from our `primary_color_hex` (`#E67E22`) to a slightly darker, complementary shade. This provides a "glow" that feels professional and soulful.

## 3. Typography: Be Vietnam Pro
We use **Be Vietnam Pro** for its clean, geometric foundations and its approachable, slightly wider apertures. It bridges the gap between technical precision and human warmth.

- **Display Scales:** `display-lg` (3.5rem) should be used for "heroic" educational moments. Use a tight letter-spacing (-0.02em) to give it an editorial, high-fashion look.
- **Headline Scales:** `headline-md` (1.75rem) serves as the primary entry point for content sections. It should always be paired with generous top-padding to let the "Scholar" persona breathe.
- **The Body/Label Relationship:** `body-lg` is for long-form reading. To maintain the "Professional" feel, ensure a line-height of at least 1.6. Use `label-md` in all-caps with +0.05em tracking for metadata or "category" tags over cards.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "software-like." This system uses light and color to create a sense of presence.

- **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card sitting on a `surface-container-low` section creates a soft, natural lift.
- **Ambient Shadows:** If a floating element (like a FAB or Popover) requires a shadow, use a "Sun-Drenched Shadow":
  - **Color:** A 10% opacity version of `on_surface` (a dark shade derived from our neutral intent, e.g., for text on surfaces).
  - **Blur:** 32px to 48px.
  - **Spread:** -4px.
  - This mimics natural, ambient light rather than a harsh digital shadow.
- **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast modes), use `outline_variant` (a soft complementary color) at 15% opacity. Never use 100% opaque borders.

## 5. Components

### Buttons
- **Primary:** Gradient fill (from `primary_color_hex` to a complementary dark orange), `roundedness` level 2. Text in `on_primary` (a color that contrasts well with `#E67E22`, typically white `FFFFFF`).
- **Secondary:** Background derived from `secondary_color_hex` (`#829460`) with text in a contrasting color for `on_secondary_container` (e.g., a dark desaturated green). This Sage-on-Sage look is our "Friendly" anchor.
- **Tertiary:** No background. Underlined with a 2px stroke of a color derived from `primary_color_hex` (`#E67E22`) to suggest a highlighter effect.

### Input Fields
- **Styling:** Use a `surface_container_highest` background. 
- **State:** On focus, do not use a border. Use a 2px "inner glow" of `secondary_color_hex` (`#829460`) and a subtle increase in the container’s brightness.

### Cards & Content Blocks
- **Constraint:** Forbid the use of divider lines. 
- **Separation:** Use the `spacing` scale (minimum 32px vertical gap, derived from `spacing` level 2 which implies normal spacing, allowing for custom multiples) or a subtle background shift to `surface_variant`.
- **Interactive States:** On hover, a card should not move "up" (Y-axis). Instead, it should transition its background color from `surface_container` to `surface_container_lowest` for a sophisticated "lighting up" effect.

### The "Curated" List
For educational lists (course modules, chapters), use an asymmetric layout. Place the `label-sm` (index number) far to the left, and the `title-lg` (chapter name) offset to the right, creating an intentional, non-linear visual flow.

## 6. Do’s and Don'ts

### Do
- **Do** lean into the Sage Green (`#829460`) for "Success" states and the Terracotta (`#E67E22`) for "Action" states.
- **Do** use `surface-dim` for empty states to create a "recessed" look.
- **Do** allow typography to overlap image containers by 16px–24px to reinforce the editorial, layered feel.

### Don’t
- **Don't** use pure black (#000000) for text. Always use `on_surface` (a dark shade derived from the neutral intent to maintain warmth) to maintain the "cozy" warmth.
- **Don't** use a mixed `roundedness`. Every container, button, and input must share `roundedness` level 2 (moderate roundedness) to maintain the "approachable" brand identity.
- **Don't** use standard "system" icons. Choose organic, rounded icon sets that match the `outline` token weight (approx 1.5pt to 2pt).

---
**Director's Final Note:**
This design system is about the *feeling* of a physical environment. When a user interacts with it, they shouldn't feel like they are using a tool; they should feel like they are sitting in a well-lit, warm study hall. Use the colors to guide their emotions—Terracotta for the excitement of learning, and Sage for the focus required to master it.