# Design System — Shadcn UI (Clean & Versatile)

**Aesthetic:** Clean, utilitarian, enterprise-grade, high legibility.
**Core values:** Slate neutrals, simple primary colors, 0.5rem standard radius.
**Use when:** Building SaaS apps, dashboards, marketing sites, or any project that needs a professional, minimal look without a specific style direction.

---

## Token Reference

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `background` | `#ffffff` | Page background |
| `foreground` | `#09090b` | Primary text |
| `card` | `#ffffff` | Card surfaces |
| `cardForeground` | `#09090b` | Card text |
| `popover` | `#ffffff` | Floating menus |
| `popoverForeground` | `#09090b` | Popover text |
| `primary` | `#09090b` | Primary actions (buttons) |
| `primaryForeground` | `#fafafa` | Text on primary |
| `secondary` | `#f4f4f5` | Secondary surfaces |
| `secondaryForeground` | `#09090b` | Secondary text |
| `muted` | `#f4f4f5` | Muted backgrounds |
| `mutedForeground` | `#71717a` | Muted text |
| `accent` | `#f4f4f5` | Accent backgrounds |
| `accentForeground` | `#09090b` | Accent text |
| `destructive` | `#ef4444` | Destructive / danger actions |
| `destructiveForeground` | `#fafafa` | Text on destructive |
| `border` | `#e4e4e7` | Borders |
| `input` | `#e4e4e7` | Input borders |
| `ring` | `#09090b` | Focus rings |

### Neutral Scale (Zinc)

| Step | Hex |
|---|---|
| 50 | `#fafafa` |
| 100 | `#f4f4f5` |
| 200 | `#e4e4e7` |
| 300 | `#d4d4d8` |
| 400 | `#a1a1aa` |
| 500 | `#71717a` |
| 600 | `#52525b` |
| 700 | `#3f3f46` |
| 800 | `#27272a` |
| 900 | `#09090b` |

### Typography

| Role | Font | Size | Weight | Line-height |
|---|---|---|---|---|
| Display | Inter | 48px | 700 | 1.1 |
| H1 | Inter | 36px | 700 | 1.2 |
| H2 | Inter | 30px | 600 | 1.25 |
| H3 | Inter | 24px | 600 | 1.3 |
| H4 | Inter | 20px | 600 | 1.4 |
| Body | Inter | 16px | 400 | 1.5 |
| Small | Inter | 14px | 400 | 1.5 |
| Caption | Inter | 12px | 400 | 1.4 |

**Font stack:** `Inter, system-ui, -apple-system, sans-serif`

### Spacing Scale

| Token | Value |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

### Border Radius

| Token | Value |
|---|---|
| `radius-sm` | 0.25rem (4px) |
| `radius` | 0.5rem (8px) — **standard** |
| `radius-md` | 0.625rem (10px) |
| `radius-lg` | 0.75rem (12px) |
| `radius-xl` | 1rem (16px) |

### Shadows

| Token | Value |
|---|---|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |

---

## Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.25rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      colors: {
        border: '#e4e4e7',
        input: '#e4e4e7',
        ring: '#09090b',
        background: '#ffffff',
        foreground: '#09090b',
        primary: { DEFAULT: '#09090b', foreground: '#fafafa' },
        secondary: { DEFAULT: '#f4f4f5', foreground: '#09090b' },
        destructive: { DEFAULT: '#ef4444', foreground: '#fafafa' },
        muted: { DEFAULT: '#f4f4f5', foreground: '#71717a' },
        accent: { DEFAULT: '#f4f4f5', foreground: '#09090b' },
        card: { DEFAULT: '#ffffff', foreground: '#09090b' },
        popover: { DEFAULT: '#ffffff', foreground: '#09090b' },
      },
    },
  },
}
```

---

## Design Principles

1. **Clarity over decoration** — Every visual element earns its place by serving function.
2. **Consistent radius** — `0.5rem` standard; `0.25rem` for small elements (badges, chips); `0.75rem+` for large cards only.
3. **Generous whitespace** — Minimum 16px between content sections.
4. **Accessible contrast** — All text meets WCAG AA (≥4.5:1 ratio for body text).
5. **Predictable motion** — Transitions max 200ms for micro-interactions; 300ms for layout changes.

---

<!-- STITCH_TOKENS_START -->
{
  "theme": "light",
  "colors": {
    "background": "#ffffff",
    "foreground": "#09090b",
    "card": "#ffffff",
    "cardForeground": "#09090b",
    "popover": "#ffffff",
    "popoverForeground": "#09090b",
    "primary": "#09090b",
    "primaryForeground": "#fafafa",
    "secondary": "#f4f4f5",
    "secondaryForeground": "#09090b",
    "muted": "#f4f4f5",
    "mutedForeground": "#71717a",
    "accent": "#f4f4f5",
    "accentForeground": "#09090b",
    "destructive": "#ef4444",
    "destructiveForeground": "#fafafa",
    "border": "#e4e4e7",
    "input": "#e4e4e7",
    "ring": "#09090b"
  },
  "neutralScale": {
    "50": "#fafafa", "100": "#f4f4f5", "200": "#e4e4e7",
    "300": "#d4d4d8", "400": "#a1a1aa", "500": "#71717a",
    "600": "#52525b", "700": "#3f3f46", "800": "#27272a", "900": "#09090b"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "scale": {
      "display": { "size": "48px", "weight": "700", "lineHeight": "1.1" },
      "h1": { "size": "36px", "weight": "700", "lineHeight": "1.2" },
      "h2": { "size": "30px", "weight": "600", "lineHeight": "1.25" },
      "h3": { "size": "24px", "weight": "600", "lineHeight": "1.3" },
      "h4": { "size": "20px", "weight": "600", "lineHeight": "1.4" },
      "body": { "size": "16px", "weight": "400", "lineHeight": "1.5" },
      "small": { "size": "14px", "weight": "400", "lineHeight": "1.5" },
      "caption": { "size": "12px", "weight": "400", "lineHeight": "1.4" }
    }
  },
  "spacing": {
    "1": "4px", "2": "8px", "3": "12px", "4": "16px",
    "5": "20px", "6": "24px", "8": "32px", "10": "40px",
    "12": "48px", "16": "64px"
  },
  "radius": "0.5rem",
  "radiusScale": {
    "sm": "0.25rem", "default": "0.5rem", "md": "0.625rem",
    "lg": "0.75rem", "xl": "1rem"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "default": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  }
}
<!-- STITCH_TOKENS_END -->