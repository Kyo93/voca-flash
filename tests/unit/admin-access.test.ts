import { beforeEach, describe, expect, it, vi } from 'vitest'

const { rpcMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    rpc: rpcMock,
  },
}))

import { resolveAdminAccess } from '../../src/contexts/AuthContext'

describe('resolveAdminAccess', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('allows admins recorded in Supabase admin_users through is_admin()', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null })

    await expect(resolveAdminAccess({ id: 'admin-id', email: 'db-admin@example.com' })).resolves.toBe(true)

    expect(rpcMock).toHaveBeenCalledWith('is_admin')
  })

  it('denies access when the admin RPC returns false', async () => {
    rpcMock.mockResolvedValue({ data: false, error: null })

    await expect(resolveAdminAccess({ id: 'user-id', email: 'student@example.com' })).resolves.toBe(false)
  })

  it('does not call Supabase without a signed-in user', async () => {
    await expect(resolveAdminAccess(null)).resolves.toBe(false)

    expect(rpcMock).not.toHaveBeenCalled()
  })
})
