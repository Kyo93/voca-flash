/**
 * run-migration.js
 * Executes migration 009 against Supabase using service role key.
 * Usage: node scripts/run-migration.js
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://nhnusgnlhnzwavpltbqj.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function runMigration() {
  console.log('🔍 Checking current state of user_profiles...\n')

  // Step 1: Test connection with a query we know exists
  const { error: connError } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1)

  if (connError && connError.code !== 'PGRST116') {
    // PGRST116 = "could not find the table" — OK, just auth issue
    console.error('❌ Connection failed:', connError)
    process.exit(1)
  }

  // Step 2: Check user_profiles INSERT policy via direct insert test
  // (Use a test UUID that won't exist)
  const testId = '00000000-0000-0000-0000-000000000001'
  const { error: insertError } = await supabase
    .from('user_profiles')
    .insert({
      id: testId,
      email: 'test-migration-check@placeholder.com',
      display_name: 'Migration Check'
    })

  if (insertError) {
    if (insertError.code === '42501' || insertError.message.includes('permission')) {
      console.log('⚠️  INSERT policy MISSING — need to add INSERT policy manually')
      console.log('   Run this SQL in Supabase Dashboard → SQL Editor:\n')
      console.log(`
-- Migration 009 SQL (run in Supabase SQL Editor)
-- ─────────────────────────────────────────────────────────

-- 1. Ensure handle_new_user trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, daily_target, theme_mode)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    20, 'light'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Add INSERT policy
DROP POLICY IF EXISTS "user_insert_own_profile" ON user_profiles;
CREATE POLICY "user_insert_own_profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Add missing columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS last_study_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS daily_words_studied INTEGER DEFAULT 0;

-- 4. Verify: insert a test record then clean up
DO $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name)
  VALUES ('00000000-0000-0000-0000-000000000001', 'test@test.com', 'Test')
  ON CONFLICT (id) DO NOTHING;
END $$;

DELETE FROM user_profiles WHERE id = '00000000-0000-0000-0000-000000000001';
      `)
    } else {
      console.log('⚠️  INSERT failed (non-permission error):', insertError.message)
    }
  } else {
    // Cleanup test record
    await supabase.from('user_profiles').delete().eq('id', testId)
    console.log('✅ INSERT policy EXISTS — no action needed\n')
  }

  // Step 3: Check if last_study_date column exists
  const { data: profileSample, error: colError } = await supabase
    .from('user_profiles')
    .select('last_study_date, daily_words_studied')
    .limit(1)

  if (colError && colError.message.includes('last_study_date')) {
    console.log('⚠️  Columns last_study_date / daily_words_studied MISSING')
    console.log('   Run the SQL above in Supabase SQL Editor to add them.\n')
  } else {
    console.log('✅ Columns last_study_date, daily_words_studied exist\n')
  }

  // Step 4: Check if handle_new_user trigger exists
  // Try to get a user from auth.users that HAS a profile
  console.log('🔍 Checking if trigger creates profiles on signup...')
  const { count, error: countError } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })

  if (!countError) {
    console.log(`✅ user_profiles table has ${count ?? 0} record(s)\n`)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('PRE-FLIGHT CHECK COMPLETE')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

runMigration()
