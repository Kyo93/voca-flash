# 🦴 Skeleton Index: voca-flash

| Meta | Value |
|------|-------|
| Source Files | 70 |
| Language | TypeScript/TSX |
| Framework | Vite + React 19 + React Router v7 |
| SRS | FSRS (ts-fsrs) + SM-2 legacy |
| i18n | react-i18next (vi/en) |
| State | React Context + localStorage/Supabase |

## Entry Points
- `src/main.tsx` → App → React Router
- `src/App.tsx` → Route definitions
- `src/i18n.ts` → i18next init

## Directory Structure

```
src/
├── components/       # Reusable UI (AppLayout, Sidebar, Header, Heatmap...)
│   └── admin/       # AdminPanel: WordFormModal, ImportWordsModal, RoadmapFormModal, TopicFormModal
│   └── review/       # Arena challenges: ArenaShell, ChallengeManager, 5 challenge types
├── pages/           # Route pages (Dashboard, Library, Review, Study, Progress, Settings, Login, Home)
│   └── admin/       # Admin: Dashboard, Roadmaps, Topics, Words, RoadmapSetup, Users
├── contexts/        # AuthContext, RoadmapContext, SidebarContext
├── hooks/           # useFlashcard, useReviewSession, useFreeStudySession
├── lib/             # Core logic
│   ├── storage/     # supabase-storage: auth, mastery, roadmap, session
│   └── utils.ts, types.ts, srs.ts, streak.ts, tts.ts, tag-engine.ts, challenge-logic.ts
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
62:export interface UserProfile
92:export interface SrsRecord
134:export interface MasteryWord
157:export interface InitialAppData
183:export interface ProgressPageData
207:export interface LibraryPageData
227:export interface MasteryStats
243:export interface NormalizedWord
261:export interface RawRow
```

### `src/lib/srs.ts`
```
20:export interface CardProgress
47:export type SrsRating = 1 | 2 | 3 | 4
52:export function calculateFSRSReview
96:export function isMastered(progress)
103:export function createInitialProgress(cardId)
121:export function resetFSRSCard(progress)
154:export function sm2ToFsrs(sm2)
170:export function mapIntensityToRetention(intensity)
```

### `src/lib/challenge-logic.ts` — SHARED (extracted from hooks)
```
11:export type QuadrantType
19:export interface ChallengeCard
29:export interface ReviewChallenge
46:export function selectQuadrant(card): QuadrantType
73:export function selectQuadrantFreeStudy(fsrsStability, hasExample)
```

### `src/lib/streak.ts`
```
14:export interface StreakData
33:export function loadStreak(): StreakData
41:export function saveStreak(data): void
47:export async function fetchStreakFromSupabase(userId)
71:export function recordStudy(): StreakData
106:export async function getStreakDisplayAsync(userId?)
117:export function getStreakDisplay(): StreakData
```

### `src/lib/import-parser.ts`
```
172:export function slugify(name)
196:export function normalizeRow(raw)
240:export function validateRow(normalized)
260:export function resolveTopics(...)
312:export async function parseSheetsUrl(url)
327:export function processRows(...)
373:export function parseErrorToMessage(code)
```

### `src/lib/storage/` — Supabase data layer
**auth.ts** — supabase auth helpers
**mastery.ts** — `fetchUserVocabulary`, `getMasteryStats`
**roadmap.ts** — `fetchInitialAppData` (uses `get_initial_app_data` RPC), `fetchProgressPageData`, `fetchTopicCompletionMap`
**session.ts** — review session management

### `src/lib/admin-queries.ts` — Admin CRUD (not through storage)
```
6:export async function getAllWords(...)
60:export async function createWord(...)
79:export async function updateWord(...)
90:export async function updateWordTags(id, tags)
94:export async function deleteWord(id)
98:export async function deleteWords(ids)
106:export async function bulkAddWordsToTopic(wordIds, topicId)
212:export async function assignWordsToTopic(wordIds, topicId)
224:export async function unassignWordsFromTopic(wordIds, topicId)
255:export async function getAllTopics()
262:export async function createTopic(...)
266:export async function updateTopic(id, ...)
```

### `src/hooks/`
```
useFlashcard.ts:17:export function useFlashcard()
useReviewSession.ts:19:export function useReviewSession() — imports selectQuadrant from challenge-logic.ts
useFreeStudySession.ts:8:export function useFreeStudySession(deckId, wordsOverride?) — imports selectQuadrantFreeStudy
```

### `src/components/review/` — 5 Challenge Types
ArenaShell, ChallengeManager, RecognitionChallenge, ConstructionChallenge,
ContextGapChallenge, GhostRecallChallenge, ConfirmExitModal, SessionSummary

### `src/pages/` — Route → Component mapping
`/` → Home | `/login` → LoginPage | `/dashboard` → DashboardPage
`/library` → LibraryPage | `/library/:slug` → RoadmapTopicsPage
`/study/:roadmapId/:topicId` → StudyPage | `/review` → ReviewPage
`/free-study` → FreeStudyPage | `/progress` → ProgressPage
`/settings` → SettingsPage | `/methodology` → MethodologyPage
`/mastery` → MasteryPage | `/landing` → LandingPage

## Key Design Patterns

| Pattern | Location | Note |
|---------|----------|------|
| Shared challenge logic | `challenge-logic.ts` | Extracted from both hooks |
| Unified health RPC | `get_initial_app_data` | Returns stats + health + roadmap in one call |
| Streak dual-source | `streak.ts` | localStorage fallback + Supabase |
| Admin vs User data | `admin-queries.ts` vs `storage/` | Separate paths |
| Tag engine | `tag-engine.ts` | Rule-based auto-tagging |
| TTS | `tts.ts` | Web Speech API wrapper |

## Test Files (17 total)
```
tests/unit/*.test.ts     — Unit tests (vitest)
tests/srs-fsrs.test.ts   — FSRS algorithm
tests/srs-migration.test.ts — SM-2 → FSRS migration
```

**Last generated: 2026-04-16**
