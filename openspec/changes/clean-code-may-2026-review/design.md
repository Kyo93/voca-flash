# Design: May 2026 Clean Code Review Pass

## Context & Technical Approach

The current tree already contains a broad clean-code refactor: prototype notebook files were removed, Mastery notebook responsibilities were split, character model lifecycle logic moved into a hook, and the build currently passes. The next pass should not restart that work. It should stabilize the existing dirty tree first, then address the highest-risk hygiene issues found in the follow-up scan.

This initiative is cleanup-only. It must preserve behavior, avoid product feature changes, and keep each batch independently verifiable. The work should be committed in small conventional commits after passing focused tests and build checks.

## Proposed Changes

### 1. Stabilize Current Clean-Code Diff

- Review the existing dirty tree and confirm all new extracted files are intentional.
- Run the full gate before adding new cleanup changes.
- Commit the already-completed cleanup as a baseline if the gate passes.

Why this approach: the current diff spans many modules. Freezing the baseline first keeps future security/performance fixes easy to review and revert independently.

### 2. Remove Raw HTML Markdown Rendering

- Update `src/components/mastery/NotebookInvestigationPage.tsx`.
- Update `src/components/mastery/detail/NoteTab.tsx`.
- Remove `rehypeRaw` from personal note rendering, or replace it with an explicit sanitization strategy if raw HTML is truly required.
- Add regression coverage proving script/raw HTML is not rendered from user notes.

Why this approach: personal notes are user-controlled content. Clean-code review should prioritize security-sensitive simplicity before cosmetic refactors.

### 3. Replace Tailwind Runtime Class Construction

- Update `src/components/review/ArenaLoading.tsx`.
- Replace `colorClass` string interpolation with a typed variant map such as `primary | cyan`.
- Update `src/pages/FreeStudyPage.tsx` to pass the typed variant.
- Extend frontend safety or hygiene tests to catch future `bg-${...}`, `text-${...}`, `border-${...}` runtime class patterns.

Why this approach: Tailwind cannot reliably generate CSS for arbitrary runtime strings. Static class maps are safer and easier to scan.

### 4. Move Hardcoded User-Facing Copy To i18n

- Update `src/hooks/useDashboard.ts` quotes and growth labels to use translation keys.
- Update `src/hooks/admin/useWordForm.ts` validation error copy.
- Add or update keys in `src/i18n/vi.json` and `src/i18n/en.json`.
- Extend hygiene coverage to include selected non-JSX hardcoded UI strings in hooks.

Why this approach: the manifest requires no hardcoded Vietnamese/English UI strings. The current JSX guard does not catch hook-level UI copy.

### 5. Harden Reward Fallback Storage

- Update `src/lib/storage/rewards.ts`.
- Replace `JSON.parse(raw) as StoredRewardProgress` with normalization helpers similar to character fallback storage.
- Remove malformed localStorage entries fail-closed.
- Add `tests/unit/reward-storage-fallback.test.ts`.

Why this approach: character fallback storage was already hardened. Reward fallback should follow the same pattern so offline progress cannot be poisoned by malformed localStorage.

### 6. Split Character Model Runtime Loading

- Update `src/components/characters/useCharacterModelScene.ts`.
- Move static `three` imports behind a dynamic import boundary, likely through a small scene-runtime module.
- Keep `CharacterModelAvatar.tsx` as a thin shell.
- Verify build chunk output and focused character interaction tests.

Why this approach: the previous SRP split improved maintainability but did not reduce the 648 kB lazy chunk. Actual bundle reduction requires moving Three.js runtime imports across a dynamic boundary.

### 7. Continue SRP On Remaining Large Files

- Split `NotebookInvestigationPage.tsx` into focused child components: sticky note, word facts, related terms, empty state.
- Split `src/lib/storage/characters.ts` into fallback persistence, RPC mapping, and public operations if the file still feels dense after runtime work.
- Keep `NotebookScreen.tsx` stable unless a specific responsibility is still mixed in the page shell.

Why this approach: large-file cleanup is useful, but lower priority than security, deterministic styling, and fallback data safety.

### 8. Tighten Design Token Guardrails

- Classify direct colors in `theme.ts`, `tag-constants.ts`, and admin topic color tools as either data colors or UI styling.
- Keep data-driven colors where user/admin color selection requires them.
- Add explicit test allowlists only for intended data-color modules.

Why this approach: the current TSX hex guard passes, but color usage is still inconsistent across data, admin tools, and UI styling.

## Verification

- After baseline stabilization: `npm.cmd run test:gate`.
- After markdown rendering changes: focused note/notebook tests plus `npm.cmd run build`.
- After Tailwind variant changes: focused review/free-study/frontend-safety tests plus `npm.cmd run build`.
- After i18n changes: `tests/unit/i18n-sync.test.ts`, `tests/unit/code-hygiene.test.ts`, and build.
- After reward fallback changes: new reward fallback tests plus relevant reward/character tests.
- After Three.js split: focused character avatar/model tests plus build chunk inspection.
- Final gate: `npm.cmd run test:gate` and `git diff --check`.
