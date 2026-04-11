/**
 * RED: Auth guard — kiểm tra user có phải admin không
 * Test viết TRƯỚC khi code
 */

import { describe, it, expect } from 'vitest'

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
}

describe('requireAdmin', () => {
  it('throws "Unauthorized" when no user logged in', async () => {
    const { requireAdmin } = await import('../auth-guard')
    // Reset mock
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

    await expect(requireAdmin(mockSupabase as any)).rejects.toThrow('Unauthorized')
  })

  it('throws "Admin only" when user is not in admin_users table', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    } as any)

    const { requireAdmin } = await import('../auth-guard')
    await expect(requireAdmin(mockSupabase as any)).rejects.toThrow('Admin only')
  })

  it('returns user when user is in admin_users table', async () => {
    const adminUser = { id: 'admin-123', email: 'admin@test.com' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: adminUser } })
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { id: 'admin-123' }, error: null }),
        }),
      }),
    } as any)

    const { requireAdmin } = await import('../auth-guard')
    const result = await requireAdmin(mockSupabase as any)
    expect(result).toEqual(adminUser)
  })
})
