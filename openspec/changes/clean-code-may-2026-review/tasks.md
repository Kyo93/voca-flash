# Implementation Checklist

- [x] 1.1 Review current dirty tree and confirm intentional file adds/deletes.
- [x] 1.2 Run `npm.cmd run test:gate` on the current baseline.
- [x] 1.3 Commit the current completed clean-code baseline if the gate passes.

- [x] 2.1 Remove `rehypeRaw` from `NotebookInvestigationPage` personal note rendering.
- [x] 2.2 Remove `rehypeRaw` from `NoteTab` personal note rendering.
- [x] 2.3 Add regression coverage for raw HTML/script-like note content.
- [x] 2.4 Run focused notebook/note tests and `npm.cmd run build`.

- [x] 3.1 Replace `ArenaLoading.colorClass` with a typed static variant map.
- [x] 3.2 Update `FreeStudyPage` to use the typed loading variant.
- [x] 3.3 Add hygiene coverage for Tailwind runtime class construction.
- [x] 3.4 Run focused review/free-study/frontend-safety tests and `npm.cmd run build`.

- [x] 4.1 Move dashboard quotes into `src/i18n/vi.json` and `src/i18n/en.json`.
- [x] 4.2 Move dashboard growth labels into i18n.
- [x] 4.3 Move `useWordForm` validation error into i18n or a typed translation-key path.
- [x] 4.4 Extend hygiene tests for hook-level user-facing literals.
- [x] 4.5 Run i18n sync, code hygiene tests, and build.

- [x] 5.1 Add reward fallback normalization helpers in `src/lib/storage/rewards.ts`.
- [x] 5.2 Fail-closed on malformed reward localStorage values.
- [x] 5.3 Add reward fallback storage tests.
- [x] 5.4 Run reward storage tests and related reward progress tests.

- [x] 6.1 Design a dynamic import boundary for character model scene runtime.
- [x] 6.2 Move Three.js runtime imports out of the React hook boundary.
- [x] 6.3 Keep `CharacterModelAvatar` render shell unchanged from the outside.
- [x] 6.4 Run focused character model tests and inspect build chunk sizes.

- [x] 7.1 Split sticky note rendering from `NotebookInvestigationPage`.
- [x] 7.2 Split word facts and related terms from `NotebookInvestigationPage`.
- [x] 7.3 Re-run notebook tests after each split.

- [ ] 8.1 Audit data colors versus UI styling colors.
- [ ] 8.2 Add targeted color-token guardrails or allowlists.
- [ ] 8.3 Run code hygiene tests and final `npm.cmd run test:gate`.
