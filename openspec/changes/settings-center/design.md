# Design: Settings & Profile Mastery Center

## Context & Technical Approach

VocaFlash currently has a placeholder `/settings` route. This initiative builds a comprehensive Settings Center that gives users control over their learning experience — from daily goals and SRS intensity to voice preferences and account management.

### Architecture Decision: Extend `user_profiles`, not a new table
We add settings columns directly to `user_profiles` (already has `id = user.id`, RLS, and is loaded by `AuthContext`). This avoids an extra JOIN and a new RLS policy.

### Architecture Decision: Single TTS module
The codebase has two TTS files (`speech.ts` and `tts.ts`) doing the same thing. We consolidate into `tts.ts` and re-export from `speech.ts` for backward compatibility.

### Architecture Decision: Defer Dark Mode to Phase 8
The CSS has zero dark mode infrastructure (no dark tokens, no `.dark` class, no `prefers-color-scheme`). This is a multi-day effort. We build the toggle UI (disabled state) now and implement the actual theme switching later.

### Architecture Decision: SRS intensity at hook level
`calculateNextReview` stays pure. The `srs_intensity` multiplier is applied in `useFlashcard.ts` and `useReviewSession.ts` after the function returns.

---

## Proposed Changes

### Phase 7A: Settings Foundation (~2-3 hours)

#### 1. Database Migration
- **File**: `supabase/migrations/007_user_settings.sql`
- **Columns added to `user_profiles`**:
  - `daily_target INTEGER DEFAULT 20`
  - `srs_intensity REAL DEFAULT 1.0` (0.6 = High Intensity, 1.0 = Balanced, 1.4 = Relaxed)
  - `tts_voice TEXT DEFAULT NULL` (browser voice name)
  - `tts_rate REAL DEFAULT 0.85`
  - `auto_play_audio BOOLEAN DEFAULT true`
  - `app_language TEXT DEFAULT 'vi'`
  - `theme_mode TEXT DEFAULT 'light'`
- **RLS**: Existing `user_profiles` policy already restricts to own row. New columns inherit this.

#### 2. TTS Consolidation
- **Delete**: `src/lib/speech.ts`
- **Modify**: `src/lib/tts.ts` — add `setVoicePreference()`, `setRate()`, read from a module-level config that SettingsPage can update.
- **Modify**: All files importing from `speech.ts` → import from `tts.ts`
  - `RecognitionChallenge.tsx`
  - `GhostRecallChallenge.tsx`

#### 3. Type & Storage Updates
- **Modify**: `src/lib/types.ts` — extend `UserProfile` with new fields
- **Modify**: `src/lib/supabase-storage.ts` — add `updateUserSettings()` function
- **New**: `src/lib/settings-defaults.ts` — constants for fallback values when profile hasn't loaded yet

#### 4. Settings Page UI
- **New**: `src/pages/SettingsPage.tsx` — Glassmorphism cards layout:
  - **Profile Section**: Avatar (URL input only for 7A), Display Name
  - **Learning Section**: Daily Target picker (10/20/30/50), SRS Intensity toggle (High/Balanced/Relaxed)
  - **Audio Section**: Voice dropdown (from `speechSynthesis.getVoices()` with `onvoiceschanged` listener), Speed slider, Auto-play toggle
  - **Language Section**: Vietnamese/English segmented control
  - **Danger Zone**: Reset Progress (topic picker + confirm modal), Logout button
- **Modify**: `src/i18n/vi.json` and `src/i18n/en.json` — Add translation strings for Settings UI.
- **Modify**: `src/App.tsx` — wire `/settings` route to new component

#### 5. Logic Integration
- **Modify**: `src/hooks/useFlashcard.ts` — apply `srs_intensity` multiplier to interval after `calculateNextReview`
- **Modify**: `src/hooks/useReviewSession.ts` — same intensity multiplier
- **Modify**: `src/pages/DashboardPage.tsx` — read `profile.daily_target` instead of `DAILY_GOAL = 10`
- **Modify**: `src/pages/ProgressPage.tsx` — read `profile.daily_target` instead of `DAILY_TARGET = 20`
- **Modify**: `src/lib/tts.ts` — `speak()` reads voice/rate from module config
- **Modify**: `src/pages/StudyPage.tsx` — respect `auto_play_audio` setting

#### 6. Reset Progress Feature
- **Architecture**: A client-side query fetching thousands of `word_id`s and passing them to an `.in('word_id', [...])` filter may exceed PostgREST URL length limits (as seen in previous 1000 row limit bugs). Instead, we will create a Postgres RPC function in the migration file.
- **New RPC in `007_user_settings.sql`**:
```sql
CREATE OR REPLACE FUNCTION reset_topic_progress(p_topic_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM user_srs_records
  WHERE user_id = auth.uid()
  AND word_id IN (
    SELECT word_id FROM topic_words WHERE topic_id = p_topic_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
- **New function in `supabase-storage.ts`**:
```typescript
export async function resetTopicProgress(topicId: string): Promise<void> {
  const { error } = await supabase.rpc('reset_topic_progress', { p_topic_id: topicId })
  if (error) throw error
}
```

---

### Phase 7B: Polish & Advanced Features (~2-3 hours, next session)

#### 7. Avatar URL Input
- Remove the need for Supabase Storage buckets.
- User pastes an external image URL (e.g., from Google Photos, Imgur).
- Update `user_profiles.avatar_url` with this string on save.

#### 8. Welcome Reminder Banner
- **New**: `src/components/dashboard/WelcomeReminder.tsx`
- Shows when `last_study_date !== today`
- Non-intrusive toast/banner at top of Dashboard

#### 9. Dark Mode Infrastructure (Phase 8 prep)
- Define dark color tokens in `index.css`
- Add `.dark` class toggle mechanism
- Test across all pages

---

## Data Flow

```
SettingsPage
  ├─ reads: AuthContext.profile (initial values)
  ├─ writes: supabase.user_profiles (on save)
  ├─ updates: AuthContext.profile (optimistic)
  └─ updates: tts module config (voice/rate)

DashboardPage / ProgressPage
  └─ reads: AuthContext.profile.daily_target

useFlashcard / useReviewSession
  └─ reads: AuthContext.profile.srs_intensity
  └─ applies: interval *= srs_intensity after calculateNextReview()

tts.ts (consolidated)
  └─ reads: module-level config (set by SettingsPage)
  └─ fallback: defaults from settings-defaults.ts
```

---

## Verification

### Automated
1. Change daily target to 50 → verify Dashboard/Progress show "/50"
2. Change SRS intensity to 0.6 → verify intervals are shorter
3. Change TTS voice → verify `speak()` uses the selected voice
4. Reset topic progress → verify `user_srs_records` rows deleted
5. Switch language → verify UI labels change

### Manual
1. F5 after settings change → values persist from Supabase
2. Multiple tabs → settings sync on reload
3. New user (no settings) → defaults work without crash
