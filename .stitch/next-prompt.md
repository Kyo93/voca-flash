# UI Preview Blueprint — Review Arena

**Generated:** 2026-04-20
**Stitch MCP Status:** Not connected — saved as Prompt Blueprint for manual execution.
**Source:** `.stitch/DESIGN.md` (Shadcn) + existing Review Arena code review

---

## Screen Overview

**Page:** Review Arena (`/review`)
**Type:** Interactive study screen — full-screen overlay with glassmorphic challenge cards
**Platform:** Web (Desktop-first, responsive to mobile)
**Purpose:** Users complete 5 challenge types in a gamified review session: Recognition, Construction, Context Gap, Ghost Recall, and Demo Mode.

---

## Existing Design (Source of Truth)

The arena already has a strong **dark gaming aesthetic** — do NOT override with a light Shadcn theme. Keep the dark base.

| Element | Current Value |
|---|---|
| Background | `#060608` (near-black) |
| Glassmorphic cards | `bg-white/5`, `border-white/10`, `backdrop-blur` |
| Accent blobs | Orange `#D35400/20`, Cyan `#0891B2/20`, Slate `#1E293B/40` |
| Progress bar | `#primary` (from CSS var), `primary-glow` animation |
| Primary color | CSS var `--primary` with `--primary-rgb` for glow |
| Font (UI text) | System font via `.font-body` |
| Font (word display) | `.font-headline` — bold display |
| Border radius | `rounded-2xl` / `rounded-[2rem]` for cards |
| Motion | Framer Motion — `animate-blob`, `primary-glow` keyframes |

---

## Design System Tokens (Shadcn — reference for new components)

> Applied only to components that need them, NOT overriding the dark arena base.

```json
{
  "theme": "dark",
  "colors": {
    "background": "#060608",
    "foreground": "#fafafa",
    "primary": "#09090b",
    "primaryForeground": "#fafafa",
    "card": "rgba(255,255,255,0.05)",
    "cardForeground": "#fafafa",
    "border": "rgba(255,255,255,0.1)",
    "muted": "rgba(255,255,255,0.05)",
    "mutedForeground": "#71717a",
    "destructive": "#ef4444"
  },
  "radius": "0.5rem",
  "typography": { "fontFamily": "Inter, sans-serif" }
}
```

---

## Page Structure & Function

### Layout: Fixed Full-Screen Overlay
- `z-index: 9999` — overlays everything
- 3 zones: **Header** (exit + stats), **Main Stage** (challenge), **Footer** (hotkeys)

---

### Zone 1: Header Bar
**Core function:** Show session progress + exit control

- **Left:** Exit button — `arrow_back` icon + "Thoát" label, hover: white/5 bg + border
- **Center:** Counter pill — `{currentIndex + 1} / {total}` in a `glass-arena-item` rounded-full chip
- **Right:** Points badge — `stars` icon + `{points}` value, `bg-primary/10 border-primary/20` rounded-full
- **Error alert:** Top-center toast with `cloud_off` icon when `syncError` is set

---

### Zone 2: Progress Bar
**Core function:** Visual session progress

- Full-width `h-1` bar at very top, `bg-white/5` track
- `motion.div` animate width from 0% → `progress%`, `duration: 0.8`, `ease: easeOut`
- Uses `primary-glow` CSS animation for shimmer effect

---

### Zone 3: Main Stage (Glass Stage)
**Core function:** Display current challenge card

- Max-width: `max-w-4xl`, centered, `overflow-y-auto custom-scrollbar`
- Contains `ChallengeManager` → renders one of 5 challenge types:
  - **RecognitionChallenge:** 4-choice card with letter labels (A/B/C/D), keyboard shortcuts
  - **ConstructionChallenge:** Text input for typing the word
  - **ContextGapChallenge:** Cloze-style sentence with word to fill
  - **GhostRecallChallenge:** Audio cue (TTS) then reveal
  - **SessionSummary:** End-of-session stats with XP counter animation

---

### Zone 4: Footer — Hotkey Reference
**Core function:** Keyboard shortcut hints

- `{ key: 'SPACE', label: 'Hiện gợi ý' }`
- `{ key: '1-4', label: 'Chọn đáp án' }`
- `{ key: 'ENTER', label: 'Tiếp tục' }`
- Styled as: `kbd` pills + label, `text-white/20`, hover → `opacity-100`
- `tracking-[0.2em] uppercase font-black text-[9px]`

---

## Component Details

### ArenaShell (wrapper)
- **Background blobs:** 4 absolute-positioned blurred divs — orange top-left, cyan top-right, slate bottom-left, primary bottom-right. All animate with `animate-blob` keyframe + staggered `animation-delay`
- **ConfirmExitModal:** Shared modal for exit confirmation — "Bạn có chắc muốn thoát?"
- **SyncError:** Top-center alert when Supabase sync fails

