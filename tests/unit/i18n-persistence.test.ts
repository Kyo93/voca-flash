import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getInitialLanguage, LNG_STORAGE_KEY } from '../../src/lib/i18n-utils'

describe('i18n Persistence Utils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('returns "vi" by default when localStorage is empty', () => {
    expect(getInitialLanguage()).toBe('vi')
  })

  it('returns "en" when localStorage has "en" saved', () => {
    localStorage.setItem(LNG_STORAGE_KEY, 'en')
    // This should fail in the RED phase because getInitialLanguage returns 'vi' hardcoded
    expect(getInitialLanguage()).toBe('en')
  })

  it('returns "vi" when localStorage has "vi" saved', () => {
    localStorage.setItem(LNG_STORAGE_KEY, 'vi')
    expect(getInitialLanguage()).toBe('vi')
  })
})
