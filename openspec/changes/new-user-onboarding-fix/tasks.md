# Implementation Checklist: Fix New User Onboarding

## Pre-flight: Audit all `.single()` calls in `supabase-storage.ts`

- [ ] 0.1 Run `grep -n "\.single()" src/lib/supabase-storage.ts` to list all occurrences
- [ ] 0.2 For each occurrence, determine if it should be `.single()` or `.maybeSingle()`
- [ ] 0.3 **CRITICAL:** Verify RLS policy in Supabase allows authenticated INSERT on `user_profiles`

---

## Step 1: Fix `AuthContext.tsx` — Auto-create profile on login

- [ ] 1.1 Add `ensureUserProfile(userId: string, email?: string): Promise<void>` function after `refreshProfile()`
  - Fetch existing profile with `.maybeSingle()`
  - If null → upsert default profile (`daily_target: 20`, `theme_mode: 'light'`, `streak_days: 0`)
  - Log error to console if upsert fails (non-blocking)
- [ ] 1.2 Call `ensureUserProfile()` inside `loadUserData()` after `setIsAdmin()` and before the existing profile fetch
- [ ] 1.3 Keep existing profile fetch (`.single()`) — it now succeeds because profile exists

**File:** `Voca-flash/src/contexts/AuthContext.tsx`
**Dependency:** None — standalone task

---

## Step 2: Fix `supabase-storage.ts` — Defensive query pattern

- [ ] 2.1 `fetchDashboardStats()` — line 328: change `.single()` → `.maybeSingle()`
  - Verify streakDays fallback: `?? 0`
- [ ] 2.2 `recordStreak()` — line 359: change `.single()` → `.maybeSingle()`
  - Add null profile handling: insert new profile with `streak_days: 1` if missing
- [ ] 2.3 **Audit pass:** Confirm all other `.single()` calls are safe (return values checked before use)

**File:** `Voca-flash/src/lib/supabase-storage.ts`
**Dependency:** Task 1.1 (ensureUserProfile exists — can reuse same upsert pattern)

---

## Step 3: Fix `ProgressPage.tsx` — Isolate Promise.all failures

- [ ] 3.1 Replace `Promise.all` → `Promise.allSettled` for stats queries (line 47-52)
- [ ] 3.2 Extract results with null checks: `status === 'fulfilled' ? value : fallback`
- [ ] 3.3 Keep `fetchUserVocabulary().catch(() => [])` as-is (already safe)
- [ ] 3.4 Add `??` fallbacks on all stat display values in JSX (streakDays, mastered, etc.)

**File:** `Voca-flash/src/pages/ProgressPage.tsx`
**Dependency:** Task 2 (stats functions must return safe defaults first)

---

## Step 4: Verification

- [ ] 4.1 **New user smoke test** (manual):
  - Create new Supabase Auth account
  - Login → navigate to `/progress`
  - Page must render without spinner hang
  - Display: streak=0, mastered=0, learning=0, due=0
- [ ] 4.2 **Existing user regression test** (manual):
  - Login with existing account that has profile
  - Verify stats still load correctly
  - Verify streak increments on study
- [ ] 4.3 **Console check**: No 406 Not Acceptable errors on new user login
- [ ] 4.4 **Edge case**: Login → immediately logout → login again (idempotency check)

---

## Files Modified

| File | Lines | Change Type |
|---|---|---|
| `src/contexts/AuthContext.tsx` | ~15 lines added | Feature (lazy profile creation) |
| `src/lib/supabase-storage.ts` | ~10 lines changed | Bug fix (defensive queries) |
| `src/pages/ProgressPage.tsx` | ~15 lines changed | Bug fix (isolated Promise.all) |
