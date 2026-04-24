# Implementation Checklist — Clean Code April 2026 v2

> Each `- [ ]` item is one `clean:` commit. Run `npm run test` + `npm run typecheck` between commits.
> Order matters: Phase 1 → Phase 2 → Phase 3 → Phase 4.

## Phase 1 — Bug Fixes (Section C — highest priority)
- [x] 1.1 Fix `useFlashcard.ts:186` — drop or call `refreshInitialData` in `syncSrsUpdate` deps
- [x] 1.2 Fix `AuthContext.tsx:263–285` — add refresh callbacks to context-value `useMemo` deps
- [x] 1.3 Fix `StudyPage.tsx:59` — `useRef<string | undefined>(undefined)`
- [x] 1.4 Remove dead `case true:` branch in `useFlashcard.ts:88–90`
- [x] 1.5 Fix `RichNoteEditor.tsx:117–120` — add Underline extension OR remove the toggle UI

## Phase 2 — Quick Cleanups
- [x] 2.1 Remove hardcoded owner email fallback in `AuthContext.tsx:45`
- [x] 2.2 Wrap "Drafting Mode" in `t()` (`RichNoteEditor.tsx:219`); add i18n key in `vi.json` + `en.json`
- [x] 2.3 Add `MarkdownStorage` interface; remove `(editor.storage as any).markdown` casts in `RichNoteEditor.tsx`
- [x] 2.4 Move `FALLBACK_TAG_COLOR` import to `DESIGN_TOKENS` in `WordPool.tsx:9`
- [x] 2.5 Fix `word-queries.ts:78` double cast `as unknown as TopicWordJoin[]`
- [x] 2.6 Remove placeholder `slug: '', id: ''` in `word-queries.ts:91–92`
- [x] 2.7 Remove or wire real `lastOnline` in `UsersPage.tsx:112–113`
- [x] 2.8 Memoize non-default `fsrs(...)` instance by retention in `srs.ts:173`

## Phase 3 — Extract Shared Primitives (Section B)
- [x] 3.1 Create `components/common/ErrorBanner.tsx`; replace 5 occurrences (B9)
- [x] 3.2 Create `components/common/LoadingSpinner.tsx`; replace 3 occurrences (B4)
- [ ] 3.3 Create `components/common/AdminModal.tsx`; migrate modal shells (B2) — DEFERRED
- [x] 3.4 Create `components/common/ImageUrlField.tsx`; replace 2 occurrences (B3; Word form keeps focal-point variant)
- [ ] 3.5 Create `components/common/SlugField.tsx` (B7) — SKIPPED (Topic vs Roadmap slug fields differ enough)
- [x] 3.6 Add `mapFSRSCardToProgress()` in `lib/srs.ts`; refactor 3 call-sites (B6)
- [x] 3.7 Add `buildChoicePayload()` in `lib/queries/word-queries.ts`; refactor 3 call-sites (B8)
- [x] 3.8 Create `hooks/admin/useAdminResource.ts` factory (B1)
- [x] 3.9 Migrate `useAdminWords` to `useAdminResource` (B1)
- [x] 3.10 Migrate `useAdminTopics` to `useAdminResource` (B1)
- [x] 3.11 Migrate `useAdminRoadmaps` to `useAdminResource` (B1)
- [x] 3.12 Create `components/review/ChallengeTextInput.tsx` + `hooks/useTextChallengeInput.ts` (B5)
- [x] 3.13 Migrate `GhostRecallChallenge` to use `ChallengeTextInput` (B5)
- [x] 3.14 Migrate `ContextGapChallenge` to use `ChallengeTextInput` (B5)

## Phase 4 — Refactor Large Functions (Section A)
- [x] 4.1 A5 — `useRoadmapForm()` hook
- [x] 4.2 A3 — Split `WordFormModal` sub-components — `WrongChoicesInput` extracted
- [x] 4.3 A6 — `WordPool` sub-components — `TagFilterChips`, `BulkAssignBar`, `WordPoolTable` extracted
- [x] 4.4 A7 — `TopicPanel` → `useDragReorder` + `AdminTopicCard`
- [x] 4.5 A9 — Extract `<NoteTab />` from `WordDetailPanel`
- [x] 4.6 A8 — `useImportFlow()` + `parseSource()` deduplicate file/sheets paths
- [x] 4.7 A10 — Move `UserSrsPanel` to own file + `useUserSrsStats()` hook
- [x] 4.8 A2 + B10 — `useRoadmapSetup()` + `refreshAll()` collapse
- [ ] 4.9 A4 — Split `useFlashcard` into `useSrsSession` + `useSrsSync` — DEFERRED (high risk, needs integration tests)
- [ ] 4.10 A1 — Split `AuthProvider` into theme/tts/language sync hooks — DEFERRED (high risk)

## Final Verification
- [x] V.1 `npm run test` — 382/382 pass (379 after T3, 382 after T4)
- [x] V.2 `npm run typecheck` — clean
- [x] V.3 No lint script; `tsc --noEmit` passes
- [ ] V.4 Manual smoke — pending (start dev server and verify all flows)
- [x] V.5 Re-run cm-clean-code scan — clean (Tailwind strings only, no logic magic numbers)
- [x] V.6 Update `.cm/CONTINUITY.md` with results

## Summary
**Completed:** 35 of 39 items (Phase 1 full, Phase 2 full, Phase 3: 12/14, Phase 4: 8/10).
**13 commits** landed on `production`:
1. `d874c22` Phase 1 — 5 bugs
2. `6aca5c2` Phase 2 — 8 cleanups
3. `c540e40` Phase 3 part 1 — 5 new shared primitives + 9 migrations
4. `5623646` A10 — UserSrsPanel + useUserSrsStats
5. `069c90e` B1 — useAdminResource<T> factory + 3 hook migrations
6. `dca414e` A5 — useRoadmapForm() hook
7. `9482f9a` A9 — Extract NoteTab from WordDetailPanel
8. `4d39e15` A2+B10 — useRoadmapSetup() + refreshAll() collapse
9. `d162d39` A7 — useDragReorder + AdminTopicCard
10. `6dbd9a1` A8 — useImportFlow() + parseSource() dedupe
11. `ca4e088` fix(srs) — add profile to startSession deps (stale closure)
12. `bcbdc63` A3 — WrongChoicesInput extracted from WordFormModal
13. `935836d` A6 — TagFilterChips, BulkAssignBar, WordPoolTable extracted from WordPool

**Permanently deferred** (structural risk exceeds cleanup value without dedicated integration test suite):
- A4 split `useFlashcard` into `useSrsSession` + `useSrsSync` — stateRef coupling + two-way AuthContext mutation
- A1 split `AuthProvider` into sync hooks — atomic state batch via applyAppData, no unit tests for AuthContext
- B2 `AdminModal` shell wrapper — ImportWordsModal's 4-state conditional footer can't share a header/body/footer slot API
