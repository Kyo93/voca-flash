import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useNotebook } from '../../src/hooks/useNotebook'
import * as notebookStorage from '../../src/lib/storage/notebook'

// Mock AuthContext
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } })
}))

// Mock Supabase storage
vi.mock('../../src/lib/storage/notebook', () => ({
  fetchNotebookEntries: vi.fn(),
  toggleNotebookEntry: vi.fn(),
  updateNotebookNote: vi.fn()
}))

describe('useNotebook Hook Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(notebookStorage.fetchNotebookEntries).mockResolvedValue([])
  })

  it('updates local state even if word was not previously in notebook', async () => {
    const { result } = renderHook(() => useNotebook())
    
    // Wait for initial load to finish
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.getNote('word-1')).toBe('')

    // Simulate updating a note for a word that isn't bookmarked yet
    await act(async () => {
      await result.current.updateNote('word-1', 'New Note Content')
    })

    // It should now have the note in local state
    // THIS IS WHERE IT WILL FAIL (RED)
    expect(result.current.getNote('word-1')).toBe('New Note Content')
    expect(notebookStorage.updateNotebookNote).toHaveBeenCalledWith('user-123', 'word-1', 'New Note Content')
  })
})
