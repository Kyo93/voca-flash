# Design: Arena EXP Rewards

## Context & Technical Approach
VocaFlash already has SRS state, review logs, and an Arena summary. The reward system should sit beside SRS instead of changing FSRS scheduling. EXP is derived from completed learner actions, then persisted to a separate reward record so SRS data remains the source of truth for memory and reward data remains the source of truth for motivation.

## Proposed Changes
### Reward Domain
- Add a pure `src/lib/rewards.ts` module for XP rules, level thresholds, milestone badges, and progress math.
- Keep all visible labels as i18n keys so UI copy remains centralized.

### Storage
- Add `user_reward_progress` plus `increment_user_reward_progress` RPC.
- Add frontend storage helpers with local fallback so the UI still works before the migration is applied.

### Study and Arena Hooks
- Award XP once per word per session.
- Study earns higher XP for a first new word, lower effort XP for Again.
- Arena earns review XP for each first attempt, with a bonus for successful ghost recall.

### UI
- Arena header shows session XP plus current level.
- Session summary shows session XP, total XP progress, and newly unlocked medals.
- Progress badge gallery includes EXP medals alongside existing achievement cards.

## Verification
- Unit-test reward calculations and milestone crossing.
- Run `npm run build`.
- Run focused reward tests, then `npm run test:gate` if feasible.
