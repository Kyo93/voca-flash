import { supabase } from '../supabase'

/** Users */
export async function getAllUsers() {
  return supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
}

export async function getUserSrsRecords(userId: string) {
  return supabase
    .from('user_srs_records')
    .select('*, words(word, definition)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
}
