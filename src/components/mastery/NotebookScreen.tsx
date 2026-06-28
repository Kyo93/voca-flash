import {
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  fetchNotebookWordEntries,
  updateNotebookNote,
  type NotebookWordEntry,
} from '../../lib/storage/notebook'
import { NotebookArchivePage } from './NotebookArchivePage'
import { NotebookControlRail, type NotebookStyleOption } from './NotebookControlRail'
import { NotebookBlankPageLines, NotebookInvestigationPage } from './NotebookInvestigationPage'
import { useNotebookScreenState } from './useNotebookScreenState'
import {
  classes,
  readNotebookPrefs,
  writeNotebookPrefs,
  type NotebookDensity,
  type NotebookPreferences,
  type NotebookViewStyle,
} from './notebook-utils'
import { PAPER_BACKGROUND_STYLE, RULED_PAPER_STYLE } from './notebook-styles'

export type { NotebookDensity, NotebookViewStyle } from './notebook-utils'

interface NotebookScreenProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  onSaveNote?: (wordId: string, note: string) => Promise<void>
}

interface NotebookScreenContentProps extends NotebookPreferences {
  isOpen: boolean
  entries: NotebookWordEntry[]
  loading: boolean
  searchQuery: string
  onSearchChange: (next: string) => void
  onClose: () => void
  onStyleChange: (next: NotebookViewStyle) => void
  onDensityChange: (next: NotebookDensity) => void
  onShowImagesChange: (next: boolean) => void
  onSaveNote: (wordId: string, note: string) => Promise<void>
}

const NOTEBOOK_STYLE_OPTIONS: NotebookStyleOption[] = [
  { value: 'journal', icon: 'auto_stories' },
  { value: 'study', icon: 'school' },
  { value: 'dictionary', icon: 'menu_book' },
]

const NOTEBOOK_DENSITY_OPTIONS: NotebookDensity[] = ['cozy', 'compact']

