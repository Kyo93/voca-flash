// @vitest-environment jsdom

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MobileMasteryView from '../../src/components/mobile/MobileMasteryView'
import type { MasteryStats, MasteryWord } from '../../src/lib/types'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        'mastery.mobile.title': 'Notebook',
        'mastery.mobile.subtitle': `${values?.count ?? 0} saved learning traces`,
        'mastery.mobile.searchPlaceholder': 'Search words',
        'mastery.mobile.openNotebook': 'Open notebook',
        'mastery.mobile.selectedCount': `${values?.count ?? 0} selected`,
        'mastery.mobile.studySelected': 'Study selected',
        'mastery.mobile.strength': 'Strength',
        'mastery.mobile.reps': `${values?.count ?? 0} reps`,
        'mastery.mobile.lapses': `${values?.count ?? 0} lapses`,
        'mastery.mobile.nextReview': 'Next review',
        'mastery.mobile.dueNow': 'Due now',
        'mastery.mobile.noReview': 'No review date',
        'mastery.mobile.detailTitle': 'Word detail',
        'mastery.mobile.selectWord': `Select ${values?.word ?? ''}`,
        'mastery.mobile.saveWord': `Save ${values?.word ?? ''} to notebook`,
        'mastery.mobile.unsaveWord': `Remove ${values?.word ?? ''} from notebook`,
        'mastery.mobile.note': 'Note',
        'mastery.mobile.noNote': 'No note yet',
        'mastery.mobile.example': 'Example',
        'mastery.mobile.topic': 'Topic',
        'mastery.mobile.emptyTitle': 'No words yet',
        'mastery.mobile.emptyDesc': 'Try a wider filter.',
        'mastery.filters.all': 'All',
        'mastery.filters.due': 'Due',
        'mastery.filters.weak': 'Weak',
        'mastery.filters.mastered': 'Mastered',
        'mastery.stats.learning': 'Learning',
        'mastery.stats.due': 'Due',
        'mastery.stats.weak': 'Weak',
        'mastery.stats.mastered': 'Mastered',
        'mastery.table.notebook': 'Notebook',
        'common.close': 'Close',
      }
      return labels[key] ?? key
    },
  }),
}))

const stats: MasteryStats = {
  total: 25,
  learning: 12,
  mastered: 5,
  due: 4,
  weak: 3,
  orphaned: 1,
}

const words: MasteryWord[] = [
  {
    word_id: 'word-1',
    word: 'anchor',
    definition: 'to make something steady',
    phonetic: 'ˈæŋ.kər',
    image_url: null,
    example: 'This phrase anchors the memory.',
    fsrs_stability: 8,
    fsrs_difficulty: 4,
    fsrs_state: 2,
    fsrs_reps: 7,
    fsrs_lapses: 1,
    next_review_at: '2026-05-19T00:00:00.000Z',
    last_reviewed: '2026-05-18T00:00:00.000Z',
    mastered: false,
    is_orphaned: false,
    topic_names: 'Academic Basics',
    personal_note: 'Remember with a boat anchor.',
  },
  {
    word_id: 'word-2',
    word: 'thesis',
    definition: 'a central argument',
    phonetic: null,
    image_url: null,
    example: null,
    fsrs_stability: 18,
    fsrs_difficulty: 3,
    fsrs_state: 3,
    fsrs_reps: 12,
    fsrs_lapses: 0,
    next_review_at: '2026-05-24T00:00:00.000Z',
    last_reviewed: '2026-05-18T00:00:00.000Z',
    mastered: true,
    is_orphaned: false,
    topic_names: 'Writing',
    personal_note: null,
  },
]

function renderMobileMastery(overrides: Partial<React.ComponentProps<typeof MobileMasteryView>> = {}) {
  const props: React.ComponentProps<typeof MobileMasteryView> = {
    words,
    stats,
    totalCount: 25,
    loading: false,
    loadingMore: false,
    searchQuery: '',
    setSearchQuery: vi.fn(),
    activeFilter: 'all',
    setActiveFilter: vi.fn(),
    selectedIds: new Set(['word-2']),
    onToggleSelect: vi.fn(),
    onStartFreeStudy: vi.fn(),
    notebookCount: 2,
    onOpenNotebook: vi.fn(),
    isNotebookSaved: (wordId) => wordId === 'word-1',
    onToggleNotebook: vi.fn(async () => {}),
    getNote: (wordId) => wordId === 'word-1' ? 'Remember with a boat anchor.' : null,
    onSaveNote: vi.fn(async () => {}),
    lastElementRef: vi.fn(),
    ...overrides,
  }

  return {
    props,
    ...render(<MobileMasteryView {...props} />),
  }
}

describe('MobileMasteryView', () => {
  it('renders a compact mobile notebook feed instead of the desktop table', () => {
    const { container } = renderMobileMastery()

    expect(container.querySelector('[data-mobile-mastery]')).toBeTruthy()
    expect(container.querySelector('table')).toBeNull()
    expect(screen.getByText('Notebook')).toBeTruthy()
    expect(screen.getByText('25 saved learning traces')).toBeTruthy()
    expect(screen.getByText('Learning')).toBeTruthy()
    expect(screen.getByText('12')).toBeTruthy()
    expect(screen.getAllByText('Due').length).toBeGreaterThan(0)
    expect(screen.getByText('4')).toBeTruthy()
  })

  it('shows word cards with notebook, note, selection, strength, and due information', () => {
    const { props, container } = renderMobileMastery()
    const card = container.querySelector('[data-mobile-mastery-card="word-1"]') as HTMLElement

    expect(card).toBeTruthy()
    expect(within(card).getByText('anchor')).toBeTruthy()
    expect(within(card).getByText('/ˈæŋ.kər/')).toBeTruthy()
    expect(within(card).getByText('to make something steady')).toBeTruthy()
    expect(within(card).getByText('Academic Basics')).toBeTruthy()
    expect(within(card).getByText('Due now')).toBeTruthy()
    expect(within(card).getByRole('button', { name: /notebook/i })).toBeTruthy()
    expect(within(card).getByRole('checkbox', { name: /anchor/ })).toBeTruthy()

    fireEvent.click(within(card).getByRole('checkbox', { name: /anchor/ }))
    expect(props.onToggleSelect).toHaveBeenCalled()
  })

  it('opens a bottom detail sheet from a word card', () => {
    const { container } = renderMobileMastery()

    fireEvent.click(screen.getByText('anchor'))

    const sheet = container.querySelector('[data-mobile-mastery-detail="word-1"]') as HTMLElement
    expect(sheet).toBeTruthy()
    expect(within(sheet).getByText('Word detail')).toBeTruthy()
    expect(within(sheet).getByText('This phrase anchors the memory.')).toBeTruthy()
    expect(within(sheet).getByText('Remember with a boat anchor.')).toBeTruthy()
    expect(within(sheet).getByText('7 reps')).toBeTruthy()
  })
})
