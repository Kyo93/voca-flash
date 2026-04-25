# Design: Character Evolution With EXP

## Context & Technical Approach
The current character system has unlock/select behavior and a global spendable EXP wallet:

- `totalXp`: lifetime EXP for level and badges.
- `spentXp`: EXP already spent on character systems.
- `availableXp`: derived balance for unlocks and future evolution.

Evolution should use the same spendable wallet. It must never reduce `totalXp` or regress user level. Each character gets a staged progression track, and the learner can spend available EXP to evolve an unlocked character one stage at a time.

## Proposed Changes
### Character Catalog
- Extend `CharacterDefinition` with `evolutionStages`.
- Stage shape:
  - `stage`
  - `costXp`
  - `nameKey`
  - `descriptionKey`
  - `poseLabelKey`
  - `icon`
  - `swatchClass`
- Stage 1 cost is `0` and represents the base unlocked form.
- Starter/common characters get 3 stages.
- Rare/epic characters get 4 stages.
- Keep names original and VocaFlash-themed; do not use protected anime/game IP.

### Domain Logic
- Extend `CharacterCollectionItem` with:
  - `currentStage`
  - `currentStageDefinition`
  - `nextStageDefinition`
  - `canEvolve`
  - `maxed`
  - `remainingXpForEvolution`
- Add pure helpers:
  - `getCharacterStage(character, stage)`
  - `getNextCharacterStage(character, currentStage)`
  - `buildCharacterCollection(...)` should derive evolution state from unlocked rows.
- Preserve fallback behavior: default character is always unlocked at stage 1.

### Database
- Add migration `042_user_character_evolution.sql`.
- Extend `user_character_unlocks`:
  - `current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage >= 1)`
  - `evolution_spent_xp INTEGER NOT NULL DEFAULT 0 CHECK (evolution_spent_xp >= 0)`
  - `evolved_at TIMESTAMPTZ`
- Add RPC `evolve_user_character(p_user_id, p_character_id, p_target_stage, p_cost_xp)`:
  - Verify caller owns user or is admin.
  - Ensure reward row exists.
  - Lock reward row and character unlock row.
  - Reject if character is not unlocked.
  - Require `p_target_stage = current_stage + 1`.
  - Verify available EXP is enough.
  - Increment `user_reward_progress.spent_xp`.
  - Update `current_stage`, `evolution_spent_xp`, `evolved_at`.
  - Return updated reward progress and unlocked character states.
- Idempotency rule: never double-spend for already-owned stages. Since evolution is sequential, repeated request for current stage should return current state without spending; request skipping stages should fail.

### Storage and Hook
- Update `src/lib/storage/characters.ts` row mapping to include `current_stage` and `evolution_spent_xp`.
- Add `evolveUserCharacter(...)`.
- Extend fallback localStorage collection with stage state.
- Extend `useCharacterCollection` with `evolveCharacter(characterId)`.
- Reuse reward progress update event after evolution so Dashboard/sidebar balances refresh.

### UI
- Dashboard showcase:
  - Render current evolved form, not only base character.
  - Show stage label and next evolution cost when applicable.
  - If maxed, show max state.
- `/characters` page:
  - Each card shows current stage, max stage, next stage preview, and action.
  - Button states:
    - locked: unlock / not enough EXP.
    - unlocked with next stage affordable: evolve.
    - unlocked but not affordable: show needed EXP.
    - maxed: max stage.
  - Keep text concise and i18n-backed.
- Keep the visual MVP as CSS 3D-style avatars using theme tokens; generated bitmap assets can replace CSS avatars later.

## Data Flow
1. Learner earns EXP through Study/Arena.
2. `availableXp` increases.
3. Learner unlocks a character or evolves an unlocked character.
4. Evolution RPC spends `availableXp` by increasing `spent_xp`.
5. Character collection state returns updated current stages.
6. Dashboard renders selected character's current evolved stage.

## Edge Cases
- User tries to evolve locked character: reject.
- User tries to skip stage 1 -> 3: reject.
- User repeats already-current target stage: no double spend.
- User lacks available EXP: reject and UI keeps button disabled.
- Catalog stage count changes later: stored stage is clamped to highest known catalog stage in UI.
- Default character can evolve only after the user has enough available EXP.

## Verification
- Unit tests for:
  - stage lookup and next stage math.
  - common vs rare/epic stage counts.
  - available EXP spending does not reduce lifetime level.
  - maxed state and remaining EXP.
  - collection fallback for missing stored stage.
- SQL migration review for RLS and transaction safety.
- `npm run build`.
- `npm run test:gate`.
- Manual smoke:
  - unlock character.
  - evolve one stage.
  - verify available EXP decreases.
  - verify level does not drop.
  - select evolved character.
  - verify Dashboard displays evolved form.
