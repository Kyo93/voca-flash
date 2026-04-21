# 🦴 Skeleton Index: voca-flash

| Meta | Value |
|------|-------|
| Source Files | 94 (+24 since last scan) |
| Language | TypeScript/TSX |
| Framework | Vite + React 19 + React Router v7 |
| SRS | FSRS (ts-fsrs) + SM-2 legacy |
| i18n | react-i18next (vi/en) |
| State | React Context + localStorage/Supabase |
| Tests | 30 unit test files (vitest) |

## Entry Points
- `src/main.tsx` → App → React Router
- `src/App.tsx` → Route definitions
- `src/i18n.ts` → i18next init

## Directory Structure

```
src/
├── components/
│   ├── ActivityHeatmap.tsx    # GitHub-style heatmap
│   ├── AppLayout.tsx          # Main layout shell
│   ├── ConfirmDialog.tsx      # Reusable confirm modal
│   ├── Header.tsx             # Search header
│   ├── NoteDrawer.tsx         # Word notes drawer
│   ├── RightSidebar.tsx       # Stats + streak sidebar
│   ├── SRSButtons.tsx         # Again/Hard/Good/Easy
│   ├── Sidebar.tsx            # Nav + streak
│   ├── StudyChallengeCard.tsx
│   ├── StudyChallengeShell.tsx
│   ├── StudyPrepScreen.tsx    # Pre-study stats screen
│   ├── WordDetailPanel.tsx    # Word detail sidebar
│   ├── admin/                 # AdminPanel: WordFormModal, ImportWordsModal, RoadmapFormModal, TopicFormModal, AdminLayout, AdminSidebar
│   ├── common/AudioButton.tsx # TTS audio button
│   ├── mastery/CardRow.tsx    # Mastery page card row
│   ├── review/                # Arena challenges: ArenaShell, ChallengeManager, 5 challenge types, SessionSummary, ConfirmExitModal
│   ├── roadmap/TopicCard.tsx  # Topic card in Library/RoadmapTopics
│   └── study/                 # FlashcardFront, FlashcardBack, StudyComplete
├── pages/
│   ├── Home.tsx | LandingPage.tsx | LoginPage.tsx
│   ├── DashboardPage.tsx | LibraryPage.tsx | RoadmapTopicsPage.tsx
│   ├── StudyPage.tsx | ReviewPage.tsx | FreeStudyPage.tsx
│   ├── ProgressPage.tsx | MasteryPage.tsx | SettingsPage.tsx
│   ├── MethodologyPage.tsx
│   └── admin/                 # Dashboard, Roadmaps, RoadmapSetup, Topics, Words, Users
├── contexts/                  # AuthContext, RoadmapContext, SidebarContext
├── hooks/
│   ├── useFlashcard.ts
│   ├── useReviewSession.ts    # → challenge-logic.ts
│   ├── useFreeStudySession.ts # → challenge-logic.ts
│   ├── useNotebook.ts         # NEW: notebook entry management
│   ├── useStudySessionMode.ts # NEW: study phase state machine
│   └── admin/                 # useAdminRoadmaps, useAdminTopics, useAdminWords
├── lib/
│   ├── storage/               # supabase-storage: auth, mastery, roadmap, session, notebook
│   ├── admin-queries.ts       # Admin CRUD (words, topics, roadmaps, users, stats)
│   ├── srs.ts                 # FSRS algorithm, mapping, levels
│   ├── streak.ts              # localStorage + Supabase dual-source
│   ├── challenge-logic.ts     # SHARED: quadrant selection
│   ├── types.ts               # CENTRAL: all interfaces
│   ├── tag-engine.ts          # autoTag, suggestTopicFromTags, TAG_META
│   ├── tts.ts                 # Web Speech API wrapper
│   ├── import-parser.ts       # CSV + Google Sheets import
│   ├── utils.ts               # shuffle, slugify, generateChoices, formatRelativeTime
│   ├── supabase-storage.ts    # Re-exports from storage/
│   ├── supabase.ts            # supabase client singleton
│   ├── auth.ts                # signIn, signUp, signOut, getSession, getUser
│   ├── constants.ts           # SRS_STABILITY_LEVELS, STUDY_SESSION_DEFAULTS, MASTERY_CONFIG
│   └── settings-defaults.ts    # defaultSettings object
└── i18n.ts
```

## Code Skeleton

### `src/contexts/`
**AuthContext.tsx**
```
41:export function AuthProvider({ children })
257:export function useAuth()
```
**RoadmapContext.tsx** — ACTIVE: used by TopicsPage, WordsPage, AdminLayout
**SidebarContext.tsx** — SIDEBAR_WIDTH=256, RIGHTBAR_WIDTH=280

