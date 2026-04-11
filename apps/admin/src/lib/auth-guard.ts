/**
 * Auth guard — kiểm tra user có phải admin không
 */

export async function requireAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!admin) throw new Error('Admin only')

  return user
}
