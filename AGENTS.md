# AGENTS.md — VocaFlash

> AI collaboration manifest for VocaFlash project.

## Project Overview
- **Name**: voca-flash
- **Type**: SPA (Vite + React + shadcn/ui)
- **Primary Language**: Vietnamese (vi) — UI người dùng
- **Target Language**: English (en) — từ vựng học
- **Domain**: localhost (development)

## Commands
```bash
npm run dev      # Start local dev server
npm run build    # Build for production
npm run test     # Run tests
npm run test:gate # Pre-deploy test gate
```

## Project Structure
```
src/
  components/    # React components
  pages/         # Page components (Home, Learn, Review, Progress)
  i18n/          # Language files (vi.json, en.json)
  hooks/         # Custom React hooks
  lib/           # Utilities (SRS algorithm, storage)
  App.tsx        # Root component with routing
  main.tsx       # Entry point
  index.css      # Design tokens + Tailwind
```

## SRS Algorithm (Spaced Repetition System)
- SM-2 algorithm variant for flashcard scheduling
- Intervals: Again(1m) → Hard(6h) → Good(1d) → Easy(4d)
- Ease factor adjusts based on user response

## Code Conventions
- **i18n**: ALL user-facing strings must use `t()` from react-i18next. vi.json = source of truth.
- **CSS**: Use Tailwind utilities + design tokens. No raw hex colors.
- **Components**: Functional components with hooks only.
- **Commits**: Conventional format — `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- **Storage**: localStorage for local-first data persistence

## Important Rules
1. Read `.cm/CONTINUITY.md` at the start of every session for context
2. Mobile-first: design for 375px first, enhance for larger screens
3. i18n extraction: MAX 30 strings per batch
4. Run test:gate before every deploy
5. Never hardcode strings in UI — always use t()
