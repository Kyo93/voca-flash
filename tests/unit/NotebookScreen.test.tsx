// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { NotebookScreenContent } from '../../src/components/mastery/NotebookScreen'
import type { NotebookWordEntry } from '../../src/lib/storage/notebook'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === 'mastery.notebook.savedCount') return `saved:${params?.count ?? 0}`
      if (key === 'mastery.notebook.pageOf') return `${params?.page ?? 0} / ${params?.total ?? 0}`
      if (key === 'mastery.notebook.noteStats') return `${params?.words ?? 0} words ${params?.characters ?? 0} chars`
      return key
    },
  }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('../../src/components/common/RichNoteEditor', () => ({
  default: ({ content, onChange }: { content: string; onChange: (value: string) => void }) => (
    <textarea
      aria-label="mock-rich-editor"
      value={content}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

const notebookCss = readFileSync('src/index.css', 'utf8')

const entries: NotebookWordEntry[] = [
  {
    id: 'note-1',
    user_id: 'user-1',
    word_id: 'word-1',
    personal_note: 'My anchor note',
    created_at: '2026-04-20T00:00:00.000Z',
    updated_at: '2026-04-25T00:00:00.000Z',
      word: {
        id: 'word-1',
        word: 'anchor',
        definition: 'to make something steady',
        phonetic: '/anchor/',
        pos: 'verb',
        difficulty: 5,
        synonyms: ['steady', 'secure'],
        antonyms: ['loosen'],
        word_family: ['anchor', 'anchored', 'anchoring'],
        image_url: 'https://example.com/anchor.jpg',
        example: 'This image anchors the memory.',
        example_vi: 'Hinh anh nay giup neo tri nho.',
        created_at: '2026-04-11T00:00:00.000Z',
        updated_at: '2026-04-11T00:00:00.000Z',
    },
  },
]

function makeNotebookEntry(index: number): NotebookWordEntry {
  return {
    id: `note-${index}`,
    user_id: 'user-1',
    word_id: `word-${index}`,
    personal_note: `Note ${index}`,
    created_at: '2026-04-20T00:00:00.000Z',
    updated_at: '2026-04-25T00:00:00.000Z',
    word: {
      id: `word-${index}`,
      word: `archive-${index}`,
      definition: `definition ${index}`,
      phonetic: `/archive-${index}/`,
      pos: 'noun',
      difficulty: 2,
      synonyms: [`similar-${index}`],
      antonyms: [`opposite-${index}`],
      word_family: [`archive-${index}`, `archived-${index}`],
      image_url: null,
      example: `Archive ${index} appears in context.`,
      example_vi: `Vi du ${index}.`,
      created_at: '2026-04-11T00:00:00.000Z',
      updated_at: '2026-04-11T00:00:00.000Z',
    },
  }
}

describe('NotebookScreenContent', () => {
  it('uses the parchment paper background from the static book reference', () => {
    expect(notebookCss).toContain('--notebook-rule-baseline-shift: 12px')
    expect(notebookCss).toContain('--notebook-paper-base: #f7f3e8')
    expect(notebookCss).toContain('--notebook-paper-darker: #e3ddcc')
    expect(notebookCss).toContain('.notebook-ruled-page::before')
    expect(notebookCss).toContain('.notebook-ruled-page::after')
    expect(notebookCss).toContain("url('https://www.transparenttextures.com/patterns/stardust.png')")
    expect(notebookCss).toContain('opacity: 0.3')
    expect(notebookCss).toContain('linear-gradient(135deg')
    expect(notebookCss).toContain('rgba(255, 255, 255, 0.5) 0%')
    expect(notebookCss).toContain('rgba(0, 0, 0, 0.045) 100%')
    expect(notebookCss).toContain('rgba(96, 72, 43, 0.025) 31px')
    expect(notebookCss).toContain('repeating-linear-gradient(')
  })

  it('renders saved vocabulary with useful word details and personal notes', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="journal"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'mastery.notebook.title' })).toBeTruthy()
    expect(screen.getAllByText('anchor').length).toBeGreaterThan(0)
    expect(screen.getAllByText('/anchor/').length).toBeGreaterThan(0)
    expect(screen.getAllByText('to make something steady').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/This image anchors the memory/).length).toBeGreaterThan(0)
    expect(screen.getByText('My anchor note')).toBeTruthy()
    expect(screen.getByText('saved:1')).toBeTruthy()
  })

  it('presents saved vocabulary inside an open two-page dictionary spread', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const spread = screen.getByTestId('notebook-book-spread')
    const leftPage = screen.getByTestId('notebook-left-page')
    const rightPage = screen.getByTestId('notebook-right-page')

    expect(spread).toBeTruthy()
    expect(screen.getByTestId('notebook-book-binding')).toBeTruthy()
    expect(leftPage.textContent).toContain('anchor')
    expect(rightPage).toBeTruthy()
  })

  it('matches the supplied bright open-dictionary layout with ruled paper pages', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const backgroundImage = screen.getByTestId('notebook-background-image')
    const paperShell = screen.getByTestId('notebook-paper-shell')
    const stage = screen.getByTestId('notebook-book-stage')
    const spread = screen.getByTestId('notebook-book-spread')
    const leftPage = screen.getByTestId('notebook-left-page')
    const rightPage = screen.getByTestId('notebook-right-page')

    expect(backgroundImage.getAttribute('style')).toContain('/notebook-assets/notebook-flat-lay-desk.jpg')
    expect(backgroundImage.getAttribute('style')).not.toContain('/notebook-assets/wood-ink-desk')
    expect(paperShell.className).toContain('bg-transparent')
    expect(stage.className).toContain('max-w-[1720px]')
    expect(stage.className).toContain('h-full')
    expect(spread.className).toContain('grid-cols-2')
    expect(spread.className).toContain('h-full')
    expect(spread.className).not.toContain('h-[min(900px,calc(100vh-6rem))]')
    expect(spread.className).not.toContain('min-h-[900px]')
    expect(leftPage.className).toContain('notebook-ruled-page')
    expect(leftPage.className).toContain('notebook-baseline-page')
    expect(leftPage.getAttribute('style')).toContain('background-position-y: var(--notebook-rule-offset)')
    expect(rightPage.className).toContain('notebook-ruled-page')
    expect(rightPage.className).toContain('notebook-baseline-page')
    expect(rightPage.getAttribute('style')).toContain('background-position-y: var(--notebook-rule-offset)')
    expect(screen.getByTestId('notebook-book-binding')).toBeTruthy()
    expect(screen.getByTestId('notebook-visual-mnemonic')).toBeTruthy()
    expect(screen.getByTestId('notebook-vocabulary-detail')).toBeTruthy()
    expect(screen.getByTestId('notebook-quote-card')).toBeTruthy()
    expect(screen.getByTestId('notebook-smart-vocabulary')).toBeTruthy()
    expect(screen.getByTestId('notebook-sticky-note')).toBeTruthy()
    expect(screen.getByText('mastery.notebook.recentAdditions')).toBeTruthy()
  })

  it('keeps the book within the viewport and limits left-page vocabulary rows', () => {
    const manyEntries = Array.from({ length: 7 }, (_, index) => makeNotebookEntry(index + 1))

    render(
      <NotebookScreenContent
        isOpen
        entries={manyEntries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages={false}
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const main = screen.getByTestId('notebook-main-scroll-region')
    const focusStage = screen.getByTestId('notebook-focus-stage')
    const bookColumn = screen.getByTestId('notebook-book-column')
    const bookStage = screen.getByTestId('notebook-book-stage')
    const spread = screen.getByTestId('notebook-book-spread')
    const archiveList = screen.getByTestId('notebook-archive-list')

    expect(main.className).toContain('overflow-hidden')
    expect(main.className).toContain('py-15')
    expect(main.className).toContain('md:py-18')
    expect(main.className).not.toContain('py-0')
    expect(main.className).not.toContain('overflow-y-auto')
    expect(focusStage.className).toContain('items-stretch')
    expect(bookColumn.className).toContain('h-full')
    expect(bookColumn.className).toContain('min-h-0')
    expect(bookStage.className).toContain('h-full')
    expect(spread.className).toContain('h-full')
    expect(spread.className).not.toContain('h-[min(900px,calc(100vh-6rem))]')
    expect(archiveList.textContent).toContain('archive-1')
    expect(archiveList.textContent).toContain('archive-4')
    expect(archiveList.textContent).not.toContain('archive-5')
  })

  it('pages archive words with buttons and drag page flipping', () => {
    const manyEntries = Array.from({ length: 7 }, (_, index) => makeNotebookEntry(index + 1))

    render(
      <NotebookScreenContent
        isOpen
        entries={manyEntries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages={false}
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const spread = screen.getByTestId('notebook-book-spread')
    const archiveList = screen.getByTestId('notebook-archive-list')

    expect(spread.className).toContain('cursor-grab')
    expect(screen.getByTestId('notebook-page-flip-layer')).toBeTruthy()
    expect(screen.getAllByText('1 / 2')).toHaveLength(1)
    expect(screen.getByTestId('notebook-page-controls').className).toContain('absolute')
    expect(screen.getByTestId('notebook-page-controls').className).toContain('bottom-10')
    expect(screen.getByTestId('notebook-page-controls').className).toContain('left-10')
    expect(screen.getByTestId('notebook-current-page').textContent).toContain('1')
    expect(screen.getByTestId('notebook-current-page').textContent).toContain('2')
    expect(archiveList.textContent).toContain('archive-1')
    expect(archiveList.textContent).not.toContain('archive-5')

    fireEvent.click(screen.getByTestId('notebook-next-page'))

    expect(screen.getByTestId('notebook-current-page').textContent).toContain('2')
    expect(archiveList.textContent).toContain('archive-5')
    expect(archiveList.textContent).not.toContain('archive-1')
    expect(screen.getByTestId('notebook-headword').textContent).toContain('archive-5')

    fireEvent.pointerDown(spread, { clientX: 520, pointerId: 1 })
    fireEvent.pointerMove(spread, { clientX: 680, pointerId: 1 })
    fireEvent.pointerUp(spread, { clientX: 680, pointerId: 1 })

    expect(screen.getByTestId('notebook-current-page').textContent).toContain('1')
    expect(archiveList.textContent).toContain('archive-1')
    expect(archiveList.textContent).not.toContain('archive-5')
    expect(screen.getByTestId('notebook-headword').textContent).toContain('archive-1')
  })

  it('loads a clicked archive word into the right page instead of treating it as a page drag', () => {
    const manyEntries = Array.from({ length: 7 }, (_, index) => makeNotebookEntry(index + 1))

    render(
      <NotebookScreenContent
        isOpen
        entries={manyEntries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages={false}
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const spread = screen.getByTestId('notebook-book-spread')
    const archiveButton = screen.getByText('archive-2').closest('button')

    expect(archiveButton).toBeTruthy()
    expect(screen.getByTestId('notebook-headword').textContent).toContain('archive-1')

    fireEvent.pointerDown(archiveButton!, { clientX: 520, pointerId: 1 })
    fireEvent.pointerMove(spread, { clientX: 360, pointerId: 1 })
    fireEvent.pointerUp(spread, { clientX: 360, pointerId: 1 })

    expect(screen.getByTestId('notebook-current-page').textContent).toContain('1')

    fireEvent.click(archiveButton!)

    expect(screen.getByTestId('notebook-current-page').textContent).toContain('1')
    expect(screen.getByTestId('notebook-headword').textContent).toContain('archive-2')
    expect(screen.getByTestId('notebook-field-meaning').textContent).toContain('definition 2')
  })

  it('aligns body text to the ruled notebook lines', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const archiveList = screen.getByTestId('notebook-archive-list')
    const archiveDefinition = screen.getByTestId('notebook-archive-definition-word-1')
    const archiveExample = screen.getByTestId('notebook-archive-example-word-1')
    const headword = screen.getByTestId('notebook-headword')
    const headwordMeta = screen.getByTestId('notebook-headword-meta')
    const primaryFields = screen.getByTestId('notebook-primary-fields')
    const meaningField = screen.getByTestId('notebook-field-meaning')
    const quoteCard = screen.getByTestId('notebook-quote-card')
    const relatedWords = screen.getByTestId('notebook-related-words')

    expect(screen.getByTestId('notebook-title-line').className).toContain('notebook-on-rule-text')
    expect(archiveList.className).toContain('notebook-on-rule-text')
    expect(archiveList.className).toContain('space-y-8')
    expect(archiveList.className).not.toContain('space-y-6')
    expect(archiveDefinition.className).toContain('notebook-line-text')
    expect(archiveDefinition.className).toContain('notebook-engraved-text')
    expect(archiveDefinition.className).not.toContain('mt-1')
    expect(archiveExample.className).toContain('notebook-line-text')
    expect(archiveExample.className).toContain('notebook-engraved-text')
    expect(archiveExample.className).not.toContain('mt-1')
    expect(headword.className).toContain('notebook-engraved-text')
    expect(headwordMeta.className).toContain('notebook-line-text')
    expect(headwordMeta.className).toContain('notebook-on-rule-text')
    expect(primaryFields.className).toContain('mb-4')
    expect(primaryFields.className).toContain('space-y-4')
    expect(primaryFields.className).not.toContain('space-y-8')
    expect(primaryFields.className).not.toContain('space-y-3')
    expect(primaryFields.className).not.toContain('mb-5')
    expect(meaningField.className).toContain('notebook-on-rule-text')
    expect(meaningField.querySelector('h5')?.className).toContain('mb-0')
    expect(meaningField.querySelector('p')?.className).toContain('notebook-engraved-text')
    expect(quoteCard.className).toContain('notebook-on-rule-text')
    expect(quoteCard.className).toContain('py-0')
    expect(quoteCard.className.split(/\s+/)).not.toContain('p-3')
    expect(quoteCard.querySelector('p')?.className).toContain('notebook-engraved-text')
    expect(relatedWords.className).toContain('notebook-on-rule-text')
    expect(relatedWords.className).toContain('space-y-4')
    expect(relatedWords.className).not.toContain('space-y-8')
    expect(screen.getByTestId('notebook-sticky-note').className).toContain('notebook-on-rule-text')
  })

  it('pins the visual mnemonic as a 4:3 polaroid near the center binding', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const mnemonic = screen.getByTestId('notebook-visual-mnemonic')
    const mnemonicLabel = screen.getByTestId('notebook-visual-mnemonic-label')
    const mnemonicCard = screen.getByTestId('notebook-visual-mnemonic-card')
    const mnemonicFrame = screen.getByTestId('notebook-visual-mnemonic-frame')
    const mnemonicCaption = screen.getByTestId('notebook-visual-mnemonic-caption')
    const archiveDefinition = screen.getByTestId('notebook-archive-definition-word-1')
    const vocabularyDetail = screen.getByTestId('notebook-vocabulary-detail')
    const headword = screen.getByTestId('notebook-headword')

    expect(mnemonic.className).toContain('notebook-photo-well')
    expect(mnemonic.className).toContain('mt-auto')
    expect(mnemonic.className).toContain('ml-auto')
    expect(mnemonic.className).toContain('w-[min(28rem,70%)]')
    expect(mnemonic.className).toContain('max-w-[28rem]')
    expect(mnemonic.className).toContain('rotate-[-2deg]')
    expect(mnemonicCard.className).toContain('shadow-[0_34px_46px_rgba(40,30,20,0.24),0_10px_18px_rgba(40,30,20,0.14)]')
    expect(screen.queryByTestId('notebook-visual-mnemonic-clip')).toBeNull()
    expect(mnemonicLabel.className).toContain('font-label')
    expect(mnemonicLabel.className).toContain('sr-only')
    expect(mnemonicFrame.className).toContain('aspect-[4/3]')
    expect(mnemonicFrame.className).not.toContain('h-[clamp(150px,18vh,220px)]')
    expect(mnemonicFrame.className).not.toContain('h-28')
    expect(mnemonicFrame.className).not.toContain('md:h-32')
    expect(mnemonicCaption.className).toContain('text-center')
    expect(mnemonicCaption.className).toContain('font-body')
    expect(mnemonicCaption.className).not.toContain('absolute')
    expect(mnemonicCaption.className).not.toContain('bg-black/40')
    expect(archiveDefinition.className).toContain('font-body')
    expect(archiveDefinition.className).not.toContain('font-serif')
    expect(vocabularyDetail.className).not.toContain('font-serif')
    expect(headword.className).toContain('font-serif')
  })

  it('keeps the shell minimal and moves personalization controls into a vertical rail', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const rail = screen.getByTestId('notebook-control-rail')

    expect(screen.getByTestId('notebook-minimal-header')).toBeTruthy()
    expect(screen.getByTestId('notebook-focus-stage')).toBeTruthy()
    expect(rail.getAttribute('aria-orientation')).toBe('vertical')
    expect(rail.textContent).toContain('mastery.notebook.styles.dictionary')
    expect(rail.textContent).toContain('mastery.notebook.density.compact')
    expect(rail.textContent).toContain('mastery.notebook.imagesOn')
  })

  it('shows a complete learning profile for the selected word', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const rightPage = screen.getByTestId('notebook-right-page')

    expect(screen.getByTestId('notebook-book-stage').className).toContain('max-w-[1720px]')
    expect(rightPage.textContent).toContain('/anchor/')
    expect(rightPage.textContent).toContain('common.pos.verb')
    expect(rightPage.textContent).toContain('C2')
    expect(rightPage.textContent).toContain('to make something steady')
    expect(rightPage.textContent).toContain('This image anchors the memory.')
    expect(rightPage.textContent).toContain('anchored')
    expect(rightPage.textContent).toContain('steady')
    expect(rightPage.textContent).toContain('loosen')
    expect(rightPage.textContent).toContain('anchors the')
  })

  it('fits the expanded profile without right-page scrolling or duplicate metadata', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const stage = screen.getByTestId('notebook-book-stage')
    const rightPage = screen.getByTestId('notebook-right-page')
    const rightText = rightPage.textContent ?? ''

    expect(stage.className).toContain('max-w-[1720px]')
    expect(rightPage.className).toContain('overflow-hidden')
    expect(rightPage.className).not.toContain('overflow-y-auto')
    expect(screen.getByTestId('notebook-vocabulary-detail')).toBeTruthy()
    expect(screen.getByTestId('notebook-related-words')).toBeTruthy()
    expect((rightText.match(/\/anchor\//g) ?? [])).toHaveLength(1)
    expect((rightText.match(/common.pos.verb/g) ?? [])).toHaveLength(1)
  })

  it('renders the selected word as a vintage dictionary page instead of a card grid', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const entry = screen.getByTestId('notebook-vocabulary-detail')
    const titleLine = screen.getByTestId('notebook-title-line')
    const relatedWords = screen.getByTestId('notebook-related-words')

    expect(entry.className).not.toContain('font-serif')
    expect(titleLine.textContent).toContain('anchor')
    expect(entry.textContent).toContain('/anchor/')
    expect(entry.textContent).toContain('common.pos.verb')
    expect(screen.queryByTestId('notebook-learning-grid')).toBeNull()
    expect(screen.queryByTestId('notebook-headline-facts')).toBeNull()
    expect(relatedWords.textContent).toContain('steady')
    expect(relatedWords.textContent).toContain('anchored')
    expect(relatedWords.textContent).toContain('anchors the')
  })

  it('keeps all required vocabulary fields visible as labeled vintage sections', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    expect(screen.getByTestId('notebook-vocabulary-detail').textContent).toContain('/anchor/')
    expect(screen.getByTestId('notebook-vocabulary-detail').textContent).toContain('common.pos.verb')
    expect(screen.getByTestId('notebook-field-meaning').textContent).toContain('to make something steady')
    expect(screen.getByTestId('notebook-field-vietnamese').textContent).toContain('Hinh anh nay giup neo tri nho.')
    expect(screen.getByTestId('notebook-field-example').textContent).toContain('This image anchors the memory.')
    expect(screen.getByTestId('notebook-field-word-family').textContent).toContain('anchored')
    expect(screen.getByTestId('notebook-field-synonyms').textContent).toContain('steady')
    expect(screen.getByTestId('notebook-field-antonyms').textContent).toContain('loosen')
    expect(screen.getByTestId('notebook-field-collocations').textContent).toContain('anchors the')
    expect(screen.getByTestId('notebook-field-note').textContent).toContain('My anchor note')
  })

  it('does not wrap all vocabulary expansion fields in one green panel', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const relatedWords = screen.getByTestId('notebook-related-words')

    expect(relatedWords.className).not.toContain('bg-secondary-container')
    expect(relatedWords.className).toContain('bg-transparent')
    expect(screen.getByTestId('notebook-field-word-family').className).toContain('border-t')
    expect(screen.getByTestId('notebook-field-synonyms').className).toContain('border-t')
    expect(screen.getByTestId('notebook-field-antonyms').className).toContain('border-t')
    expect(screen.getByTestId('notebook-field-collocations').className).toContain('border-t')
  })

  it('uses quote framing and a handwritten sticky note like the supplied open-dictionary reference', () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    expect(screen.getByTestId('notebook-title-line').className).toContain('justify-between')
    expect(screen.getByTestId('notebook-quote-card').className).toContain('border-l-4')
    expect(screen.getByTestId('notebook-quote-card').textContent).toContain('This image anchors the memory.')
    const stickyNote = screen.getByTestId('notebook-sticky-note')
    const stickyToolbar = screen.getByTestId('notebook-sticky-note-toolbar')
    const stickyEditButton = screen.getByTestId('notebook-sticky-edit-button')
    expect(stickyNote.className).toContain('rotate')
    expect(stickyNote.className).toContain('font-handwriting')
    expect(stickyNote.className).toContain('group/sticky')
    expect(stickyNote.className).toContain('origin-top-right')
    expect(stickyNote.className).toContain('shadow-[0_24px_30px_-22px_rgba(87,64,32,0.45)')
    expect(stickyNote.className).toContain('aspect-[1/1]')
    expect(stickyNote.className).toContain('max-w-[15rem]')
    expect(stickyNote.className).not.toContain('w-full')
    expect(stickyToolbar.className).toContain('bg-[#F6EFA3]')
    expect(stickyToolbar.className).not.toContain('bg-[#FFF176]')
    expect(screen.getByTestId('notebook-sticky-note-paper-edge')).toBeTruthy()
    expect(screen.getByTestId('notebook-sticky-note-corner-lift')).toBeTruthy()
    expect(screen.getByTestId('notebook-sticky-idle-actions').className).toContain('opacity-60')
    expect(screen.getByTestId('notebook-sticky-idle-actions').className).toContain('group-hover/sticky:opacity-100')
    expect(stickyNote.contains(stickyEditButton)).toBe(true)
    expect(screen.getByTestId('notebook-title-line').querySelector('[aria-label="mastery.notebook.editNote"]')).toBeNull()
    expect(screen.getByTestId('notebook-visual-mnemonic')).toBeTruthy()
  })

  it('keeps sticky note edit actions inside the sticky frame', async () => {
    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={async () => {}}
      />,
    )

    const stickyNote = screen.getByTestId('notebook-sticky-note')

    fireEvent.click(screen.getByTestId('notebook-sticky-edit-button'))
    await screen.findByLabelText('mock-rich-editor')

    expect(stickyNote.className).toContain('aspect-[4/3]')
    expect(stickyNote.className).toContain('max-w-[34rem]')
    const stickyToolbar = screen.getByTestId('notebook-sticky-note-toolbar')
    const cancelButton = screen.getByTestId('notebook-sticky-cancel-button')
    const saveButton = screen.getByTestId('notebook-sticky-save-button')

    expect(stickyNote.contains(cancelButton)).toBe(true)
    expect(stickyNote.contains(saveButton)).toBe(true)
    expect(stickyToolbar.contains(cancelButton)).toBe(true)
    expect(stickyToolbar.contains(saveButton)).toBe(true)
  })

  it('supports Windows Sticky Notes style colors, menu actions, and note status', async () => {
    const onSaveNote = vi.fn(async () => {})

    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="dictionary"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={onSaveNote}
      />,
    )

    const stickyNote = screen.getByTestId('notebook-sticky-note')

    expect(screen.getByTestId('notebook-sticky-note-status').textContent).toContain('3')
    expect(screen.getByTestId('notebook-sticky-note-status').textContent).toContain('14')

    fireEvent.click(screen.getByTestId('notebook-sticky-menu-button'))

    expect(screen.getByTestId('notebook-sticky-menu')).toBeTruthy()
    expect(screen.getByTestId('notebook-sticky-copy-button')).toBeTruthy()
    expect(screen.getByTestId('notebook-sticky-clear-button')).toBeTruthy()

    fireEvent.click(screen.getByTestId('notebook-sticky-color-blue'))

    expect(stickyNote.className).toContain('bg-[#D7E8FF]')
    expect(screen.queryByTestId('notebook-sticky-menu')).toBeNull()

    fireEvent.click(screen.getByTestId('notebook-sticky-menu-button'))
    fireEvent.click(screen.getByTestId('notebook-sticky-clear-button'))

    await waitFor(() => {
      expect(onSaveNote).toHaveBeenCalledWith('word-1', '')
    })
  })

  it('lets users personalize notebook style, density, and image visibility', () => {
    const onStyleChange = vi.fn()
    const onDensityChange = vi.fn()
    const onShowImagesChange = vi.fn()

    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="journal"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={onStyleChange}
        onDensityChange={onDensityChange}
        onShowImagesChange={onShowImagesChange}
        onSaveNote={async () => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'mastery.notebook.styles.dictionary' }))
    fireEvent.click(screen.getByRole('button', { name: 'mastery.notebook.density.compact' }))
    fireEvent.click(screen.getByRole('button', { name: 'mastery.notebook.showImages' }))

    expect(onStyleChange).toHaveBeenCalledWith('dictionary')
    expect(onDensityChange).toHaveBeenCalledWith('compact')
    expect(onShowImagesChange).toHaveBeenCalledWith(false)
  })

  it('supports editing notes from the notebook screen', async () => {
    const onSaveNote = vi.fn(async () => {})

    render(
      <NotebookScreenContent
        isOpen
        entries={entries}
        loading={false}
        viewStyle="study"
        density="cozy"
        showImages
        searchQuery=""
        onSearchChange={() => {}}
        onClose={() => {}}
        onStyleChange={() => {}}
        onDensityChange={() => {}}
        onShowImagesChange={() => {}}
        onSaveNote={onSaveNote}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'mastery.notebook.editNote' }))
    fireEvent.change(await screen.findByLabelText('mock-rich-editor'), {
      target: { value: 'Updated anchor note' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'mastery.notebook.saveNote' }))

    await waitFor(() => {
      expect(onSaveNote).toHaveBeenCalledWith('word-1', 'Updated anchor note')
    })
  })
})
