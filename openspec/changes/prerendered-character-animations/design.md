# Design: Pre-rendered Character Animations

## Context & Technical Approach
VocaFlash already has a character collection, selected character state, EXP spending, and evolution stages. The current `CharacterAvatar` renders a CSS-based avatar from `CharacterDefinition` and `CharacterEvolutionStage`. The next step should replace that visual layer with pre-rendered bitmap/video assets while keeping the existing reward, unlock, select, and evolution logic unchanged.

The recommended approach is asset-driven animation:

- Use `.webm` loops with posters for modern browsers.
- Keep `.webp` still images as the universal fallback.
- Avoid Three.js and GLB runtime for this feature.
- Render only the active/selected mascot as video; use still images in dense grids.
- Respect `prefers-reduced-motion` by showing still posters.

This keeps the character system emotionally richer without adding a 3D render pipeline to the app.

## Proposed Changes
### Asset Contract
- Add an explicit contract for generated files under `public/character-assets/`.
- Organize by character id, stage, and animation state:
  - `public/character-assets/seedling_scholar/stage-1/idle.webm`
  - `public/character-assets/seedling_scholar/stage-1/idle.webp`
  - `public/character-assets/seedling_scholar/stage-1/correct.webm`
  - `public/character-assets/seedling_scholar/stage-1/wrong.webm`
  - `public/character-assets/seedling_scholar/stage-1/celebrate.webm`
- Target short, seamless clips:
  - idle loop: 2-4 seconds
  - reaction clips: 1-2 seconds
  - square framing, transparent background if practical
  - poster `.webp` for every clip
- For browser safety, use `.webp` fallback first and add `.mp4` fallback only if Safari/mobile testing shows gaps.

### Character Domain Types
- Extend character visual metadata without changing unlock/evolution semantics.
- Add a small asset resolver in `src/lib/characters.ts` or a new `src/lib/character-assets.ts`.
- Add a narrow state type:
  - `idle`
  - `correct`
  - `wrong`
  - `celebrate`
  - `evolve`
- Resolve stage-specific assets from `character.id` and `currentStageDefinition.stage`.
- Fall back to the current CSS avatar when a file is not defined yet. This lets the app ship before every character has final art.

### Character Renderer
- Replace the internals of `CharacterAvatar` with a media-capable renderer while preserving its current public props where possible:
  - `character`
  - `stageDefinition`
  - `size`
- Add optional props:
  - `animationState?: CharacterAnimationState`
  - `animated?: boolean`
  - `onReactionEnd?: () => void`
- Use `<video muted playsInline autoPlay loop>` only for idle loops.
- Use non-looping video for reactions and return to idle on `ended`.
- Use `<img loading="lazy">` for static grid cards.
- Keep the existing CSS avatar as a fallback component, not as dead code.

### Dashboard
- Update `CharacterShowcaseCard` to show the selected character's current evolved stage as an idle loop.
- Avoid extra visible instructional copy.
- Keep the existing available EXP, stage label, and collection CTA.
- Lazy-load or defer video so Dashboard metrics stay responsive.

### Characters Page
- Use static `.webp` previews for all grid cards by default.
- Optionally animate only the selected card or the hovered/focused card.
- Keep action logic unchanged:
  - locked
  - unlock
  - evolve
  - select
  - maxed
- After a successful evolve action, play the `evolve` or `celebrate` reaction on that card if available.

### Study And Review Reactions
- Add a small mascot dock or inline mascot area to Study/Review surfaces only after the base renderer is stable.
- Trigger reactions from existing answer outcomes:
  - correct answer: `correct`
  - incorrect answer: `wrong`
  - session complete: `celebrate`
- After each reaction clip ends, return to `idle`.
- Do not block grading, SRS updates, navigation, or reward sync on animation playback.

## Data Flow
1. Character collection loads through existing `useCharacterCollection`.
2. UI selects the current `CharacterCollectionItem`.
3. Renderer receives `character`, `currentStageDefinition`, and desired animation state.
4. Asset resolver builds stage-specific media paths.
5. Renderer chooses:
   - video when animated and motion is allowed.
   - image fallback for reduced motion, unsupported media, or dense grids.
   - CSS avatar if generated assets are missing.
6. Study/Review interactions set transient reaction state, then reset to `idle`.

## Scope
### Must Have
- Asset contract and folder naming.
- Media renderer with CSS fallback.
- Dashboard idle loop for selected character.
- Static previews on `/characters`.
- Focused tests for asset resolution and fallback behavior.
- `npm run build`.

### Nice To Have
- Study/Review correct/wrong reactions.
- Evolve celebration on `/characters`.
- Optional `.mp4` fallback after browser checks.
- Asset validation script for missing posters and oversized files.

### Out Of Scope
- Real-time GLB/Three.js rendering.
- Camera controls or user-controlled 3D rotation.
- Server-side storage for media files.
- Reworking EXP, unlock, or evolution economy.
- Generating final production art inside the app.

## Edge Cases
- Asset missing for a character stage: render the existing CSS avatar.
- Browser blocks video autoplay: show poster image.
- User enables reduced motion: show poster image.
- Many character cards are visible: do not autoplay every card.
- Reaction clip fails to load: return to idle and keep the learning flow unaffected.
- Selected character changes while a reaction is playing: cancel the reaction and render the new selected character.

## Verification
- Unit tests:
  - asset path resolution by character/stage/state.
  - fallback when stage or media is missing.
  - reduced-motion/static mode chooses image path.
- Component tests:
  - Dashboard renders selected character media.
  - `/characters` grid uses static previews by default.
  - reaction `ended` calls reset handler.
- Build and gate:
  - `npm run build`
  - `npm run test:gate` for larger UI wiring.
- Manual smoke:
  - Dashboard selected character idles without layout shift.
  - `/characters` grid remains fast with all cards visible.
  - answer correct/wrong reaction returns to idle.
  - reduced-motion mode shows still artwork.
  - mobile viewport has no overlapping text or media.
