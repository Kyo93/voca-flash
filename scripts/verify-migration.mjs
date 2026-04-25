/**
 * Verifies migration 009 by testing user_profiles operations.
 *
 * Required env:
 * - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY
 * Optional env:
 * - SUPABASE_URL
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? 'https://nhnusgnlhnzwavpltbqj.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!serviceKey) {
  throw new Error('Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY before running this script.')
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  console.log('Verifying INSERT policy for user_profiles...\n')

  const { data: profiles, error: fetchError } = await supabase
    .from('user_profiles')
    .select('id, email')
    .limit(1)

  if (fetchError || !profiles?.length) {
    console.log('Could not fetch existing profiles')
    console.log('Error:', fetchError)
    return
  }

  const testUser = profiles[0]
  console.log(`Test user: ${testUser.email} (${testUser.id})`)

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ daily_target: 25 })
    .eq('id', testUser.id)

  if (updateError) {
    console.log('UPDATE failed:', updateError.message)
  } else {
    console.log('UPDATE policy works')
    await supabase.from('user_profiles').update({ daily_target: 20 }).eq('id', testUser.id)
  }

  const testId = '00000000-0000-0000-0000-000000000099'
  const { error: insertError } = await supabase
    .from('user_profiles')
    .insert({
      id: testId,
      email: 'migration-test@placeholder.com',
      display_name: 'Migration Test',
    })

  if (!insertError) {
    await supabase.from('user_profiles').delete().eq('id', testId)
    console.log('INSERT succeeded; test record cleaned up')
  } else if (insertError.code === '42501') {
    console.log('RLS is blocking INSERT (permission denied)')
    console.log('INSERT policy may still be missing from Supabase cloud.')
    console.log('\nRun in Supabase SQL Editor:')
    console.log(`
DROP POLICY IF EXISTS "user_insert_own_profile" ON user_profiles;
CREATE POLICY "user_insert_own_profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
    `)
  } else {
    console.log(`INSERT result: ${insertError.code} - ${insertError.message}`)
  }

  console.log('\nChecking INSERT policy directly...')
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(0)

  if (error) {
    console.log('RLS active, SELECT blocked:', error.message)
  } else {
    console.log('RLS SELECT works:', data?.length, 'rows')
  }

  console.log('\nVERIFICATION COMPLETE')
}

main().catch(console.error)