### `src/lib/types.ts` — CENTRAL TYPE DEFINITIONS
```
4:export interface Roadmap
16:export interface Topic
31:export interface Word
54:export interface WordChoice         ← NEW
62:export interface UserProfile
83:export interface ResumePointer
92:export interface SrsRecord
116:export interface AdminUser          ← NEW
124:export interface AuthSession
134:export interface MasteryWord
158:export interface InitialAppData
184:export interface ProgressPageData
208:export interface LibraryPageData
222:export interface DashboardSummary
228:export interface MasteryStats
239:export interface BatchInsertResult   ← NEW
246:export interface NormalizedWord
```

### `src/lib/srs.ts`
```
6:export interface Card
23:export interface CardProgress
50:export type SrsRating = 1 | 2 | 3 | 4
55:export function calculateFSRSReview
99:export function isMastered(progress)
106:export function createInitialProgress(cardId)
124:export function resetFSRSCard(progress)
157:export function sm2ToFsrs(sm2)
173:export function mapIntensityToRetention(intensity)
182:export type StudyChallengeType = 'cloze' | 'listen' | 'recognition'  ← NEW
184:export interface IntervalPreview                            ← NEW
204:export function mapTestResultToRating                       ← NEW
214:export function computeIntervalPreviews                     ← NEW
228:export function mapSrsRecordToCardProgress
243:export interface SrsLevelConfig                            ← NEW
256:export function getSrsLevelConfig(stability)                ← NEW
```

### `src/lib/challenge-logic.ts` — SHARED (extracted from hooks)
```
11:export type QuadrantType
19:export interface ChallengeCard
29:export interface ReviewChallenge
43:export function selectQuadrant(card)
```

### `src/lib/streak.ts`
```
15:export interface StreakData
38:export function loadStreak()
46:export function saveStreak(data)
52:export async function fetchStreakFromSupabase(userId)
76:export function recordStudy()
111:export async function getStreakDisplayAsync(userId?)
122:export function getStreakDisplay()
```

### `src/lib/import-parser.ts`
```
69:export function parseCSV(file)
100:export function parseGoogleSheetsUrl(url)
171:export function normalizeRow(raw)
215:export function validateRow(normalized)
235:export function resolveTopics(...)
273:export async function parseFile(file)
287:export async function parseSheetsUrl(url)
301:export function processRows(...)
333:export function resolveUnmatchedTopics(...)
```

### `src/lib/tag-engine.ts` — NEW TAG_META, auto-tagging
```
12:export const TAG_META: Record<string, { label, color }>
231:export function autoTag(word, definition)
249:export function suggestTopicFromTags(tags)
267:export function getTagColor(tag)
271:export function getTagLabel(tag)
```

### `src/lib/storage/` — Supabase data layer
**auth.ts**
```
6:export async function updateUserSettings(userId, settings)
26:export async function recordStreak(userId)
98:export async function fetchDashboardStats(userId)
```
**mastery.ts**
```
4:export async function getMasteryStats(userId)
20:export async function getUserVocabulary(...)
66:export async function fetchTopicWordCounts()
79:export function mapWordToCard(word, topicSlug?)
93:export async function fetchWords(topicSlug?)
```
**roadmap.ts**
```
4:export async function fetchInitialAppData(userId)
53:export async function fetchProgressPageData(userId)
72:export async function fetchLibraryPageData(userId?)
80:export async function fetchRoadmaps()
90:export async function fetchTopicsByRoadmap(roadmapSlug)
99:export async function fetchAllTopics()
105:export async function fetchRoadmapStats(roadmapId, userId?)
125:export async function fetchTopicCompletionMap(...)
150:export async function fetchDashboardSummary(userId)
```
**session.ts**
```
6:export async function fetchSrsStates(userId)
36:export async function upsertSrsRecord(...)
112:export async function fetchReviewWords(userId)
154:export async function saveResumePointer(userId, roadmapId, topicId?)
164:export async function fetchResumePointers(userId)
173:export async function resetTopicProgress(topicId)
178:export function getTodayBoundary()
187:export async function upsertFreeStudyFail(userId, wordId)
```
**notebook.ts** ← NEW
```
3:export interface NotebookEntry
12:export async function fetchNotebookEntries(userId)
25:export async function toggleNotebookEntry(userId, wordId)
59:export async function updateNotebookNote(userId, wordId, note)
```

