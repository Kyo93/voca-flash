# Clean Code Scan Report — voca-flash

**Date:** 2026-04-23
**Scope:** All `src/` (~17k LOC, 100+ files)
**Focus:** Large functions (>50 lines) and duplicated logic

---

## Section A — Top 10 Large Functions

| # | File:Lines | Function | ~Lines | Smell | Suggested Fix |
|---|---|---|---|---|---|
| 1 | `contexts/AuthContext.tsx:56–292` | `AuthProvider` | 236 | 7 useState + 4 useEffect; mixes auth/theme/TTS/i18n/roadmap = 5 concerns | Extract `useThemeSync`, `useTtsSync`, `useLanguageSync`; move `refreshActiveRoadmap` to `lib/auth-helpers.ts` |
| 2 | `pages/admin/RoadmapSetupPage.tsx:31–276` | `RoadmapSetupPage` | 245 | God Page: 4 fetches, 7 modal states, 6 handlers; `loadData+fetchTopics` repeated 4× | Extract `useRoadmapSetup(roadmapId)` hook |
| 3 | `components/admin/WordFormModal.tsx:42–335` | `WordFormModal` | 293 | 293-line JSX with no sub-components | Extract `<ImagePreviewField />`, `<WrongChoicesInput />`, `<WordBasicFields />` |
| 4 | `hooks/useFlashcard.ts:20–218` | `useFlashcard` | 198 | Mixes SRS logic + persistence + progress; `rate` = 46 lines; stale dep on line 186 | Split into `useSrsSession` + `useSrsSync` |
| 5 | `components/admin/RoadmapFormModal.tsx:19–244` | `RoadmapFormModal` | 225 | Only form modal without a hook (siblings use `useWordForm`/`useTopicForm`) | Create `useRoadmapForm(roadmap, open)` |
| 6 | `components/admin/WordPool.tsx:48–299` | `WordPool` | 251 | Renders breadcrumb + search + tag chips + bulk bar + table — 13 props | Extract `<TagFilterChips />`, `<WordPoolTable />`, `<BulkAssignBar />` |
| 7 | `components/admin/TopicPanel.tsx:21–214` | `TopicPanel` | 193 | D&D state + 4 handlers + 80-line topic card JSX inline in `.map()` | Extract `useTopicDragDrop()` + `<TopicCard />` |
| 8 | `components/admin/ImportWordsModal.tsx:34–227` | `ImportWordsModal` | 193 | 6-state machine inline; `handleFileSelected`/`handleSheetsUrl` near-identical (68–99) | Extract `useImportFlow(topics, roadmapId)` |
| 9 | `components/WordDetailPanel.tsx:32–256` | `WordDetailPanel` | 224 | Notes tab (172–247) = 75 lines inline editor | Extract `<NoteTab />` |
| 10 | `pages/admin/UsersPage.tsx:19–127` | `UserSrsPanel` (nested) | 109 | Panel defined inside page file, does own fetch on mount | Move to own file + `useUserSrsStats(userId)` |

---

## Section B — Top 10 Duplication Clusters

| # | Pattern | Files | Extraction Target |
|---|---|---|---|
| 1 | Admin CRUD hook boilerplate (items/loading/error + fetch + wrappers) | `useAdminWords.ts:16–113`, `useAdminTopics.ts:11–56`, `useAdminRoadmaps.ts:10–57` | `useAdminResource<T>` factory |
| 2 | Modal shell JSX (backdrop + body + close + footer) | `WordFormModal:65–90,315–330`, `TopicFormModal:78–104,276–293`, `RoadmapFormModal:70–96,224–239` | `<AdminModal>` in `components/common/` |
| 3 | Image URL field + preview + onError fallback | `WordFormModal:235–281`, `TopicFormModal:222–248`, `RoadmapFormModal:158–179` | `<ImageUrlField />` |
| 4 | Loading spinner JSX (`progress_activity` + stone-400 text) | `WordPool:237–244`, `WordsPage:193–197`, `UsersPage:83–86` | `<LoadingSpinner />` |
| 5 | Text challenge input (trim→lowercase compare + shake + Enter hint) | `GhostRecallChallenge:14–116`, `ContextGapChallenge:13–100` | `<ChallengeTextInput />` + `useTextChallengeInput()` |
| 6 | FSRS card → CardProgress mapping (same spread 3 places) | `lib/srs.ts:179–190, 203–215, 226–236` | `mapFSRSCardToProgress()` helper |
| 7 | Slug regenerate button (refresh icon + `slugify(name)`) | `TopicFormModal:151–163`, `RoadmapFormModal:128–136` | `<SlugField />` |
| 8 | Choices payload builder | `word-queries.ts:34–38`, `useAdminWords.ts:43–49, 68–73` | `buildChoicePayload(wordId, choices)` |
| 9 | Error banner div (red-50/red-200) | 5 places: `WordFormModal:308`, `RoadmapFormModal:217`, `TopicFormModal:250`, `WordsPage:188`, `UsersPage:160` | `<ErrorBanner message />` |
| 10 | `loadData() + fetchTopics()` refresh pair | `RoadmapSetupPage:108, 118, 128, 159` (4×) | Single `refreshAll()` in new hook |

---

## Section C — Quick Wins / Bugs

**Likely bugs (highest priority):**
- `useFlashcard.ts:186` — `syncSrsUpdate` deps lists `refreshInitialData` but body never calls it (stale dep)
- `contexts/AuthContext.tsx:263–285` — context value `useMemo` omits refresh callbacks from deps → stale closures
- `pages/StudyPage.tsx:59` — `useRef<string | undefined>(null)` — `null` not assignable; should be `undefined`
- `hooks/useFlashcard.ts:88–90` — `case true:` inside switch over a string union → unreachable dead branch
- `components/common/RichNoteEditor.tsx:117–120` — `toggleUnderline()` silently no-ops (StarterKit lacks Underline)

**Magic values / dead code:**
- `AuthContext.tsx:45` — hardcoded owner email as env fallback
- `RichNoteEditor.tsx:219` — hardcoded "Drafting Mode" (missing `t()`)
- `RichNoteEditor.tsx:70,227,229` — `(editor.storage as any).markdown` ×3
- `WordPool.tsx:9` — `FALLBACK_TAG_COLOR` duplicates brand color
- `word-queries.ts:78` — `as unknown as TopicWordJoin[]` double-cast
- `word-queries.ts:91–92` — placeholder `slug: '', id: ''` on enriched topics
- `pages/admin/UsersPage.tsx:112–113` — `lastOnline` hardcoded
- `lib/srs.ts:173` — non-default `fsrs(...)` instance created per call (memoize)

**Prop drilling:**
- `WordPool.tsx` (13 props) & `BulkActionBar` in `WordsPage.tsx:171–184` (11 props)
