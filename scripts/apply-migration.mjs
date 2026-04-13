/**
 * apply-migration.mjs
 * Executes migration 009 against Supabase using the Management API.
 * Uses the Service Role key to bypass RLS for schema changes.
 */

import { Client } from 'pg'

const supabaseUrl = 'https://nhnusgnlhnzwavpltbqj.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obnVzZ25saG56d2F2cGx0YnFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg0MDU4MywiZXhwIjoyMDkxNDE2NTgzfQ.xDU4pXcz3VYmB9vic9vTBRCyhnoXLVZ9EGTEdat8UY0'

// Supabase direct DB connection string (from project settings)
// Format: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
// We need to find the password from service role JWT or try common approaches

const migrationSQL = `
-- ═══════════════════════════════════════════════════════════
-- Migration 009: New User Onboarding Fix
-- ═══════════════════════════════════════════════════════════

-- 1. Ensure handle_new_user trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, daily_target, theme_mode)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    20,
    'light'
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

-- 3. Add columns if missing
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS last_study_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS daily_words_studied INTEGER DEFAULT 0;
`

async function main() {
  // Try using Supabase's built-in SQL runner endpoint
  // The pg endpoint format for Supabase is:
  // postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres

  // First, let's try the REST API with service role to run SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: migrationSQL })
  })

  console.log(`Status: ${response.status}`)
  const text = await response.text()
  console.log(`Response: ${text}`)

  if (!response.ok) {
    console.log('\n⚠️  REST API approach failed.')
    console.log('\n📋 MANUAL MIGRATION REQUIRED:')
    console.log('Go to: https://supabase.com/dashboard/project/nhnusgnlhnzwavpltbqj/sql-editor')
    console.log('\nPaste and run the following SQL:\n')
    console.log(migrationSQL)
  }
}

main().catch(console.error)
