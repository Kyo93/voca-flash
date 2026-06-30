# Stitch Prompt: VocaFlash Mobile Mastery Archive

Create a polished mobile UI design for a vocabulary learning app named **VocaFlash**.

Target device: **Samsung S25 Ultra mobile viewport, 390x850 CSS px**.

Design style: **Tactile Scholar**. Warm ivory background, terracotta primary accents, sage green secondary accents, calm minimal surfaces, hairline borders, moderate radius. Avoid glassmorphism, blur-heavy effects, purple gradients, oversized cards, decorative labels, and marketing-style layout.

Generate **two mobile screens side by side**:

1. Archive list screen.
2. Word detail bottom sheet screen.

## Screen 1: Archive List

Top app bar:
- Title: `Sổ tay`
- Subtitle: `VocaFlash`
- Right side: lightning icon with `9`, circular avatar `N`

Page header:
- Title: `Sổ tay`
- Compact summary: `57 từ · 7 đến hạn · 22 đã thuộc`
- Notebook chip on the right: book icon + `11`

Important: **Do not include `LEXICAL ARCHIVE` or any decorative eyebrow label.**

Search:
- Compact search input, placeholder `Tìm từ, nghĩa, chủ đề...`

Metrics:
- One compact strip with four small metrics:
  - `35 Đang học`
  - `7 Đến hạn`
  - `57 Yếu`
  - `22 Đã thuộc`

Filters:
- One compact horizontal segmented control:
  - `Tất cả`
  - `Đến hạn`
  - `Yếu`
  - `Thuộc`
- A 44px tune/filter icon button on the right.
- Do not use a two-row filter grid.

Word rows:
- Dense archive rows, not large dashboard cards.
- Each row has:
  - 44px checkbox target
  - word
  - IPA
  - Vietnamese definition
  - topic chip
  - review date
  - stability label
  - small progress bar
  - 44px notebook/favorite target

Example rows:
- `Believe`, `/bɪˈliːv/`, `tin tưởng`, `Cảm xúc`, `Jul 7`, `8D ổn định`
- `Update`, `/ˌʌpˈdeɪt/`, `cập nhật`, `Công nghệ`, `Hôm nay`, `4D ổn định`
- `Anchor`, `/ˈæŋ.kər/`, `làm vững, neo lại`, `Học thuật`, `Jun 30`, `12D ổn định`

Bottom nav:
- `Hôm nay`
- `Học`
- `Ôn tập`
- active `Sổ tay`
- `Hồ sơ`

Goal: first viewport should show header, search, compact filters, and at least 2.5 word rows.

## Screen 2: Word Detail Bottom Sheet

Show the archive list dimmed in the background. Show a bottom sheet for `Believe`.

Sheet header:
- drag handle
- `Believe`
- `/bɪˈliːv/`
- topic chip `Cảm xúc`
- `8D ổn định`
- close button

Tabs:
- `Tổng quan`
- `Ngôn ngữ`
- `Ghi chú`
- `Thống kê`

Visible tab content should communicate that the sheet contains full detail, not only a tiny summary.

Overview:
- label `Định nghĩa & ví dụ`
- definition `tin tưởng`
- quote: `I believe this method will help me remember the word.`

Linguistic:
- label `Ngôn ngữ`
- chips: `verb`, `believe`, `believed`, `belief`, `trust`, `doubt`

Stats:
- `8.0d Độ bền`
- `4.0 Độ khó`
- `1 Lượt`
- `0 Quên`

Notes:
- `Chưa có ghi chú`

Use the attached/imported design tokens from `.stitch/DESIGN.md` if available.
