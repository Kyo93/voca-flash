# Implementation Checklist

- [ ] 1.1 Review current dirty tree and confirm intentional file adds/deletes.
- [ ] 1.2 Run `npm.cmd run test:gate` on the current baseline.
- [ ] 1.3 Commit the current completed clean-code baseline if the gate passes.

- [ ] 2.1 Remove `rehypeRaw` from `NotebookInvestigationPage` personal note rendering.
- [ ] 2.2 Remove `rehypeRaw` from `NoteTab` personal note rendering.
- [ ] 2.3 Add regression coverage for raw HTML/script-like note content.
- [ ] 2.4 Run focused notebook/note tests and `npm.cmd run build`.

- [ ] 3.1 Replace `ArenaLoading.colorClass` with a typed static variant map.
- [ ] 3.2 Update `FreeStudyPage` to use the typed loading variant.
- [ ] 3.3 Add hygiene coverage for Tailwind runtime class construction.
- [ ] 3.4 Run focused review/free-study/frontend-safety tests and `npm.cmd run build`.

- [ ] 4.1 Move dashboard quotes into `src/i18n/vi.json` and `src/i18n/en.json`.
- [ ] 4.2 Move dashboard growth labels into i18n.
- [ ] 4.3 Move `useWordForm` validation error into i18n or a typed translation-key path.
- [ ] 4.4 Extend hygiene tests for hook-level user-facing literals.
- [ ] 4.5 Run i18n sync, code hygiene tests, and build.

- [ ] 5.1 Add reward fallback normalization helpers in `src/lib/storage/rewards.ts`.
- [ ] 5.2 Fail-closed on malformed reward localStorage values.
- [ ] 5.3 Add reward fallback storage tests.
- [ ] 5.4 Run reward storage tests and related reward progress tests.

- [ ] 6.1 Design a dynamic import boundary for character model scene runtime.
- [ ] 6.2 Move Three.js runtime imports out of the React hook boundary.
- [ ] 6.3 Keep `CharacterModelAvatar` render shell unchanged from the outside.
- [ ] 6.4 Run focused character model tests and inspect build chunk sizes.

- [ ] 7.1 Split sticky note rendering from `NotebookInvestigationPage`.
- [ ] 7.2 Split word facts and related terms from `NotebookInvestigationPage`.
- [ ] 7.3 Re-run notebook tests after each split.

- [ ] 8.1 Audit data colors versus UI styling colors.
- [ ] 8.2 Add targeted color-token guardrails or allowlists.
- [ ] 8.3 Run code hygiene tests and final `npm.cmd run test:gate`.
