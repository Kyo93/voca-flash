# Design System - Tactile Scholar Lexicon

Source: `C:\Users\Ocean\Downloads\stitch_l_t_m_anh_ng`

This design system replaces the previous generic Shadcn reference for the Mastery Notebook preview. The goal is a warm academic lexicon that feels like a physical dictionary opened on a study desk.

## Creative North Star

The visual direction is "The Tactile Scholar":

- Warm, high-end bookstore / academic journal feel.
- Editorial page layout rather than dashboard card layout.
- Terracotta for action and emphasis.
- Sage for focus, mastery, and calm progress.
- Soft cream paper surfaces with atmospheric depth.
- Moderate rounding, not pill-heavy except search inputs and compact chips.

## Extracted Layout Ratios

From `code.html`:

- Full screenshot: `1600 x 1280`, ratio `1.25:1`.
- Main dictionary spread: `aspect-[1.4/1]`, ratio `1.4:1`.
- Spread is two equal pages.
- Each page ratio is approximately `0.7:1`, taller than wide.
- Spread target width: `max-w-6xl` in the Stitch reference.
- Main book sits centered, with generous outer whitespace and a strong ambient shadow.

For VocaFlash implementation, the Mastery notebook overlay should keep the app controls but make the book itself follow `aspect-ratio: 1.4 / 1` on desktop.

## Color Tokens

| Token | Hex | Usage |
|---|---|---|
| background | #fff8f0 | Warm page background |
| surface | #fff8f0 | Base overlay canvas |
| surface-container-lowest | #ffffff | Clean paper page |
| surface-container-low | #f9f3ea | Study desk / low surface |
| surface-container | #f3ede4 | Subtle section surface |
| surface-container-high | #ede7df | Recessed controls |
| surface-container-highest | #e8e2d9 | Binding, skeletons, input surface |
| on-surface | #1d1b16 | Primary warm text |
| on-surface-variant | #564337 | Secondary warm text |
| outline | #897365 | Metadata text |
| outline-variant | #dcc1b1 | Ghost borders only |
| primary | #944a00 | Deep terracotta text/action |
| primary-container | #e67e22 | Terracotta emphasis |
| on-primary | #ffffff | Text on primary |
| on-primary-container | #502600 | Dark text on terracotta |
| secondary | #546435 | Deep sage |
| secondary-container | #d4e7ac | Sage container |
| on-secondary-container | #586839 | Text on sage container |

## Neutral Scale

| Step | Hex |
|---|---|
| 50 | #fffdf9 |
| 100 | #fff8f0 |
| 200 | #f9f3ea |
| 300 | #f3ede4 |
| 400 | #e8e2d9 |
| 500 | #dcc1b1 |
| 600 | #897365 |
| 700 | #564337 |
| 800 | #33302b |
| 900 | #1d1b16 |

## Typography

- UI font: Be Vietnam Pro.
- Editorial serif: Newsreader.
- Display word on right page: Newsreader, 64px equivalent, 700 weight.
- Left page title: Newsreader, 32-40px, terracotta.
- Body definition: Be Vietnam Pro, 24px on desktop for the leading definition.
- Examples: Be Vietnam Pro, 16px, relaxed leading.
- Metadata: Be Vietnam Pro, 12px, uppercase, letter spacing 0.12em.

In the VocaFlash app, use the existing project font stack where needed, but prefer `font-serif` for headwords and page titles.

## Shape And Depth

- Main book radius: 8px to 16px, not 32px.
- Spread shadow: `0 30px 90px rgba(40,30,20,0.15)`.
- Binding: vertical center gradient, width 24-32px.
- Page surfaces: white / paper, no heavy borders.
- Ghost borders only: `outline-variant` at 10-20% opacity.
- Paper texture should be simulated with subtle tonal overlays, not external image dependencies.

## Component Guidance

### Notebook Overlay
- Keep current Mastery notebook header/search/personalization controls.
- Make the book the visual center.
- Header should not compete with the book; keep it compact and glassy.