export default function NotebookScreen({
  isOpen,
  onClose,
  userId,
  onSaveNote,
}: NotebookScreenProps) {
  const [entries, setEntries] = useState<NotebookWordEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [prefs, setPrefs] = useState<NotebookPreferences>(() => readNotebookPrefs())

  useEffect(() => {
    writeNotebookPrefs(prefs)
  }, [prefs])

  useEffect(() => {
    if (!isOpen || !userId) return

    let isActive = true
    setLoading(true)

    fetchNotebookWordEntries(userId)
      .then((nextEntries) => {
        if (isActive) setEntries(nextEntries)
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [isOpen, userId])

  const handleSaveNote = async (wordId: string, note: string) => {
    if (onSaveNote) {
      await onSaveNote(wordId, note)
    } else if (userId) {
      await updateNotebookNote(userId, wordId, note)
    }

    setEntries((current) =>
      current.map((entry) =>
        entry.word_id === wordId
          ? { ...entry, personal_note: note, updated_at: new Date().toISOString() }
          : entry,
      ),
    )
  }

  return (
    <NotebookScreenContent
      isOpen={isOpen}
      entries={entries}
      loading={loading}
      viewStyle={prefs.viewStyle}
      density={prefs.density}
      showImages={prefs.showImages}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onClose={onClose}
      onStyleChange={(viewStyle) => setPrefs((current) => ({ ...current, viewStyle }))}
      onDensityChange={(density) => setPrefs((current) => ({ ...current, density }))}
      onShowImagesChange={(showImages) => setPrefs((current) => ({ ...current, showImages }))}
      onSaveNote={handleSaveNote}
    />
  )
}

export function NotebookScreenContent({
  isOpen,
  entries,
  loading,
  viewStyle,
  density,
  showImages,
  searchQuery,
  onSearchChange,
  onClose,
  onStyleChange,
  onDensityChange,
  onShowImagesChange,
  onSaveNote,
}: NotebookScreenContentProps) {
  const { t } = useTranslation()
  const {
    activeArchivePageIndex,
    archivePageCount,
    archivePageEntries,
    bookDragDelta,
    canGoNextArchivePage,
    canGoPreviousArchivePage,
    clearNote,
    closeEditor,
    draftNote,
    editingWordId,
    finishBookDrag,
    goToNextArchivePage,
    goToPreviousArchivePage,
    handleBookPointerDown,
    handleBookPointerMove,
    saveNote,
    selectedEntry,
    selectEntry,
    setDraftNote,
    startEditing,
    visibleEntries,
  } = useNotebookScreenState({ entries, searchQuery, onSaveNote })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="notebook-overlay-surface fixed inset-0 z-[1000] overflow-hidden text-on-surface"
          role="dialog"
          aria-modal="true"
          aria-label={t('mastery.notebook.title')}
        >
          <div
            data-testid="notebook-background-image"
            aria-hidden="true"
            className="absolute inset-0"
            style={PAPER_BACKGROUND_STYLE}
          />
          <div
            data-testid="notebook-paper-shell"
            className="relative z-10 flex h-full flex-col bg-transparent"
          >
            <header
              data-testid="notebook-minimal-header"
              className="shrink-0 border-b border-outline-variant/20 bg-surface-container-lowest/85 px-4 py-2 text-on-surface backdrop-blur-xl md:px-8"
            >
              <div className="mx-auto flex max-w-[84rem] flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <span className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-secondary">
                      {t('mastery.notebook.eyebrow')}
                    </span>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold leading-none text-on-surface md:text-3xl">
                        {t('mastery.notebook.title')}
                      </h2>
                      <span className="rounded-full bg-primary-container/25 px-3 py-1 text-xs font-semibold text-primary">
                        {t('mastery.notebook.savedCount', { count: entries.length })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('common.close')}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-primary-container/35 md:hidden"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-full md:w-80">
                    <span className="notebook-search-icon material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px]">
                      search
                    </span>
                    <input
                      value={searchQuery}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder={t('mastery.notebook.searchPlaceholder')}
                      className="input-tactile-focus h-10 w-full rounded-full bg-surface-container-low px-4 pl-11 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/65"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('common.close')}
                    className="hidden h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-primary-container/35 md:inline-flex"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>
            </header>

            <main
              data-testid="notebook-main-scroll-region"
              className="min-h-0 flex-1 overflow-hidden px-4 py-15 md:px-8 md:py-18"
            >
              <div
                data-testid="notebook-focus-stage"
                className="mx-auto flex h-full min-h-0 w-full max-w-[116rem] items-stretch justify-center gap-4"
              >
                <div data-testid="notebook-book-column" className="h-full min-h-0 min-w-0 flex-1">
                  {loading ? (
                    <NotebookLoading />
                  ) : visibleEntries.length === 0 ? (
                    <NotebookEmpty />
                  ) : (
                    <NotebookBookSpread
                      entries={archivePageEntries}
                      selectedEntry={selectedEntry}
                      selectedWordId={selectedEntry?.word_id ?? null}
                      archivePageIndex={activeArchivePageIndex}
                      archivePageCount={archivePageCount}
                      canGoPreviousArchivePage={canGoPreviousArchivePage}
                      canGoNextArchivePage={canGoNextArchivePage}
                      density={density}
                      showImages={showImages}
                      editingWordId={editingWordId}
                      draftNote={draftNote}
                      onSelectEntry={selectEntry}
                      onPreviousArchivePage={goToPreviousArchivePage}
                      onNextArchivePage={goToNextArchivePage}
                      onStartEdit={startEditing}
                      onDraftChange={setDraftNote}
                      onCancelEdit={closeEditor}
                      onSaveEntry={saveNote}
                      onClearEntryNote={clearNote}
                      bookDragDelta={bookDragDelta}
                      onBookPointerDown={handleBookPointerDown}
                      onBookPointerMove={handleBookPointerMove}
                      onBookPointerUp={finishBookDrag}
                      onBookPointerCancel={finishBookDrag}
                    />
                  )}
                </div>

                <NotebookControlRail
                  styleOptions={NOTEBOOK_STYLE_OPTIONS}
                  densityOptions={NOTEBOOK_DENSITY_OPTIONS}
                  viewStyle={viewStyle}
                  density={density}
                  showImages={showImages}
                  onStyleChange={onStyleChange}
                  onDensityChange={onDensityChange}
                  onShowImagesChange={onShowImagesChange}
                />
              </div>
            </main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface NotebookBookSpreadProps {
  entries: NotebookWordEntry[]
  selectedEntry: NotebookWordEntry | null
  selectedWordId: string | null
  archivePageIndex: number
  archivePageCount: number
  canGoPreviousArchivePage: boolean
  canGoNextArchivePage: boolean
  density: NotebookDensity
  showImages: boolean
  editingWordId: string | null
  draftNote: string
  onSelectEntry: (wordId: string) => void
  onPreviousArchivePage: () => void
  onNextArchivePage: () => void
  onStartEdit: (entry: NotebookWordEntry) => void
  onDraftChange: (next: string) => void
  onCancelEdit: () => void
  onSaveEntry: (entry: NotebookWordEntry) => Promise<void>
  onClearEntryNote: (entry: NotebookWordEntry) => Promise<void>
  bookDragDelta: number
  onBookPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onBookPointerMove: (event: PointerEvent<HTMLDivElement>) => void
  onBookPointerUp: (event: PointerEvent<HTMLDivElement>) => void
  onBookPointerCancel: (event: PointerEvent<HTMLDivElement>) => void
}

function NotebookBookSpread({
  entries,
  selectedEntry,
  selectedWordId,
  archivePageIndex,
  archivePageCount,
  canGoPreviousArchivePage,
  canGoNextArchivePage,
  density,
  showImages,
  editingWordId,
  draftNote,
  onSelectEntry,
  onPreviousArchivePage,
  onNextArchivePage,
  onStartEdit,
  onDraftChange,
  onCancelEdit,
  onSaveEntry,
  onClearEntryNote,
  bookDragDelta,
  onBookPointerDown,
  onBookPointerMove,
  onBookPointerUp,
  onBookPointerCancel,
}: NotebookBookSpreadProps) {
  return (
    <NotebookBookFrame
      dragDeltaX={bookDragDelta}
      onPointerDown={onBookPointerDown}
      onPointerMove={onBookPointerMove}
      onPointerUp={onBookPointerUp}
      onPointerCancel={onBookPointerCancel}
    >
      <NotebookArchivePage
        entries={entries}
        selectedEntry={selectedEntry}
        selectedWordId={selectedWordId}
        archivePageIndex={archivePageIndex}
        archivePageCount={archivePageCount}
        canGoPreviousPage={canGoPreviousArchivePage}
        canGoNextPage={canGoNextArchivePage}
        density={density}
        showImages={showImages}
        onSelectEntry={onSelectEntry}
        onPreviousPage={onPreviousArchivePage}
        onNextPage={onNextArchivePage}
      />

      <NotebookInvestigationPage
        entry={selectedEntry}
        isEditing={Boolean(selectedEntry && editingWordId === selectedEntry.word_id)}
        draftNote={draftNote}
        onStartEdit={() => {
          if (selectedEntry) onStartEdit(selectedEntry)
        }}
        onDraftChange={onDraftChange}
        onCancelEdit={onCancelEdit}
        onSaveEdit={async () => {
          if (selectedEntry) await onSaveEntry(selectedEntry)
        }}
        onClearNote={async () => {
          if (selectedEntry) await onClearEntryNote(selectedEntry)
        }}
      />
    </NotebookBookFrame>
  )
}

interface NotebookBookFrameProps {
  children: ReactNode
  dragDeltaX?: number
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void
  onPointerMove?: (event: PointerEvent<HTMLDivElement>) => void
  onPointerUp?: (event: PointerEvent<HTMLDivElement>) => void
  onPointerCancel?: (event: PointerEvent<HTMLDivElement>) => void
}

function NotebookBookFrame({
  children,
  dragDeltaX = 0,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: NotebookBookFrameProps) {
  const flipProgress = Math.min(Math.abs(dragDeltaX) / 180, 1)
  const isForwardFlip = dragDeltaX < 0
  const pageFlipStyle: CSSProperties = {
    opacity: flipProgress * 0.7,
    transform: `perspective(900px) rotateY(${isForwardFlip ? -22 * flipProgress : 22 * flipProgress}deg)`,
  }

  return (
    <div
      className="relative mx-auto flex h-full min-h-0 w-full items-stretch overflow-x-auto overflow-y-hidden px-0 md:px-4"
    >
      <div
        data-testid="notebook-book-stage"
        className="relative z-10 mx-auto h-full w-full min-w-[1100px] max-w-[1720px]"
      >
        <div
          data-testid="notebook-book-spread"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className="relative grid h-full grid-cols-2 touch-pan-y select-none overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_32px_80px_rgba(40,30,20,0.16)] cursor-grab active:cursor-grabbing"
        >
          {children}
          <div
            data-testid="notebook-book-binding"
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-20 w-12 -translate-x-1/2 bg-[linear-gradient(to_right,transparent,rgba(0,0,0,0.04)_40%,rgba(0,0,0,0.08)_50%,rgba(0,0,0,0.04)_60%,transparent)]"
          />
          <div
            data-testid="notebook-page-flip-layer"
            aria-hidden="true"
            className={classes(
              'pointer-events-none absolute inset-y-0 z-30 w-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0.72),rgba(232,224,203,0.78)_55%,rgba(96,72,43,0.18))] shadow-[0_18px_40px_rgba(40,30,20,0.22)] transition-opacity duration-150',
              isForwardFlip ? 'right-0 origin-left rounded-r-xl' : 'left-0 origin-right rounded-l-xl',
            )}
            style={pageFlipStyle}
          />
        </div>
      </div>
    </div>
  )
}

function NotebookLoading() {
  return (
    <NotebookBookFrame>
      <NotebookLoadingPage side="left" />
      <NotebookLoadingPage side="right" />
    </NotebookBookFrame>
  )
}

function NotebookLoadingPage({ side }: { side: 'left' | 'right' }) {
  return (
    <section
      className={classes(
        'h-full min-h-0 bg-surface-container-lowest px-10 py-10 animate-pulse',
        side === 'left'
          ? 'rounded-l-lg shadow-[inset_-22px_0_36px_-38px_rgba(29,27,22,0.75)]'
          : 'rounded-r-lg shadow-[inset_22px_0_36px_-38px_rgba(29,27,22,0.75)]',
      )}
    >
      <div className="mb-8 h-3 w-24 rounded-full bg-surface-container-highest" />
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="h-5 w-36 rounded-full bg-surface-container-highest" />
            <div className="h-3 w-full rounded-full bg-surface-container" />
            <div className="h-3 w-2/3 rounded-full bg-surface-container" />
          </div>
        ))}
      </div>
    </section>
  )
}

function NotebookEmpty() {
  const { t } = useTranslation()

  return (
    <NotebookBookFrame>
      <section
        className="notebook-ruled-page h-full min-h-0 bg-surface-container-lowest px-10 py-10 shadow-[inset_-22px_0_36px_-38px_rgba(29,27,22,0.35)]"
        style={RULED_PAPER_STYLE}
      >
        <div className="flex h-full min-h-96 flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined mb-5 text-8xl text-on-surface-variant/10">
            menu_book
          </span>
          <p className="text-xl font-semibold text-on-surface">{t('mastery.notebook.emptyTitle')}</p>
          <p className="mt-2 text-sm font-semibold text-on-surface-variant/50">
            {t('mastery.notebook.emptySubtitle')}
          </p>
        </div>
      </section>
      <section
        className="notebook-ruled-page h-full min-h-0 bg-surface-container-lowest px-10 py-10 shadow-[inset_22px_0_36px_-38px_rgba(29,27,22,0.35)]"
        style={RULED_PAPER_STYLE}
      >
        <NotebookBlankPageLines />
      </section>
    </NotebookBookFrame>
  )
}
