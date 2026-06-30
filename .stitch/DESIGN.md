# VocaFlash Mobile Mastery Archive Design System

Use these tokens to generate a mobile app screen for VocaFlash. The visual direction is **Tactile Scholar**: calm, warm, minimal, tactile, study-focused, not decorative.

<!-- STITCH_TOKENS_START -->
{
  "name": "VocaFlash Tactile Scholar Mobile",
  "platform": "mobile",
  "viewport": {
    "width": 390,
    "height": 850,
    "device": "Samsung S25 Ultra CSS viewport target"
  },
  "colors": {
    "primary": "#E8791A",
    "primaryContainer": "#FFD7BD",
    "secondary": "#536B32",
    "secondaryContainer": "#D7ED9F",
    "background": "#FBF4EF",
    "surface": "#FFFDFB",
    "surfaceContainerLow": "#FFF0E8",
    "surfaceContainerLowest": "#FFFFFF",
    "outline": "#EAD8CE",
    "text": "#2B211D",
    "textMuted": "#75645C",
    "success": "#536B32",
    "warning": "#E8791A",
    "danger": "#B44732"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "title": { "size": 24, "weight": 650, "lineHeight": 30 },
    "body": { "size": 15, "weight": 550, "lineHeight": 22 },
    "caption": { "size": 12, "weight": 650, "lineHeight": 16 },
    "label": { "size": 10, "weight": 800, "lineHeight": 14, "case": "uppercase" }
  },
  "radii": {
    "sm": 10,
    "md": 14,
    "lg": 18,
    "xl": 24,
    "sheet": 28
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 12,
    "lg": 16,
    "xl": 24
  },
  "components": {
    "tapTargetMin": 44,
    "bottomNavHeight": 70,
    "cardBorder": "1px solid outline",
    "cardShadow": "none or very subtle",
    "avoid": [
      "large dashboard cards",
      "decorative eyebrow labels",
      "large empty cards",
      "purple gradients",
      "glass blur",
      "nested cards"
    ]
  }
}
<!-- STITCH_TOKENS_END -->

## Screen Requirements

Generate two mobile screens side by side:

1. **Mobile Mastery Archive List**
2. **Mobile Word Detail Bottom Sheet**

The app language is Vietnamese. Use English only for vocabulary headwords, IPA, and examples.

### Screen 1: Mobile Mastery Archive List

Content:

- App top bar:
  - Title: `Sổ tay`
  - Subtitle: `VocaFlash`
  - Right status: lightning icon with `9`, round avatar `N`
- Page header:
  - Title: `Sổ tay`
  - Compact summary: `57 từ · 7 đến hạn · 22 đã thuộc`
  - Notebook chip: book icon + `11`
- Search input:
  - Placeholder: `Tìm từ, nghĩa, chủ đề...`
- Compact metrics strip:
  - `35 Đang học`
  - `7 Đến hạn`
  - `57 Yếu`
  - `22 Đã thuộc`
- Compact filter row:
  - segmented control: `Tất cả`, `Đến hạn`, `Yếu`, `Thuộc`
  - compact tune/filter icon button on the right
- Word list rows:
  - `Believe`, `/bɪˈliːv/`, `tin tưởng`, topic `Cảm xúc`, date `Jul 7`, stability `8D ổn định`
  - `Update`, `/ˌʌpˈdeɪt/`, `cập nhật`, topic `Công nghệ`, date `Hôm nay`, stability `4D ổn định`
  - `Anchor`, `/ˈæŋ.kər/`, `làm vững, neo lại`, topic `Học thuật`, date `Jun 30`, stability `12D ổn định`
- Bottom nav:
  - `Hôm nay`, `Học`, `Ôn tập`, active `Sổ tay`, `Hồ sơ`

Layout goals:

- No `LEXICAL ARCHIVE` label.
- Header must be compact.
- Filters must not take two full rows.
- Show at least 2.5 word rows in the first 850px viewport.
- Cards should feel like dense archive rows, not dashboard cards.
- Selection checkbox and notebook/favorite action remain 44px touch targets.

### Screen 2: Mobile Word Detail Bottom Sheet

Show the list dimmed behind a bottom sheet.

Sheet:

- Rounded top corners.
- Drag handle.
- Header:
  - `Believe`
  - `/bɪˈliːv/`
  - topic `Cảm xúc`
  - `8D ổn định`
  - close button
- Tabs:
  - `Tổng quan`
  - `Ngôn ngữ`
  - `Ghi chú`
  - `Thống kê`
- Overview section:
  - label `Định nghĩa & ví dụ`
  - definition `tin tưởng`
  - example quote: `I believe this method will help me remember the word.`
- Linguistic section:
  - label `Ngôn ngữ`
  - chips: `verb`, `believe`, `believed`, `belief`, `trust`, `doubt`
- Stats section:
  - `8.0d Độ bền`
  - `4.0 Độ khó`
  - `1 Lượt`
  - `0 Quên`
- Notes section:
  - label `Ghi chú`
  - `Chưa có ghi chú`

Layout goals:

- Detail sheet must feel richer than current mobile implementation.
- It should match the desktop information architecture: overview, linguistic, notes, stats.
- Content should be scrollable within the sheet.
- No horizontal overflow.
- Keep controls thumb-friendly.
