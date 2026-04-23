# Design: Clean Code April 2026 v2

## Goal
Fix all 20+ code-hygiene issues surfaced in the scan report (`specs/scan-report.md`):
5 likely bugs, 10 duplication clusters, 10 large functions, ~8 quick wins.

Behavior must be preserved. Every change lands as an isolated `clean:` commit with tests green between commits.

## Context & Technical Approach

The codebase has organically grown past the point where admin form modals, CRUD hooks, and review challenge components each reinvent the same patterns. Three strategies, layered:

1. **Fix bugs first** (Section C). Small surgical edits, no architectural risk. Unblocks confidence before restructuring.
2. **Extract shared primitives** (Section B). Land the common wrappers — `AdminModal`, `ErrorBanner`, `LoadingSpinner`, `ImageUrlField`, `SlugField`, `useAdminResource`, `ChallengeTextInput`, `mapFSRSCardToProgress`, `buildChoicePayload`. Each primitive shrinks multiple consumers and removes duplication before we touch the big files.
3. **Refactor large functions** (Section A). By the time we reach them, most of their size will already be gone because primitives replaced inline JSX/logic. What remains is extracting hooks (`useRoadmapSetup`, `useRoadmapForm`, `useSrsSession`, `useImportFlow`, `useTopicDragDrop`) and splitting provider concerns in `AuthContext`.

### Ordering rationale

Primitives land **before** their consumers are refactored. Otherwise we'd refactor `WordFormModal.tsx` twice. Example:
- Extract `AdminModal` first (B2) → then `WordFormModal` refactor (A3) uses it, saves ~60 lines for free.

### Risk controls

- No behavior change per commit — verified by existing test suite after each step.
- Large-function splits (A1 `AuthProvider`, A4 `useFlashcard`) happen **last**, on a clean tree, with a focused test run.
- Each hook extraction keeps the original public API of the component/page.

## Proposed Changes

### Phase 1 — Bug Fixes (Section C)
Single-commit per fix. No new files.

- `useFlashcard.ts:186` — drop `refreshInitialData` from `syncSrsUpdate` deps (or add the call if intended — verify git blame).
- `AuthContext.tsx:263–285` — add `refreshActiveRoadmap`, `refreshProfile`, `refreshInitialData` to the context-value `useMemo` deps.
- `StudyPage.tsx:59` — change `useRef<string | undefined>(null)` → `useRef<string | undefined>(undefined)`.
- `useFlashcard.ts:88–90` — remove `case true:` dead branch.
- `RichNoteEditor.tsx:117–120` — either add `@tiptap/extension-underline` to `extensions` or remove `toggleUnderline()` UI.

### Phase 2 — Quick Cleanups (Section C tail)
- `AuthContext.tsx:45` — delete hardcoded email fallback; require env var.
- `RichNoteEditor.tsx:219` — wrap "Drafting Mode" in `t()`.
- `RichNoteEditor.tsx` — add `MarkdownStorage` type; remove `any` casts.
- `WordPool.tsx:9` — import `FALLBACK_TAG_COLOR` from `tag-constants` (already has brand color).
- `word-queries.ts:78` — resolve the `TopicWordJoin` select-type mismatch.
- `word-queries.ts:91–92` — stop setting placeholder `slug: '', id: ''`; return `null` or the real values.
- `UsersPage.tsx:112–113` — remove fake `lastOnline` or wire a real data source.
- `srs.ts:173` — memoize non-default `fsrs(...)` instance by retention.

### Phase 3 — Extract Shared Primitives (Section B)
New files in `src/components/common/` and `src/hooks/`:

- `components/common/AdminModal.tsx` (B2) — wraps backdrop/body/close/footer; props: `open`, `onClose`, `title`, `subtitle`, `footer`.
- `components/common/ErrorBanner.tsx` (B9) — red-50 / red-200 banner, `message` prop.
- `components/common/LoadingSpinner.tsx` (B4) — spinner + optional label.
- `components/common/ImageUrlField.tsx` (B3) — input + preview + onError fallback.
- `components/common/SlugField.tsx` (B7) — name+slug with regenerate button.
- `components/review/ChallengeTextInput.tsx` + `hooks/useTextChallengeInput.ts` (B5).
- `hooks/admin/useAdminResource.ts` (B1) — generic `<T>` factory for items/loading/error + CRUD wrappers. Migrate `useAdminWords`, `useAdminTopics`, `useAdminRoadmaps`.
- `lib/srs.ts` — add `mapFSRSCardToProgress(cardId, card, lastReview?)` helper (B6), refactor the 3 call-sites.
- `lib/queries/word-queries.ts` — add `buildChoicePayload(wordId, choices)` (B8), refactor call-sites in `useAdminWords`.

### Phase 4 — Refactor Large Functions (Section A)
After Phase 3, each large function now uses primitives and is smaller. Remaining splits:

- **A5** `RoadmapFormModal` → `useRoadmapForm()` hook (matches sibling pattern).
- **A3** `WordFormModal` → sub-components `<WordBasicFields />`, `<WrongChoicesInput />` (ImagePreviewField already extracted as `ImageUrlField` in Phase 3).
- **A6** `WordPool` → `<TagFilterChips />`, `<WordPoolTable />`, `<BulkAssignBar />`.
- **A7** `TopicPanel` → `useTopicDragDrop()` + `<TopicCard />` (note: `src/components/roadmap/TopicCard.tsx` exists; this may be the admin variant — name it `<AdminTopicCard />`).
- **A9** `WordDetailPanel` → `<NoteTab />`.
- **A8** `ImportWordsModal` → `useImportFlow(topics, roadmapId)`, deduplicate `handleFileSelected`/`handleSheetsUrl`.
- **A10** `UsersPage` → move `UserSrsPanel` to `src/components/admin/UserSrsPanel.tsx` + `useUserSrsStats(userId)`.
- **A2** `RoadmapSetupPage` → `useRoadmapSetup(roadmapId)` hook; collapses 4× `loadData+fetchTopics` into one `refreshAll()` (B10).
- **A4** `useFlashcard` → split into `useSrsSession` (queue/flip/rate state) + `useSrsSync` (persistence effects).
- **A1** `AuthProvider` → extract `useThemeSync(profile)`, `useTtsSync(profile)`, `useLanguageSync(profile)`; move `refreshActiveRoadmap` to `lib/auth-helpers.ts`.

## Verification

- `npm run test` (vitest) must pass at every commit boundary.
- `npm run typecheck` and `npm run lint` clean after every phase.
- Manual smoke after Phase 4:
  - Log in / log out; theme + language persist.
  - Create/edit/delete a word, topic, roadmap via admin.
  - Run a Study session: flip, rate Again/Hard/Good/Easy, exit, resume.
  - Run a Review challenge (Construction + ContextGap + GhostRecall).
  - Import words via file + Google Sheets URL.
- No visual regression on admin modals, `WordDetailPanel` notes tab, review challenges.
