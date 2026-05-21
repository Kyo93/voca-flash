# Design: Roadmap and study data performance pass

## Context & Technical Approach
The app already uses several Supabase RPCs, but hot routes still over-fetch. Study Prep loads topic words and then loads every SRS record for the user. Roadmap detail fetches all roadmaps only to locate one active roadmap. The optimization should move route-shaped reads into DB RPCs and keep frontend fallbacks for compatibility while migrations are being deployed.

## Proposed Changes
### Supabase migration
- Add route-specific RPCs:
  - `get_study_prep_data(p_user_id, p_topic_slug)` returns ordered cards split into `unlearned`, `learning`, and `mastered`.
  - `get_roadmap_detail_data(p_user_id, p_roadmap_slug)` returns one roadmap, ordered topics, stats, topic progress, and resume pointer.
- Add indexes for topic lookup, topic word ordering, reverse topic membership, SRS user/word lookup, due review, and trigram word search.

### Storage layer
- Add typed wrappers for the two new RPCs.
- Keep current fetch behavior as fallback if an RPC is unavailable.

### Hooks
- `useFlashcard.initialize()` should call `fetchStudyPrepData()` instead of loading all SRS records.
- `useRoadmapTopics()` should call `fetchRoadmapDetailData()` instead of `fetchRoadmaps()` + separate stats/progress/pointers.
- `useMasteryWords()` should avoid reloading global stats on every search/filter change.

## Verification
- Add RED tests for scoped study prep, roadmap detail RPC, performance indexes, and Mastery stats reload boundaries.
- Run focused performance tests.
- Run build and full `test:gate`.
