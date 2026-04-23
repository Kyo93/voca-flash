---
title: "Data Flow"
description: "End-to-end data flow diagrams and integration points for VocaFlash"
keywords: "voca-flash, data flow, fsrs, supabase, srs, review, study"
robots: "index, follow"
---

# Data Flow

> **Quick Reference**
> - **Pattern**: Request-Response + Client-side SRS computation
> - **Protocol**: Supabase JS SDK (REST + PostgREST + WebSocket for auth)
> - **Serialization**: JSON
> - **Key Flows**: App Init → Study → Review → Import

See also: [Architecture](./architecture.md) · [Database](./database.md)

## App Initialization Flow

On every login, a single RPC call (`fetch_initial_app_data`) fetches everything the app needs in one round-trip. This "mega-RPC" pattern eliminates waterfall requests.

```mermaid
sequenceDiagram
    participant B as Browser
    participant AC as AuthContext
    participant SB as Supabase Auth
    participant RPC as RPC: fetch_initial_app_data
    participant DB as PostgreSQL

    B->>SB: getSession()
    SB-->>B: session (JWT)
    B->>AC: loadInitialUserData(session)
    AC->>RPC: fetch_initial_app_data(user_id)
    RPC->>DB: SELECT profile + stats + roadmap (single query)
    DB-->>RPC: InitialAppData
    RPC-->>AC: { profile, stats, health, active_roadmap, global_review_count }
    AC->>B: setProfile + setInitialData + setActiveRoadmap
    Note over B: App is ready, all widgets hydrated
```

1. Supabase `getSession()` returns cached JWT — no network round-trip if valid
2. `fetchInitialAppData` calls the `fetch_initial_app_data` RPC — **1 request total**
3. `AuthContext` distributes the result to all consumers via React Context

## Study Session Flow

```mermaid
sequenceDiagram
    participant U as User
    participant SP as StudyPage
    participant UF as useFlashcard
    participant FSRS as srs.ts
    participant DB as Supabase

    U->>SP: Navigate to /study
    SP->>DB: Fetch topic words + user SRS records
    DB-->>SP: words[] + srsRecords[]
    SP->>UF: initialize(words, records)
    UF-->>SP: currentCard (first new/due word)

    loop For each card
        SP->>U: Show word (front)
        U->>SP: Tap to flip
        SP->>U: Show definition + image + example (back)
        U->>SP: Rate: Again / Hard / Good / Easy
        SP->>UF: submitRating(rating)
        UF->>FSRS: calculateFSRSReview(progress, rating)
        FSRS-->>UF: newProgress { stability, scheduledDays, nextReviewAt }
        UF->>DB: upsert_srs_record(wordId, newProgress)
        DB-->>UF: updated record
        UF-->>SP: advance to next card
    end

    SP->>U: StudyComplete screen (summary)
```

Key files:
- `useFlashcard.ts` orchestrates the session
- `srs.ts:calculateFSRSReview` computes new scheduling
- Ratings map to FSRS ratings 1–4: Again=1, Hard=2, Good=3, Easy=4 (`src/lib/constants.ts:21`)

## Review Arena Flow

The Review Arena differs from Study: it presents **typed challenges** (not simple flip cards) based on the word's current memory stability.

```mermaid
graph TB
    Start["User opens /review"] --> Fetch["Fetch due words\n(global_review_count)"]
    Fetch --> Loop["For each word"]
    Loop --> Quadrant["selectQuadrant\n(stability, hasExample, hasChoices)"]

    Quadrant --> Q1["stability < 3d\n→ construction / recognition"]
    Quadrant --> Q2["stability 3–14d\n→ construction / phonetics / context_gap"]
    Quadrant --> Q3["stability >= 14d\n→ ghost_recall / usage_master"]

    Q1 --> Challenge["Render Challenge Component"]
    Q2 --> Challenge
    Q3 --> Challenge

    Challenge --> Answer["User Answers"]
    Answer --> Score["Compute SRS Rating\n(correct + response time)"]
    Score --> Update["upsert SRS record\n+ update streak"]
    Update --> Loop
    Loop --> Summary["SessionSummary screen"]
```

The quadrant selection logic is in `src/lib/challenge-logic.ts` (`selectQuadrant` function). Challenge types:

| Quadrant | Component | Mechanic |
|----------|-----------|---------|
| `recognition` | `RecognitionChallenge` | Multiple-choice definition |
| `context_gap` | `ContextGapChallenge` | Fill-in-the-blank in example sentence |
| `construction` | `ConstructionChallenge` | Drag-to-reorder jumbled sentence |
| `ghost_recall` | `GhostRecallChallenge` | Write the word from memory |

## Word Import Flow

Admins can bulk-import words via CSV.

```mermaid
sequenceDiagram
    participant A as Admin
    participant IP as ImportWordsModal
    participant PP as import-parser.ts
    participant IU as import-utils.ts
    participant RPC as batch_insert_words RPC
    participant DB as PostgreSQL

    A->>IP: Upload CSV file
    IP->>PP: parseCSV(file)
    PP-->>IP: rawRows[]
    IP->>IU: normalizeRows(rawRows, topics)
    IU-->>IP: NormalizedWord[] (with status: new/duplicate/invalid)
    IP->>RPC: findDuplicateWords(wordList)
    RPC-->>IP: duplicateWords[]
    IP->>A: Show ImportPreviewTable (review before insert)
    A->>IP: Confirm import
    IP->>RPC: batchInsertWords(rows, chunkSize=50)
    RPC->>DB: INSERT words + topic_words + word_choices
    DB-->>RPC: { inserted, errors }
    RPC-->>IP: BatchInsertResult
    IP->>A: Show ImportResultSummary
```

Words are inserted in chunks of 50 (`IMPORT_CHUNK_SIZE`, `src/lib/constants.ts:47`) to avoid RPC timeouts.

## SRS Rating → Memory State Transition

```mermaid
graph LR
    New["New\n(state=0)"] -- "Any rating" --> Learning["Learning\n(state=1)"]
    Learning -- "Good/Easy" --> Review["Review\n(state=2)"]
    Learning -- "Again" --> Learning
    Review -- "Good/Easy" --> Review
    Review -- "Hard" --> Review
    Review -- "Again" --> Relearning["Relearning\n(state=3)"]
    Relearning -- "Good/Easy" --> Review
    Relearning -- "Again" --> Relearning
```

The `mastered` flag is set when `stability ≥ 21 days AND state ≠ Relearning` (`src/lib/srs.ts:195`).

## External Integrations

| Service | Protocol | Direction | Data | Purpose |
|---------|----------|-----------|------|---------|
| Supabase Auth | REST/WebSocket | Bidirectional | JWT tokens | User authentication |
| Supabase DB | PostgREST | Bidirectional | JSON rows | All app data |
| Web Speech API | Browser API | Outbound | Audio | Text-to-Speech pronunciation |
| Image CDN (Unsplash/Google) | HTTPS | Inbound | Images | Word illustrations |

## i18n Data Flow

Language preference is stored in `user_profiles.app_language`. On profile load, `AuthContext` syncs the i18n library and `localStorage` (`src/contexts/AuthContext.tsx:193`).

```mermaid
graph LR
    Profile["user_profiles\n.app_language = 'vi'"] --> AuthCtx["AuthContext\ni18n.changeLanguage('vi')"]
    AuthCtx --> LocalStorage["localStorage\n(LNG_STORAGE_KEY)"]
    AuthCtx --> i18n["react-i18next\nAll UI strings in Vietnamese"]
```

Supported languages: `en` (English), `vi` (Vietnamese). Source of truth: `src/i18n/vi.json`.
