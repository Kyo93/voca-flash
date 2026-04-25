# Spec: Pre-rendered Character Asset Contract

## Goal
Define a stable contract for externally generated character art so the app can import animation clips without changing character economy logic.

## Directory Layout
Assets live in `public/character-assets/` and are addressed by URL from the Vite public root.

```text
public/character-assets/
  seedling_scholar/
    stage-1/
      idle.webm
      idle.webp
      correct.webm
      correct.webp
      wrong.webm
      wrong.webp
      celebrate.webm
      celebrate.webp
      evolve.webm
      evolve.webp
```

## States
- `idle`: looped ambient motion.
- `correct`: short positive reaction.
- `wrong`: short disappointed or thinking reaction.
- `celebrate`: stronger positive reaction for session completion.
- `evolve`: transformation or upgrade reaction after spending EXP.

## Export Targets
- Aspect ratio: square, preferably 1:1.
- Suggested canvas: 1024x1024 source, compressed for web delivery.
- Idle duration: 2-4 seconds, seamless loop.
- Reaction duration: 1-2 seconds, non-looping.
- Background: transparent WebM if practical, otherwise match VocaFlash surface tones during render.
- Poster: `.webp` still image for every animation state.
- Size budget:
  - idle `.webm`: ideally under 2 MB per stage.
  - reaction `.webm`: ideally under 1 MB each.
  - poster `.webp`: ideally under 200 KB.

## Runtime Rules
- Dashboard may autoplay only the selected character idle loop.
- `/characters` grid defaults to still `.webp` previews.
- Study/Review may play one selected mascot reaction at a time.
- Reduced-motion users always receive still posters.
- Missing assets must fall back to the existing CSS avatar.

## Initial Asset Batch
Start with the default character before scaling to the full catalog:

- `seedling_scholar` stage 1 idle loop and poster.
- `seedling_scholar` stage 2 idle loop and poster.
- `seedling_scholar` stage 3 idle loop and poster.
- `seedling_scholar` stage 1 correct, wrong, celebrate, evolve clips and posters.

After renderer verification, expand assets by selected character popularity and unlock tier.
