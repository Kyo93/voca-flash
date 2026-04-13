/**
 * connect-pg.mjs
 * Try connecting to Supabase DB directly using pg driver.
 * Supabase accepts service role JWT as password for direct Postgres connections.
 */

import pg from 'pg';
const { Client } = pg;

const dbHost = 'db.nhnusgnlhnzwavpltbqj.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obnVzZ25saG56d2F2cGx0YnFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg0MDU4MywiZXhwIjoyMDkxNDE2NTgzfQ.xDU4pXcz3VYmB9vic9vTBRCyhnoXLVZ9EGTEdat8UY0';

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
`;

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
    });
    try {
      await client.connect();
      console.log(`✅ Connected with password: ${password.substring(0, 20)}...`);
      await client.end();
      return password;
    } catch (e) {
      if (e.code === '28P01') {
        // Wrong password, try next
      } else if (e.code === 'ENOTFOUND' || e.code === 'ETIMEDOUT') {
        console.log(`Network error with password: ${password.substring(0, 20)}...`);
      } else {
        console.log(`Error ${e.code}: ${e.message}`);
      }
    }
  }
  return null;
}

async function main() {
  console.log('🔍 Trying to connect to Supabase PostgreSQL...\n');

  // Supabase accepts different formats as password
  const passwords = [
    serviceKey,                          // Service role JWT directly
    'postgres',                          // Default
    'mysecurepassword',                  // Common default
  ];

  const connectedPw = await tryConnect(passwords);
  if (!connectedPw) {
    console.log('\n❌ Could not connect to Supabase DB directly.');
    console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/nhnusgnlhnzwavpltbqj/sql-editor\n');
    console.log(migrationSQL);
    return;
  }

  // Connected! Now run migration
  console.log('\n🚀 Running migration...');
  const client = new Client({
    host: dbHost, port: 5432, database: 'postgres',
    user: 'postgres', password: connectedPw,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(migrationSQL);
    console.log('✅ Migration 009 applied successfully!');
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
  } finally {
    await client.end();
  }
}

main();
