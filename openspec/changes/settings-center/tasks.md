# Implementation Checklist — Settings & Profile Mastery

## Phase 7A: Settings Foundation
- [x] 1.1 Create `supabase/migrations/007_user_settings.sql`
- [x] 1.2 Update `UserProfile` interface in `types.ts`
- [x] 1.3 Create `settings-defaults.ts`
- [x] 1.4 Add `updateUserSettings()` to `supabase-storage.ts`
- [x] 1.5 Add `resetTopicProgress(topicId)` to `supabase-storage.ts`
- [x] 2.1 Merge `speech.ts` logic into `tts.ts`
- [x] 2.2 Add `setTtsConfig()` to `tts.ts`
- [x] 2.5 Delete `speech.ts`
- [x] 3.1 Create `SettingsPage.tsx`
- [x] 3.8 Wire save logic
- [x] 4.1 `useFlashcard.ts` — apply `profile.srs_intensity`
- [x] 4.3 `DashboardPage.tsx` — dynamic `profile.daily_target`
- [x] 4.5 `StudyPage.tsx` — respect `auto_play_audio`
- [x] 5.1 Build topic selector modal for reset
- [x] 5.3 Call `resetTopicProgress(topicId)` on confirm

## Phase 7B: Polish & Advanced
- [x] 7.1 Update `UserProfile` type with `last_study_date`, `display_name`, `avatar_url`
- [x] 7.2 Settings: Add `display_name` and `avatar_url` text inputs
- [x] 7.3 Settings: Implement Live Preview for avatar link
- [x] 7.4 Save: Ensure name/avatar persist to Supabase
- [x] 8.1 Create `WelcomeReminder.tsx` (Zen design)
- [x] 8.2 Logic: Show banner if `last_study_date !== today`
- [x] 8.3 Location: Dashboard top with dismiss logic
- [x] 9.1 CSS: Define root variables for Light/Dark mode in `index.css`
- [x] 9.2 JS: Apply `.dark` class in `AuthContext` based on user preference
- [x] 9.3 Sidebar: Display user avatar image if available