### `src/lib/admin-queries.ts` — Admin CRUD (expanded)
```
6:getAllWords(topicFilter?, search?)
60:createWord(...)
79:updateWord(...)
90:updateWordTags(id, tags)
94:deleteWord(id)
98:deleteWords(ids)
106:bulkAddWordsToTopic(wordIds, topicId)
121:getWordTopicIds(wordId)            ← NEW
127:getWordChoices(wordId)             ← NEW
135:createWordChoices(choices)         ← NEW
139:deleteWordChoices(wordId)         ← NEW
145:getRoadmapById(id)                 ← NEW
150:getTopicsByRoadmap(roadmapId)      ← NEW
159:getWordsWithTopicsByRoadmap(rid)   ← NEW
201:assignWordsToTopic(wordIds, topicId)
213:unassignWordsFromTopic(wordIds, topicId)
224:getTopicWordCounts(roadmapId)      ← NEW
244:getAllTopics()
251:createTopic(topic)
255:updateTopic(id, topic)
259:deleteTopic(id)
263:reorderTopics(updates)             ← NEW
273:getAllRoadmaps()
277:createRoadmap(roadmap)
281:updateRoadmap(id, roadmap)
285:deleteRoadmap(id)
290:getAllUsers()                      ← NEW
294:getUserSrsRecords(userId)          ← NEW
303:getAdminStats()                    ← NEW
322:getRecentWords(limit=5)            ← NEW
364:findDuplicateWords(words)          ← NEW
383:markDuplicates(rows, duplicates)   ← NEW
396:getTopicNameMap()                  ← NEW
418:batchInsertWords(rows)             ← NEW
496:updateWordFromImport(...)          ← NEW
545:getAllTags()                       ← NEW
```

### `src/hooks/`
```
useFlashcard.ts:17:export function useFlashcard()
useReviewSession.ts:11:export function useReviewSession()
useReviewSession.ts:9:export type { ReviewChallenge, QuadrantType }
useFreeStudySession.ts:8:export function useFreeStudySession(deckId, wordsOverride?)
useNotebook.ts:5:export function useNotebook()         ← NEW
useStudySessionMode.ts:29:export function useStudySessionMode({ phase }) ← NEW
useStudySessionMode.ts:16:export type StudyPhase = 'FLIPPED' | 'READY_FOR_QUIZ' | 'CHALLENGING' | 'RATING'
admin/useAdminRoadmaps.ts:10:export function useAdminRoadmaps()
admin/useAdminTopics.ts:11:export function useAdminTopics()
admin/useAdminWords.ts:16:export function useAdminWords()
```

### `src/components/review/` — 5 Challenge Types
ArenaShell, ChallengeManager, RecognitionChallenge, ConstructionChallenge,
ContextGapChallenge, GhostRecallChallenge, SessionSummary, ConfirmExitModal

### `src/pages/` — Route → Component mapping
```
/ → Home | /landing → LandingPage | /login → LoginPage
/dashboard → DashboardPage | /library → LibraryPage | /library/:slug → RoadmapTopicsPage
/study/:roadmapId/:topicId → StudyPage | /review → ReviewPage
/free-study → FreeStudyPage | /progress → ProgressPage
/settings → SettingsPage | /methodology → MethodologyPage
/mastery → MasteryPage
/admin → AdminDashboardPage | /admin/roadmaps → AdminRoadmapsPage
/admin/roadmaps/:id/setup → RoadmapSetupPage | /admin/topics → AdminTopicsPage
/admin/words → AdminWordsPage | /admin/users → AdminUsersPage
```

## Key Design Patterns

| Pattern | Location | Note |
|---------|----------|------|
| Shared challenge logic | `challenge-logic.ts` | Extracted from both hooks |
| Unified health RPC | `storage/roadmap.ts` | `get_initial_app_data` = stats + health + roadmap |
| Streak dual-source | `streak.ts` | localStorage fallback + Supabase |
| Admin vs User data | `admin-queries.ts` vs `storage/` | Separate paths |
| Notebook tracking | `storage/notebook.ts` + `useNotebook` | NEW |
| Tag engine | `tag-engine.ts` | Rule-based auto-tagging with TAG_META |
| TTS | `tts.ts` | Web Speech API wrapper |
| Admin hooks | `hooks/admin/` | useAdminRoadmaps, useAdminTopics, useAdminWords |
| WordChoice model | `types.ts` + `admin-queries.ts` | Distractor choices for challenges |

## RPC Endpoints (Supabase)

| RPC | Returns |
|-----|---------|
| `get_initial_app_data` | profile, stats, health (retention, stability, forecast) |
| `get_progress_page_data` | memory_health, roadmap_progress, overall_stats |
| `get_topic_completion_map` | { topicId: { total, learned, percent } } |
| `upsert_srs_record` | review save |
| `upsert_free_study_fail` | free study fail tracking |

**Last generated: 2026-04-20**