### RecognitionChallenge (default view)
- **Header card:** word display (large `text-4xl font-black`), phonetic below, "Chọn nghĩa" pill label
- **4 choice buttons:** Letter badge (A/B/C/D) + definition text, state-based styling:
  - `idle`: `bg-white/5 border-white/10`, hover → `border-primary/30`
  - `correct`: `bg-primary/10 border-primary`, green check icon
  - `wrong`: `bg-red/8 border-error`, red X icon, correct answer still highlighted
  - `dimmed`: `opacity-40 border-white/5`
- **Keyboard:** A/B/C/D map to choices 0-3

### SessionSummary (end screen)
- **Stats grid:** 2-column — XP (animated counter) + Accuracy %
- **Mistakes audit:** Scrollable list of words got wrong, "Cần lưu ý lại" section
- **Actions:** "Bắt đầu đợt mới" (primary fill) + "Quay lại Dashboard" (ghost)
- **XP counter:** `useEffect` animation counting from 0 → `stats.points` over 1500ms

---

## Visual Details to Preserve

| Detail | Value |
|---|---|
| Card border-radius | `rounded-[2rem]` for large cards, `rounded-2xl` for buttons |
| Letter badge size | `w-9 h-9 rounded-xl` |
| Font sizes | Word display `text-4xl`, choices `font-bold` |
| Motion | `animate-blob` (CSS), Framer Motion `motion.div` for progress bar |
| Glow effect | `primary-glow` CSS keyframe on progress bar |
| Modal | `ConfirmExitModal` — confirm → navigate('/dashboard') |

---

## Stitch Prompt (Ready to Paste)

```
Build a full-screen Review Arena page for a vocabulary flashcard app called "voca-flash". The screen overlays the entire app (z-index: 9999) with a dark gaming aesthetic.

**DESIGN TOKENS:**
- Background: #060608 (near-black)
- Glass cards: rgba(255,255,255,0.05) with border rgba(255,255,255,0.1), backdrop-blur
- Accent blobs: Orange #D35400/20 (top-left), Cyan #0891B2/20 (top-right), Slate #1E293B/40 (bottom-left)
- Primary glow: CSS keyframe animation on the progress bar
- Border radius: 2rem for large cards, xl for buttons
- Font: Inter for UI, system font for headlines

**PAGE STRUCTURE:**

1. TOP: Full-width progress bar (h-1, bg-white/5, animated width using --progress%)
   → Animated progress bar at very top with glow shimmer

2. HEADER ROW: Exit button (left) | Counter pill (center) | Points badge (right)
   → Exit: arrow_back icon + "Thoát" | Counter: "3 / 20" glass chip | Points: star icon + "150"

3. BACKGROUND: 4 animated blurred color blobs (orange, cyan, slate, primary) absolutely positioned

4. MAIN STAGE: Centered challenge card (max-w-4xl) — example RecognitionChallenge shown:
   - Word display: "ubiquitous" large font
   - Phonetic: /juːˈbɪkwɪtəs/
   - Label pill: "Chọn nghĩa"
   - 4 choice buttons in 2-column grid: A) "Widespread" B) "Rare" C) "Fast" D) "Quiet"
   - Each with letter badge + definition, hover glow effect

5. FOOTER: Hotkey reference strip
   - SPACE: Hiện gợi ý | 1-4: Chọn đáp án | ENTER: Tiếp tục
   - Styled as kbd pills with tracking-[0.2em] uppercase text

**VARIANT:** SessionSummary (end screen):
- Trophy icon + "Hoàn thành buổi học!" heading
- 2 stat cards: XP (animated counter 0→150) + Accuracy (82%)
- "Cần lưu ý lại" mistake audit list (2-3 example words with definitions)
- CTA buttons: "Bắt đầu đợt mới" (solid primary) + "Quay lại Dashboard" (ghost)

**PLATFORM:** Web (Desktop-first, mobile responsive)
**AESTHETIC:** Dark gaming arena — professional yet gamified, glassmorphic, vibrant accent blobs
```

---

## Notes

- The arena uses CSS custom properties (`--primary`, `--primary-rgb`) — ensure replacements don't break glow/ambient animations
- `animate-blob` and `primary-glow` are CSS keyframe animations defined in the global CSS — preserve these
- Framer Motion is used throughout — ensure any replacement uses equivalent animation library or CSS
- Vietnamese text is used throughout UI labels — preserve all Vietnamese strings
- `syncError` overlay and `ConfirmExitModal` must be preserved in any redesign

---

*This blueprint is ready to be pasted into Google Stitch or handed off to cm-execution.*