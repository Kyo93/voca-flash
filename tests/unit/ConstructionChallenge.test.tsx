import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ConstructionChallenge from '../../src/components/review/ConstructionChallenge'
import { Word } from '../../src/lib/types'
import { CONSTRUCTION_CHALLENGE_DEFAULTS } from '../../src/lib/constants'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('ConstructionChallenge', () => {
  const mockWord: Word = {
    id: '1',
    word: 'CAT',
    definition: 'Con mèo',
    phonetic: '/kæt/',
    pos: 'noun',
    difficulty: 3,
    example: null,
    example_vi: null,
    image_url: null,
    image_position: null,
    created_at: '',
    updated_at: ''
  }

  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('calls onSubmit(true) when the word is correctly constructed', async () => {
    render(<ConstructionChallenge word={mockWord} onSubmit={mockOnSubmit} />)
    
    const cBtn = screen.getByText('C')
    const aBtn = screen.getByText('A')
    const tBtn = screen.getByText('T')

    fireEvent.click(cBtn)
    fireEvent.click(aBtn)
    fireEvent.click(tBtn)

    act(() => {
      vi.advanceTimersByTime(CONSTRUCTION_CHALLENGE_DEFAULTS.SUCCESS_DELAY_MS)
    })
    
    expect(mockOnSubmit).toHaveBeenCalledWith(true)
  })

  it('calls onSubmit(false) when the word is incorrectly constructed', async () => {
    render(<ConstructionChallenge word={mockWord} onSubmit={mockOnSubmit} />)
    
    // Answering wrong: TAC
    const tBtn = screen.getByText('T')
    const aBtn = screen.getByText('A')
    const cBtn = screen.getByText('C')

    fireEvent.click(tBtn)
    fireEvent.click(aBtn)
    fireEvent.click(cBtn)

    act(() => {
      vi.advanceTimersByTime(CONSTRUCTION_CHALLENGE_DEFAULTS.FAILURE_DELAY_MS)
    })
    
    expect(mockOnSubmit).toHaveBeenCalledWith(false)
  })

  it('renders a "Give Up" button that calls onSubmit(false)', async () => {
    render(<ConstructionChallenge word={mockWord} onSubmit={mockOnSubmit} />)

    const giveUpBtn = screen.getByText('review.construction.give_up')
    fireEvent.click(giveUpBtn)
    
    expect(mockOnSubmit).toHaveBeenCalledWith(false, true)
  })
})
