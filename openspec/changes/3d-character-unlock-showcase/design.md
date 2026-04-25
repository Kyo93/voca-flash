# Design: 3D Character Unlock Showcase

## Context & Technical Approach
The existing reward system stores lifetime EXP in `user_reward_progress.total_xp`, which powers levels and badges. Character unlocks should not subtract from lifetime EXP because that would make levels regress. The new system will add a spendable wallet layer: `spent_xp` plus derived available EXP.

The MVP should feel visually collectible without committing to a heavy 3D runtime immediately. Use a local character catalog, polished 3D-style image assets, and a Dashboard showcase card. Real GLB/Three.js scene support can be added after the unlock economy is stable.

## Proposed Changes
### Reward Economy
- Add `spent_xp` to `user_reward_progress`.
- Derive `availableXp = totalXp - spentXp` in the reward domain.
- Keep `totalXp` as lifetime EXP for levels, badges, and progress.
- Add tests for wallet math, normalization, and non-regression behavior.

### Character Catalog
- Add `src/lib/characters.ts` as the source of truth for character definitions.
- Character fields:
  - `id`
  - `costXp`
  - `rarity`
  - `nameKey`
  - `descriptionKey`
  - `assetUrl`
  - `poseLabelKey`
- Start with 5-7 characters across free/common/rare/epic tiers.
- Include one default/free character so every learner has a showcase.

### Storage and Database
- Add `supabase/migrations/041_user_character_unlocks.sql`.
- Create `user_character_unlocks`:
  - `user_id`
  - `character_id`
  - `unlocked_at`
  - primary key `(user_id, character_id)`
- Add `selected_character_id` either to `user_reward_progress` or a lightweight `user_character_profile` table.
- Add RPC `unlock_user_character(p_user_id, p_character_id, p_cost_xp)`:
  - Verify caller owns user or is admin.
  - Lock reward row.
  - Reject unknown/negative cost from frontend only by requiring frontend catalog cost, and validate available EXP.
  - Insert unlock idempotently.
  - Increment `spent_xp` only on first unlock.
  - Return updated reward progress and unlocked character list.
- Add RPC or update helper for selecting a character without spending EXP.
- Keep local fallback for dev/offline behavior, similar to rewards storage.

### Frontend Storage
- Add `src/lib/storage/characters.ts`.
- Export through `src/lib/supabase-storage.ts`.
- Add hook `useCharacterCollection(userId)`:
  - Loads reward progress and unlocked characters.
  - Computes locked/unlocked/affordable states from catalog + available EXP.
  - Supports unlock and select actions.
  - Listens to reward progress updates so available EXP stays current.

### UI
- Add `CharacterShowcaseCard` to Dashboard:
  - Shows selected character.
  - Shows available EXP.
  - CTA to open collection.
  - Dense, dashboard-native layout, not a landing section.
- Add `/characters` authenticated route or modal/page:
  - Character grid with locked/unlocked/affordable states.
  - Unlock button for affordable locked characters.
  - Select/display button for unlocked characters.
  - Keep full visible copy in i18n.
- Use existing Tailwind theme tokens; no hardcoded hex.
- Use real/generated bitmap image assets for characters. Avoid full Three.js scene in MVP unless asset/viewport verification is planned.

## Data Flow
1. Study/Arena awards EXP through existing reward flow.
2. Reward progress updates `totalXp`.
3. Character hook derives `availableXp`.
4. User unlocks character:
   - frontend sends `character_id` and catalog `cost_xp`.
   - RPC checks available EXP and records unlock.
   - reward progress updates `spent_xp`.
5. Dashboard renders selected character from collection state.

## Edge Cases
- User has no reward row: create default reward row before unlock or return empty progress.
- User already unlocked character: RPC returns success without double-spending.
- User lacks EXP: RPC returns a typed error; UI keeps button disabled.
- Character removed from catalog: unlocked id is ignored in UI but preserved in DB.
- Local fallback: unlock state persists in localStorage for development only.

## Verification
- Unit tests for `availableXp`, affordability, unlocked state, and selected character fallback.
- Storage tests/mocks for idempotent unlock behavior where feasible.
- `npm run build`.
- `npm run test:gate`.
- Manual smoke:
  - earn EXP
  - see available EXP
  - unlock affordable character
  - select character
  - Dashboard shows selected character
  - total level does not drop after spending EXP
