# Implementation Checklist — Clean Code April 2026 v2

> Each `- [ ]` item is one `clean:` commit. Run `npm run test` + `npm run typecheck` between commits.
> Order matters: Phase 1 → Phase 2 → Phase 3 → Phase 4.

## Phase 1 — Bug Fixes (Section C — highest priority)
- [ ] 1.1 Fix `useFlashcard.ts:186` — drop or call `refreshInitialData` in `syncSrsUpdate` deps
- [ ] 1.2 Fix `AuthContext.tsx:263–285` — add refresh callbacks to context-value `useMemo` deps
- [ ] 1.3 Fix `StudyPage.tsx:59` — `useRef<string | undefined>(undefined)`
- [ ] 1.4 Remove dead `case true:` branch in `useFlashcard.ts:88–90`
- [ ] 1.5 Fix `RichNoteEditor.tsx:117–120` — add Underline extension OR remove the toggle UI

## Phase 2 — Quick Cleanups
- [ ] 2.1 Remove hardcoded owner email fallback in `AuthContext.tsx:45`
- [ ] 2.2 Wrap "Drafting Mode" in `t()` (`RichNoteEditor.tsx:219`); add i18n key in `vi.json` + `en.json`
- [ ] 2.3 Add `MarkdownStorage` interface; remove `(editor.storage as any).markdown` casts in `RichNoteEditor.tsx`
- [ ] 2.4 Move `FALLBACK_TAG_COLOR` import to `tag-constants` in `WordPool.tsx:9`
- [ ] 2.5 Fix `word-queries.ts:78` double cast `as unknown as TopicWordJoin[]`
- [ ] 2.6 Remove placeholder `slug: '', id: ''` in `word-queries.ts:91–92`
- [ ] 2.7 Remove or wire real `lastOnline` in `UsersPage.tsx:112–113`
- [ ] 2.8 Memoize non-default `fsrs(...)` instance by retention in `srs.ts:173`

## Phase 3 — Extract Shared Primitives (Section B)
- [ ] 3.1 Create `components/common/ErrorBanner.tsx`; replace 5 occurrences (B9)
- [ ] 3.2 Create `components/common/LoadingSpinner.tsx`; replace 3 occurrences (B4)
- [ ] 3.3 Create `components/common/AdminModal.tsx`; migrate `WordFormModal`, `TopicFormModal`, `RoadmapFormModal` shells (B2)
- [ ] 3.4 Create `components/common/ImageUrlField.tsx`; replace 3 occurrences (B3)
- [ ] 3.5 Create `components/common/SlugField.tsx`; replace 2 occurrences (B7)
- [ ] 3.6 Add `mapFSRSCardToProgress()` in `lib/srs.ts`; refactor 3 call-sites (B6)
- [ ] 3.7 Add `buildChoicePayload()` in `lib/queries/word-queries.ts`; refactor 3 call-sites (B8)
- [ ] 3.8 Create `hooks/admin/useAdminResource.ts` factory (B1)
- [ ] 3.9 Migrate `useAdminWords` to `useAdminResource` (B1)
- [ ] 3.10 Migrate `useAdminTopics` to `useAdminResource` (B1)
- [ ] 3.11 Migrate `useAdminRoadmaps` to `useAdminResource` (B1)
- [ ] 3.12 Create `components/review/ChallengeTextInput.tsx` + `hooks/useTextChallengeInput.ts` (B5)
- [ ] 3.13 Migrate `GhostRecallChallenge` to use `ChallengeTextInput` (B5)
- [ ] 3.14 Migrate `ContextGapChallenge` to use `ChallengeTextInput` (B5)

## Phase 4 — Refactor Large Functions (Section A)
- [ ] 4.1 A5 — Create `useRoadmapForm()` hook; refactor `RoadmapFormModal`
- [ ] 4.2 A3 — Extract `<WordBasicFields />`, `<WrongChoicesInput />` from `WordFormModal`
- [ ] 4.3 A6 — Extract `<TagFilterChips />`, `<WordPoolTable />`, `<BulkAssignBar />` from `WordPool`
- [ ] 4.4 A7 — Extract `useTopicDragDrop()` + `<AdminTopicCard />` from `TopicPanel`
- [ ] 4.5 A9 — Extract `<NoteTab />` from `WordDetailPanel`
- [ ] 4.6 A8 — Extract `useImportFlow()` from `ImportWordsModal`; deduplicate file+URL parse paths
- [ ] 4.7 A10 — Move `UserSrsPanel` to own file + `useUserSrsStats()` hook
- [ ] 4.8 A2 + B10 — Create `useRoadmapSetup()`; collapse 4× refresh pair into `refreshAll()`
- [ ] 4.9 A4 — Split `useFlashcard` into `useSrsSession` + `useSrsSync`
- [ ] 4.10 A1 — Extract `useThemeSync` / `useTtsSync` / `useLanguageSync`; move `refreshActiveRoadmap` to `lib/auth-helpers.ts`

## Final Verification
- [ ] V.1 `npm run test` — all tests pass
- [ ] V.2 `npm run typecheck` — clean
- [ ] V.3 `npm run lint` — clean
- [ ] V.4 Manual smoke: login → study session → admin CRUD → import flow → review challenges
- [ ] V.5 Re-run cm-clean-code scan; confirm zero remaining smells from this report
- [ ] V.6 Update `.cm/CONTINUITY.md` with results
