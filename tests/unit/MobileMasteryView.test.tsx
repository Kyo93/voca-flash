// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MobileMasteryView, { getMobileMasteryQueues } from '../../src/components/mobile/MobileMasteryView'
import type { MasteryStats, MasteryWord } from '../../src/lib/types'
import { getMasteryWordDetail } from '../../src/lib/storage/mastery'

vi.mock('../../src/lib/storage/mastery', () => {
  return {
    getMasteryWordDetail: vi.fn(async () => ({
      word_id: 'word-1',
      pos: 'verb',
      difficulty: 4,
      example_vi: 'Câu này neo ký ức lại.',
      image_position: 'top',
      synonyms: ['steady'],
      antonyms: ['loosen'],
      word_family: ['anchor', 'anchored'],
      tags: ['memory'],
    })),
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      const labels: Record<string, string> = {
        'mastery.mobile.title': 'Notebook',
        'mastery.mobile.subtitle': `${values?.count ?? 0} saved learning traces`,
        'mastery.mobile.summaryInbox': `${values?.due ?? 0} due · ${values?.total ?? 0} words`,
        'mastery.mobile.searchPlaceholder': 'Search words',
        'mastery.mobile.archiveSummary': `${values?.total ?? 0} words · ${values?.due ?? 0} due · ${values?.weak ?? 0} weak`,
        'mastery.mobile.archiveResults': `${values?.count ?? 0} results`,
        'mastery.mobile.selectionOn': 'Select',
        'mastery.mobile.selectionDone': 'Done',
        'mastery.mobile.openNotebook': 'Open notebook',
        'mastery.mobile.modes.inbox': 'Inbox',
        'mastery.mobile.modes.archive': 'Archive',
        'mastery.mobile.queues.due': 'Due now',
        'mastery.mobile.queues.weak': 'Weak words',
        'mastery.mobile.queues.saved': 'Saved words',
        'mastery.mobile.emptyQueue.due': 'No due words',
        'mastery.mobile.emptyQueue.weak': 'No weak words',
        'mastery.mobile.emptyQueue.saved': 'No saved words',
        'mastery.mobile.queueActions.study': 'Study queue',
        'mastery.mobile.queueActions.viewAll': 'View all',
        'mastery.mobile.selectedCount': `${values?.count ?? 0} selected`,
        'mastery.mobile.studySelected': 'Study selected',
        'mastery.mobile.strength': 'Strength',
        'mastery.mobile.reps': `${values?.count ?? 0} reps`,
        'mastery.mobile.lapses': `${values?.count ?? 0} lapses`,
        'mastery.mobile.nextReview': 'Next review',
        'mastery.mobile.dueNow': 'Due now',
        'mastery.mobile.noReview': 'No review date',
        'mastery.mobile.detailTitle': 'Word detail',
        'mastery.mobile.dossier.tabs.overview': 'Overview',
        'mastery.mobile.dossier.tabs.linguistic': 'Language',
        'mastery.mobile.dossier.tabs.notes': 'Notes',
        'mastery.mobile.dossier.tabs.stats': 'Stats',
        'mastery.mobile.dossier.exampleVi': 'Vietnamese example',
        'mastery.mobile.dossier.wordFamily': 'Word family',
        'mastery.mobile.dossier.synonyms': 'Synonyms',
        'mastery.mobile.dossier.antonyms': 'Antonyms',
        'mastery.mobile.dossier.noLinguisticData': 'No language data',
        'mastery.mobile.dossier.partOfSpeech': 'Part of speech',
        'mastery.mobile.dossier.difficulty': 'Difficulty',
        'mastery.mobile.filtersLabel': 'Filters',
        'mastery.mobile.editNote': 'Edit note',
        'mastery.mobile.saveNote': 'Save note',
        'mastery.mobile.cancelNote': 'Cancel',
        'mastery.mobile.notePlaceholder': 'Write a memory cue',
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
        'mastery.filters.allRoadmaps': 'All roadmaps',
        'mastery.filters.allStability': 'All stability',
        'mastery.filters.stability.learning': 'Learning stability',
        'mastery.filters.sortBy': 'Sort by',
        'mastery.filters.sort.date': 'Recent',
        'mastery.filters.sort.alphabetical': 'Alphabetical',
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

const roadmaps = [
  { id: 'roadmap-1', name: 'Academic Core' },
  { id: 'roadmap-2', name: 'Travel English' },
]

function renderMobileMastery(overrides: Partial<React.ComponentProps<typeof MobileMasteryView>> = {}) {
  const props: React.ComponentProps<typeof MobileMasteryView> & Record<string, unknown> = {
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
    onStartWordSetStudy: vi.fn(),
    notebookCount: 2,
    onOpenNotebook: vi.fn(),
    isNotebookSaved: (wordId) => wordId === 'word-1',
    onToggleNotebook: vi.fn(async () => {}),
    getNote: (wordId) => wordId === 'word-1' ? 'Remember with a boat anchor.' : null,
    onSaveNote: vi.fn(async () => {}),
    roadmaps,
    advancedFilters: {
      roadmapId: null,
      stability: null,
      abcLetter: null,
      sortBy: 'date',
    },
    onAdvancedFilterChange: vi.fn(),
    lastElementRef: vi.fn(),
    ...overrides,
  }

  return {
    props,
    ...render(<MobileMasteryView {...props} />),
  }
}

describe('MobileMasteryView', () => {
  it('groups mobile mastery words into due, weak, and saved queues', () => {
    const dueWeak = {
      ...words[0],
      word_id: 'due-weak',
      word: 'fragile',
      fsrs_stability: 2,
      fsrs_lapses: 2,
      next_review_at: '2026-06-01T00:00:00.000Z',
      mastered: false,
    }
    const weakOnly = {
      ...words[0],
      word_id: 'weak-only',
      word: 'uneven',
      fsrs_stability: 4,
      fsrs_lapses: 0,
      next_review_at: '2099-06-01T00:00:00.000Z',
      mastered: false,
    }
    const savedOnly = {
      ...words[1],
      word_id: 'saved-only',
      word: 'keystone',
      fsrs_stability: 18,
      fsrs_lapses: 0,
      next_review_at: '2099-06-01T00:00:00.000Z',
      mastered: true,
    }

    const queues = getMobileMasteryQueues(
      [savedOnly, weakOnly, dueWeak],
      (wordId) => wordId === 'saved-only' || wordId === 'due-weak',
      new Date('2026-06-30T00:00:00.000Z'),
    )

    expect(queues.due.map(word => word.word_id)).toEqual(['due-weak'])
    expect(queues.weak.map(word => word.word_id)).toEqual(['due-weak', 'weak-only'])
    expect(queues.saved.map(word => word.word_id)).toEqual(['saved-only', 'due-weak'])

    const emptyQueues = getMobileMasteryQueues([], () => false, new Date('2026-06-30T00:00:00.000Z'))
    expect(emptyQueues).toEqual({ due: [], weak: [], saved: [] })
  })

  it('renders a compact mobile notebook feed instead of the desktop table', () => {
    const { container } = renderMobileMastery()

    expect(container.querySelector('[data-mobile-mastery]')).toBeTruthy()
    expect(container.querySelector('table')).toBeNull()
    expect(screen.getByText('Notebook')).toBeTruthy()
    expect(screen.queryByText('mastery.filters.lexicalArchive')).toBeNull()
    expect(screen.queryByText(/LEXICAL ARCHIVE/i)).toBeNull()
    expect(screen.getByText('4 due · 25 words')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Inbox' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Archive' }).getAttribute('aria-pressed')).toBe('false')
    expect(container.querySelector('[data-mobile-mastery-inbox]')).toBeTruthy()
  })

  it('renders actionable inbox queues with preview words and empty states', () => {
    const { container, props } = renderMobileMastery({
      words: [
        words[0],
        words[1],
        {
          ...words[1],
          word_id: 'word-3',
          word: 'wobble',
          definition: 'to move unevenly',
          fsrs_stability: 3,
          mastered: false,
          next_review_at: '2099-05-24T00:00:00.000Z',
        },
      ],
      isNotebookSaved: (wordId) => wordId === 'word-2',
    })

    const dueQueue = container.querySelector('[data-mobile-mastery-queue="due"]') as HTMLElement
    const weakQueue = container.querySelector('[data-mobile-mastery-queue="weak"]') as HTMLElement
    const savedQueue = container.querySelector('[data-mobile-mastery-queue="saved"]') as HTMLElement

    expect(within(dueQueue).getByText('Due now')).toBeTruthy()
    expect(within(dueQueue).getByText('anchor')).toBeTruthy()
    expect(within(weakQueue).getByText('Weak words')).toBeTruthy()
    expect(within(weakQueue).getByText('wobble')).toBeTruthy()
    expect(within(savedQueue).getByText('Saved words')).toBeTruthy()
    expect(within(savedQueue).getByText('thesis')).toBeTruthy()

    fireEvent.click(within(dueQueue).getByRole('button', { name: 'Study queue' }))
    expect(props.onStartWordSetStudy).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ word_id: 'word-1' }),
    ]))

    fireEvent.click(within(dueQueue).getByRole('button', { name: 'View all' }))
    expect(props.setActiveFilter).toHaveBeenCalledWith('due')
    expect(screen.getByRole('button', { name: 'Archive' }).getAttribute('aria-pressed')).toBe('true')

    const { container: emptyContainer } = renderMobileMastery({
      words: [],
      stats: { ...stats, due: 0, weak: 0 },
      totalCount: 0,
      isNotebookSaved: () => false,
    })

    expect(within(emptyContainer.querySelector('[data-mobile-mastery-queue="due"]') as HTMLElement).getByText('No due words')).toBeTruthy()
    expect(within(emptyContainer.querySelector('[data-mobile-mastery-queue="weak"]') as HTMLElement).getByText('No weak words')).toBeTruthy()
    expect(within(emptyContainer.querySelector('[data-mobile-mastery-queue="saved"]') as HTMLElement).getByText('No saved words')).toBeTruthy()
  })

  it('keeps archive search and advanced filters behind the Archive mode', () => {
    const { props } = renderMobileMastery()

    expect(screen.queryByPlaceholderText('Search words')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    fireEvent.change(screen.getByPlaceholderText('Search words'), { target: { value: 'anchor' } })
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('All roadmaps'), { target: { value: 'roadmap-1' } })

    expect(props.setSearchQuery).toHaveBeenCalledWith('anchor')
    expect(props.onAdvancedFilterChange).toHaveBeenCalledWith({ roadmapId: 'roadmap-1' })
  })

  it('renders Archive as a compact lookup shelf with opt-in selection', () => {
    const { props, container } = renderMobileMastery()
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    const card = container.querySelector('[data-mobile-mastery-card="word-1"]') as HTMLElement
    const row = container.querySelector('[data-mobile-mastery-row="word-1"]') as HTMLElement

    expect(card).toBeTruthy()
    expect(row).toBeTruthy()
    expect(screen.queryByLabelText('Vocabulary stats')).toBeNull()
    expect(screen.getByText('25 words · 4 due · 3 weak')).toBeTruthy()
    expect(screen.getByText('2 results')).toBeTruthy()
    expect(row.className).toContain('py-2')
    expect(row.className).not.toContain('p-4')
    expect(within(row).queryByRole('checkbox', { name: /anchor/ })).toBeNull()
    expect(within(card).getByText('anchor')).toBeTruthy()
    expect(within(card).getByText('/ˈæŋ.kər/')).toBeTruthy()
    expect(within(card).getByText('to make something steady')).toBeTruthy()
    expect(within(card).getByText('Academic Basics')).toBeTruthy()
    expect(within(card).getByText('Due now')).toBeTruthy()
    expect(within(card).getByRole('button', { name: /notebook/i })).toBeTruthy()
    expect(within(card).getByRole('button', { name: /notebook/i }).className).toContain('h-11')

    fireEvent.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy()
    expect(within(card).getByRole('checkbox', { name: /anchor/ })).toBeTruthy()
    fireEvent.click(row)
    expect(props.onToggleSelect).toHaveBeenCalled()
  })

  it('opens a bottom detail sheet from a word card', () => {
    const { container } = renderMobileMastery()

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    fireEvent.click(screen.getByText('anchor'))

    const sheet = container.querySelector('[data-mobile-mastery-detail="word-1"]') as HTMLElement
    expect(sheet).toBeTruthy()
    expect(within(sheet).getByText('Word detail')).toBeTruthy()
    expect(within(sheet).getByText('This phrase anchors the memory.')).toBeTruthy()
    expect(within(sheet).getByText('7 reps')).toBeTruthy()
    fireEvent.click(within(sheet).getByRole('button', { name: 'Notes' }))
    expect(within(sheet).getByText('Remember with a boat anchor.')).toBeTruthy()
  })

  it('loads rich detail once and renders the Dossier overview tab', async () => {
    vi.mocked(getMasteryWordDetail).mockClear()
    const { container } = renderMobileMastery()

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    fireEvent.click(screen.getByText('anchor'))

    await waitFor(() => expect(getMasteryWordDetail).toHaveBeenCalledWith('word-1'))
    expect(getMasteryWordDetail).toHaveBeenCalledTimes(1)

    const dossier = container.querySelector('[data-mobile-word-dossier="word-1"]') as HTMLElement
    expect(dossier).toBeTruthy()
    expect(within(dossier).getByRole('button', { name: 'Overview' }).getAttribute('aria-pressed')).toBe('true')
    expect(within(dossier).getByText('Vietnamese example')).toBeTruthy()
    expect(within(dossier).getByText('Câu này neo ký ức lại.')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getByText('anchor'))

    await waitFor(() => expect(container.querySelector('[data-mobile-word-dossier="word-1"]')).toBeTruthy())
    expect(getMasteryWordDetail).toHaveBeenCalledTimes(1)
  })

  it('renders Dossier linguistic, notes, and stats tabs', async () => {
    const { container, props } = renderMobileMastery()

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    fireEvent.click(screen.getByText('anchor'))

    const dossier = container.querySelector('[data-mobile-word-dossier="word-1"]') as HTMLElement
    await waitFor(() => expect(getMasteryWordDetail).toHaveBeenCalledWith('word-1'))

    fireEvent.click(within(dossier).getByRole('button', { name: 'Language' }))
    await waitFor(() => expect(within(dossier).getByText('Part of speech')).toBeTruthy())
    expect(within(dossier).getByText('verb')).toBeTruthy()
    expect(within(dossier).getByText('Word family')).toBeTruthy()
    expect(within(dossier).getByText('anchored')).toBeTruthy()
    expect(within(dossier).getByText('Synonyms')).toBeTruthy()
    expect(within(dossier).getByText('steady')).toBeTruthy()
    expect(within(dossier).getByText('Antonyms')).toBeTruthy()
    expect(within(dossier).getByText('loosen')).toBeTruthy()

    fireEvent.click(within(dossier).getByRole('button', { name: 'Notes' }))
    fireEvent.click(within(dossier).getByRole('button', { name: 'Edit note' }))
    fireEvent.change(within(dossier).getByPlaceholderText('Write a memory cue'), {
      target: { value: 'Anchor this to a boat image.' },
    })
    fireEvent.click(within(dossier).getByRole('button', { name: 'Save note' }))
    expect(props.onSaveNote).toHaveBeenCalledWith('word-1', 'Anchor this to a boat image.')

    fireEvent.click(within(dossier).getByRole('button', { name: 'Stats' }))
    expect(within(dossier).getByText('Strength')).toBeTruthy()
    expect(within(dossier).getByText('8d')).toBeTruthy()
    expect(within(dossier).getByText('Next review')).toBeTruthy()
    expect(within(dossier).getByText('Due now')).toBeTruthy()
  })

  it('lets mobile users edit and save a personal note from the word detail sheet', () => {
    const { props } = renderMobileMastery()

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    fireEvent.click(screen.getByText('anchor'))
    fireEvent.click(screen.getByRole('button', { name: 'Notes' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit note' }))
    fireEvent.change(screen.getByPlaceholderText('Write a memory cue'), {
      target: { value: 'Anchor this to a boat image.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }))

    expect(props.onSaveNote).toHaveBeenCalledWith('word-1', 'Anchor this to a boat image.')
  })

  it('exposes advanced filters and A-Z jump controls on mobile', () => {
    const { props } = renderMobileMastery()

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('All roadmaps'), { target: { value: 'roadmap-1' } })
    fireEvent.change(screen.getByLabelText('All stability'), { target: { value: 'learning' } })
    fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'alphabetical' } })
    fireEvent.click(screen.getByRole('button', { name: 'A' }))

    expect(props.onAdvancedFilterChange).toHaveBeenCalledWith({ roadmapId: 'roadmap-1' })
    expect(props.onAdvancedFilterChange).toHaveBeenCalledWith({ stability: 'learning' })
    expect(props.onAdvancedFilterChange).toHaveBeenCalledWith({ sortBy: 'alphabetical' })
    expect(props.onAdvancedFilterChange).toHaveBeenCalledWith({ abcLetter: 'A' })
  })
})