### Book Spread
- Desktop: central spread with exact `aspect-ratio: 1.4 / 1`.
- Width: `min(100%, 72rem)` or similar.
- Two equal pages with center binding.
- Strong ambient bottom shadow.
- Pages should be tall enough to feel dictionary-like.

### Left Page
- Role: recent saved vocabulary list.
- Title: "Recent Additions".
- Subtitle: "The Scholar's Log - Page 342" or localized equivalent.
- Entries are not cards; use editorial rows with selected left accent.
- Active entry uses terracotta accent and a small level/POS chip.

### Right Page
- Role: selected word detail.
- Large headword.
- POS/level chip near headword.
- Phonetic row.
- Definition as the dominant reading element.
- Vietnamese meaning or note section below.
- Examples as bullet rows.
- Related words / personal note box near bottom.

## Constraints

- Do not turn the screen into a full new app shell with sidebar/topbar; VocaFlash already has navigation.
- Do not use external texture URLs in production code.
- Do not use pure black text; use warm `on-surface`.
- Do not use dense nested cards; the book pages are the containers.
- Preserve all existing notebook functionality: search, style controls, density, image toggle, note editing, and selecting saved words.

<!-- STITCH_TOKENS_START -->
{
  "theme": "light",
  "colors": {
    "background": "#fff8f0",
    "foreground": "#1d1b16",
    "surface": "#fff8f0",
    "surfaceContainerLowest": "#ffffff",
    "surfaceContainerLow": "#f9f3ea",
    "surfaceContainer": "#f3ede4",
    "surfaceContainerHigh": "#ede7df",
    "surfaceContainerHighest": "#e8e2d9",
    "primary": "#944a00",
    "primaryContainer": "#e67e22",
    "primaryForeground": "#ffffff",
    "secondary": "#546435",
    "secondaryContainer": "#d4e7ac",
    "secondaryForeground": "#ffffff",
    "muted": "#f3ede4",
    "mutedForeground": "#564337",
    "border": "#dcc1b1",
    "outline": "#897365",
    "outlineVariant": "#dcc1b1",
    "destructive": "#ba1a1a",
    "destructiveForeground": "#ffffff"
  },
  "neutralScale": {
    "50": "#fffdf9",
    "100": "#fff8f0",
    "200": "#f9f3ea",
    "300": "#f3ede4",
    "400": "#e8e2d9",
    "500": "#dcc1b1",
    "600": "#897365",
    "700": "#564337",
    "800": "#33302b",
    "900": "#1d1b16"
  },
  "typography": {
    "fontFamily": "Be Vietnam Pro, system-ui, sans-serif",
    "serifFamily": "Newsreader, Georgia, serif",
    "scale": {
      "display": { "size": "64px", "weight": "700", "lineHeight": "0.95" },
      "h1": { "size": "40px", "weight": "700", "lineHeight": "1.05" },
      "h2": { "size": "32px", "weight": "700", "lineHeight": "1.15" },
      "h3": { "size": "24px", "weight": "700", "lineHeight": "1.25" },
      "body": { "size": "16px", "weight": "400", "lineHeight": "1.65" },
      "small": { "size": "14px", "weight": "500", "lineHeight": "1.5" },
      "caption": { "size": "12px", "weight": "700", "lineHeight": "1.4" }
    }
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px"
  },
  "radius": "0.5rem",
  "radiusScale": {
    "sm": "0.25rem",
    "default": "0.5rem",
    "lg": "1rem",
    "xl": "1.5rem",
    "full": "9999px"
  },
  "shadows": {
    "book": "0 30px 90px rgba(40,30,20,0.15)",
    "ambient": "0 32px 48px -4px rgba(29,27,22,0.12)",
    "soft": "0 10px 48px -4px rgba(29,27,22,0.08)"
  },
  "layout": {
    "bookAspectRatio": "1.4 / 1",
    "screenRatio": "1.25 / 1",
    "desktopBookMaxWidth": "72rem",
    "bindingWidth": "2rem"
  }
}
<!-- STITCH_TOKENS_END -->
