/**
 * Tries connecting to Supabase DB directly using pg.
 *
 * Required env:
 * - SUPABASE_DB_PASSWORD or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY
 */

import pg from 'pg'

const { Client } = pg

const dbHost = 'db.nhnusgnlhnzwavpltbqj.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!serviceKey && !process.env.SUPABASE_DB_PASSWORD) {
  throw new Error('Set SUPABASE_DB_PASSWORD or SUPABASE_SERVICE_ROLE_KEY before running this script.')
}

const migrationSQL = `
-- 1. Ensure handle_new_user trigger
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
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. INSERT policy
DROP POLICY IF EXISTS "user_insert_own_profile" ON user_profiles;
CREATE POLICY "user_insert_own_profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Add columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS last_study_date DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS daily_words_studied INTEGER DEFAULT 0;
`

async function tryConnect(passwords) {
  for (const password of passwords) {
    const client = new Client({
      host: dbHost,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    })

    try {
      await client.connect()
      console.log('Connected with a configured database credential.')
      await client.end()
      return password
    } catch (error) {
      if (error.code === '28P01') {
        // Wrong password, try next.
      } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        console.log('Network error with a configured database credential.')
      } else {
        console.log(`Error ${error.code}: ${error.message}`)
      }
    }
  }
  return null
}

async function main() {
  console.log('Trying to connect to Supabase PostgreSQL...\n')

  const passwords = [
    process.env.SUPABASE_DB_PASSWORD,
    serviceKey,
  ].filter(Boolean)

  const connectedPassword = await tryConnect(passwords)
  if (!connectedPassword) {
    console.log('\nCould not connect to Supabase DB directly.')
    console.log('\nPlease run this SQL in Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/nhnusgnlhnzwavpltbqj/sql-editor\n')
    console.log(migrationSQL)
    return
  }

  console.log('\nRunning migration...')
  const client = new Client({
    host: dbHost,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: connectedPassword,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    await client.query(migrationSQL)
    console.log('Migration 009 applied successfully.')
  } catch (error) {
    console.error('Migration failed:', error.message)
  } finally {
    await client.end()
  }
}

main()
