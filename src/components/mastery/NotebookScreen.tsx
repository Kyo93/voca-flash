import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import {
  fetchNotebookWordEntries,
  updateNotebookNote,
  type NotebookWordEntry,
} from '../../lib/storage/notebook'

const RichNoteEditor = lazy(() => import('../common/RichNoteEditor'))

export type NotebookViewStyle = 'journal' | 'study' | 'dictionary'
export type NotebookDensity = 'cozy' | 'compact'

interface NotebookPreferences {
  viewStyle: NotebookViewStyle
  density: NotebookDensity
  showImages: boolean
}

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

interface NotebookStyleOption {
  value: NotebookViewStyle
  icon: string
}

const NOTEBOOK_PREFS_KEY = 'voca-flash:mastery-notebook-prefs'

const DEFAULT_PREFS: NotebookPreferences = {
  viewStyle: 'journal',
  density: 'cozy',
  showImages: true,
}

const ARCHIVE_PREVIEW_LIMIT = 4
const STICKY_NOTE_COLORS = ['yellow', 'green', 'blue', 'pink', 'purple', 'charcoal'] as const

type StickyNoteColor = (typeof STICKY_NOTE_COLORS)[number]

const STICKY_NOTE_THEMES: Record<
  StickyNoteColor,
  {
    note: string
    toolbar: string
    text: string
    control: string
    activeControl: string
    swatch: string
  }
> = {
  yellow: {
    note: 'bg-[#FFF7BA]',
    toolbar: 'bg-[#F6EFA3]',
    text: 'text-amber-950',
    control: 'text-amber-900/75 hover:bg-amber-900/10 hover:text-amber-950',
    activeControl: 'bg-amber-900/10 text-amber-950 hover:bg-amber-900/18',
    swatch: 'bg-[#F6EFA3]',
  },
  green: {
    note: 'bg-[#DFF6C8]',
    toolbar: 'bg-[#C7EC9E]',
    text: 'text-lime-950',
    control: 'text-lime-950/70 hover:bg-lime-950/10 hover:text-lime-950',
    activeControl: 'bg-lime-950/10 text-lime-950 hover:bg-lime-950/18',
    swatch: 'bg-[#C7EC9E]',
  },
  blue: {
    note: 'bg-[#D7E8FF]',
    toolbar: 'bg-[#BFD7FF]',
    text: 'text-slate-950',
    control: 'text-slate-900/70 hover:bg-slate-900/10 hover:text-slate-950',
    activeControl: 'bg-slate-900/10 text-slate-950 hover:bg-slate-900/18',
    swatch: 'bg-[#BFD7FF]',
  },
  pink: {
    note: 'bg-[#FFD6E7]',
    toolbar: 'bg-[#FFB8D3]',
    text: 'text-rose-950',
    control: 'text-rose-950/70 hover:bg-rose-950/10 hover:text-rose-950',
    activeControl: 'bg-rose-950/10 text-rose-950 hover:bg-rose-950/18',
    swatch: 'bg-[#FFB8D3]',
  },
  purple: {
    note: 'bg-[#E7DBFF]',
    toolbar: 'bg-[#D7C2FF]',
    text: 'text-violet-950',
    control: 'text-violet-950/70 hover:bg-violet-950/10 hover:text-violet-950',
    activeControl: 'bg-violet-950/10 text-violet-950 hover:bg-violet-950/18',
    swatch: 'bg-[#D7C2FF]',
  },
  charcoal: {
    note: 'bg-[#3F3A34]',
    toolbar: 'bg-[#2F2B27]',
    text: 'text-stone-50',
    control: 'text-stone-50/70 hover:bg-white/10 hover:text-white',
    activeControl: 'bg-white/14 text-white hover:bg-white/20',
    swatch: 'bg-[#3F3A34]',
  },
}

const PAPER_BACKGROUND_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, rgba(248, 245, 241, 0.46), rgba(248, 245, 241, 0.66)), url('/notebook-assets/notebook-flat-lay-desk.jpg')",
  backgroundPosition: 'center center',
  backgroundSize: 'cover',
}

const RULED_PAPER_STYLE: CSSProperties = {
  backgroundPositionY: 'var(--notebook-rule-offset)',
}

function readNotebookPrefs(): NotebookPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS

  try {
    const raw = window.localStorage.getItem(NOTEBOOK_PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) } as NotebookPreferences
  } catch {
    return DEFAULT_PREFS
  }
}

function writeNotebookPrefs(prefs: NotebookPreferences) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(NOTEBOOK_PREFS_KEY, JSON.stringify(prefs))
}

function classes(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ')
}

function shouldIgnoreBookDrag(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(target.closest('button, a, input, textarea, select, [contenteditable="true"], [role="button"]'))
    : false
}

function getNoteStats(note?: string | null) {
  const content = (note ?? '').trim()
  return {
    characters: content.length,
    words: content ? content.split(/\s+/).filter(Boolean).length : 0,
  }
}

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
  const [editingWordId, setEditingWordId] = useState<string | null>(null)
  const [draftNote, setDraftNote] = useState('')
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [archivePageIndex, setArchivePageIndex] = useState(0)
  const [bookDragDelta, setBookDragDelta] = useState(0)
  const bookDragStartX = useRef<number | null>(null)

  const visibleEntries = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    if (!needle) return entries

    return entries.filter((entry) => {
      const word = entry.word
      return [
        word?.word,
        word?.definition,
        word?.phonetic,
        word?.example,
        entry.personal_note,
      ].some((value) => value?.toLowerCase().includes(needle))
    })
  }, [entries, searchQuery])

  useEffect(() => {
    if (visibleEntries.length === 0) {
      if (selectedWordId) setSelectedWordId(null)
      return
    }

    if (!visibleEntries.some((entry) => entry.word_id === selectedWordId)) {
      setSelectedWordId(visibleEntries[0].word_id)
    }
  }, [selectedWordId, visibleEntries])

  useEffect(() => {
    setArchivePageIndex(0)
  }, [searchQuery])

  const archivePageCount = Math.max(1, Math.ceil(visibleEntries.length / ARCHIVE_PREVIEW_LIMIT))
  const activeArchivePageIndex = Math.min(archivePageIndex, archivePageCount - 1)
  const archivePageEntries = visibleEntries.slice(
    activeArchivePageIndex * ARCHIVE_PREVIEW_LIMIT,
    (activeArchivePageIndex + 1) * ARCHIVE_PREVIEW_LIMIT,
  )

  useEffect(() => {
    if (archivePageIndex !== activeArchivePageIndex) {
      setArchivePageIndex(activeArchivePageIndex)
    }
  }, [activeArchivePageIndex, archivePageIndex])

  const goToArchivePage = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(nextIndex, archivePageCount - 1))
    setArchivePageIndex(boundedIndex)

    const firstEntryOnPage = visibleEntries[boundedIndex * ARCHIVE_PREVIEW_LIMIT]
    if (firstEntryOnPage) {
      setSelectedWordId(firstEntryOnPage.word_id)
    }
  }

  const goToPreviousArchivePage = () => {
    goToArchivePage(activeArchivePageIndex - 1)
  }

  const goToNextArchivePage = () => {
    goToArchivePage(activeArchivePageIndex + 1)
  }

  const handleBookPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (archivePageCount < 2) return
    if (shouldIgnoreBookDrag(event.target)) return

    bookDragStartX.current = event.clientX
    setBookDragDelta(0)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handleBookPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (bookDragStartX.current === null) return
    setBookDragDelta(event.clientX - bookDragStartX.current)
  }

  const finishBookDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (bookDragStartX.current === null) return

    const dragDistance = event.clientX - bookDragStartX.current
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    bookDragStartX.current = null
    setBookDragDelta(0)

    if (Math.abs(dragDistance) < 80) return
    if (dragDistance < 0) {
      goToNextArchivePage()
    } else {
      goToPreviousArchivePage()
    }
  }

  const selectedEntry = useMemo(
    () =>
      visibleEntries.find((entry) => entry.word_id === selectedWordId) ??
      visibleEntries[0] ??
      null,
    [selectedWordId, visibleEntries],
  )

  const startEditing = (entry: NotebookWordEntry) => {
    setEditingWordId(entry.word_id)
    setDraftNote(entry.personal_note ?? '')
  }

  const closeEditor = () => {
    setEditingWordId(null)
    setDraftNote('')
  }

  const saveNote = async (entry: NotebookWordEntry) => {
    await onSaveNote(entry.word_id, draftNote)
    closeEditor()
  }

  const clearNote = async (entry: NotebookWordEntry) => {
    await onSaveNote(entry.word_id, '')
    closeEditor()
  }

  const styleOptions: NotebookStyleOption[] = [
    { value: 'journal', icon: 'auto_stories' },
    { value: 'study', icon: 'school' },
    { value: 'dictionary', icon: 'menu_book' },
  ]

  const densityOptions: NotebookDensity[] = ['cozy', 'compact']

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] overflow-hidden bg-[#F8F5F1] text-on-surface"
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
                    <span className="text-[0.64rem] font-black uppercase tracking-[0.22em] text-secondary">
                      {t('mastery.notebook.eyebrow')}
                    </span>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-black leading-none text-on-surface md:text-3xl">
                        {t('mastery.notebook.title')}
                      </h2>
                      <span className="rounded-full bg-primary-container/25 px-3 py-1 text-xs font-black text-primary">
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
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#6a4a2d]/55">
                      search
                    </span>
                    <input
                      value={searchQuery}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder={t('mastery.notebook.searchPlaceholder')}
                      className="input-tactile-focus h-10 w-full rounded-full bg-surface-container-low px-4 pl-11 text-sm font-bold text-on-surface placeholder:text-on-surface-variant/65"
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
                      canGoPreviousArchivePage={activeArchivePageIndex > 0}
                      canGoNextArchivePage={activeArchivePageIndex < archivePageCount - 1}
                      viewStyle={viewStyle}
                      density={density}
                      showImages={showImages}
                      editingWordId={editingWordId}
                      draftNote={draftNote}
                      onSelectEntry={setSelectedWordId}
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
                  styleOptions={styleOptions}
                  densityOptions={densityOptions}
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

interface NotebookControlRailProps {
  styleOptions: NotebookStyleOption[]
  densityOptions: NotebookDensity[]
  viewStyle: NotebookViewStyle
  density: NotebookDensity
  showImages: boolean
  onStyleChange: (next: NotebookViewStyle) => void
  onDensityChange: (next: NotebookDensity) => void
  onShowImagesChange: (next: boolean) => void
}

function NotebookControlRail({
  styleOptions,
  densityOptions,
  viewStyle,
  density,
  showImages,
  onStyleChange,
  onDensityChange,
  onShowImagesChange,
}: NotebookControlRailProps) {
  const { t } = useTranslation()

  return (
    <aside
      data-testid="notebook-control-rail"
      role="toolbar"
      aria-orientation="vertical"
      aria-label={t('mastery.notebook.title')}
      className="sticky top-4 flex w-24 shrink-0 flex-col gap-3 rounded-3xl bg-surface-container-lowest/80 p-2 shadow-[0_18px_60px_rgba(40,30,20,0.11)] backdrop-blur-xl sm:w-32"
    >
      <div className="flex flex-col gap-1">
        {styleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={t(`mastery.notebook.styles.${option.value}`)}
            aria-pressed={viewStyle === option.value}
            onClick={() => onStyleChange(option.value)}
            className={classes(
              'flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center text-[10px] font-black uppercase leading-tight transition-all',
              viewStyle === option.value
                ? 'bg-surface-container-lowest text-primary sun-drenched-shadow'
                : 'text-on-surface-variant/60 hover:bg-surface-container-low hover:text-on-surface',
            )}
          >
            <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
            <span>{t(`mastery.notebook.styles.${option.value}`)}</span>
          </button>
        ))}
      </div>

      <div className="h-px bg-outline-variant/20" />

      <div className="flex flex-col gap-1">
        {densityOptions.map((option) => (
          <button
            key={option}
            type="button"
            aria-label={t(`mastery.notebook.density.${option}`)}
            aria-pressed={density === option}
            onClick={() => onDensityChange(option)}
            className={classes(
              'min-h-10 rounded-2xl px-2 py-2 text-[10px] font-black uppercase leading-tight transition-all',
              density === option
                ? 'bg-surface-container-lowest text-secondary sun-drenched-shadow'
                : 'text-on-surface-variant/60 hover:bg-surface-container-low hover:text-on-surface',
            )}
          >
            {t(`mastery.notebook.density.${option}`)}
          </button>
        ))}
      </div>

      <div className="h-px bg-outline-variant/20" />

      <button
        type="button"
        aria-label={t('mastery.notebook.showImages')}
        aria-pressed={showImages}
        onClick={() => onShowImagesChange(!showImages)}
        className={classes(
          'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center text-[10px] font-black uppercase leading-tight transition-all',
          showImages
            ? 'bg-secondary text-on-secondary'
            : 'bg-surface-container text-on-surface-variant/60 hover:text-on-surface',
        )}
      >
        <span className="material-symbols-outlined text-[20px]">
          {showImages ? 'image' : 'image_not_supported'}
        </span>
        <span>{showImages ? t('mastery.notebook.imagesOn') : t('mastery.notebook.imagesOff')}</span>
      </button>
    </aside>
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
  viewStyle: NotebookViewStyle
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
  viewStyle,
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
        viewStyle={viewStyle}
        density={density}
        showImages={showImages}
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

interface NotebookArchivePageProps {
  entries: NotebookWordEntry[]
  selectedEntry: NotebookWordEntry | null
  selectedWordId: string | null
  archivePageIndex: number
  archivePageCount: number
  canGoPreviousPage: boolean
  canGoNextPage: boolean
  density: NotebookDensity
  showImages: boolean
  onSelectEntry: (wordId: string) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

function NotebookArchivePage({
  entries,
  selectedEntry,
  selectedWordId,
  archivePageIndex,
  archivePageCount,
  canGoPreviousPage,
  canGoNextPage,
  density,
  showImages,
  onSelectEntry,
  onPreviousPage,
  onNextPage,
}: NotebookArchivePageProps) {
  const { t } = useTranslation()
  const isCompact = density === 'compact'
  const selectedWord = selectedEntry?.word ?? null

  return (
    <section
      data-testid="notebook-left-page"
      className="notebook-ruled-page notebook-baseline-page relative h-full min-h-0 overflow-hidden border-r border-outline-variant/10 bg-surface-container-lowest p-8 pr-12 shadow-[inset_-20px_0_38px_-38px_rgba(40,30,20,0.45)] md:p-10 md:pr-14"
      style={RULED_PAPER_STYLE}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[var(--bg-texture)] opacity-[0.04]"
      />
      <div className="relative flex h-full flex-col">
        <div className="mb-6">
          <div>
            <h3 className="font-serif text-3xl font-bold text-primary">
              {t('mastery.notebook.recentAdditions')}
            </h3>
          </div>
        </div>

        <div
          data-testid="notebook-archive-list"
          className="notebook-line-text notebook-on-rule-text mb-8 space-y-8 pr-3"
        >
          {entries.map((entry) => (
            <NotebookArchiveEntry
              key={entry.id}
              entry={entry}
              selected={entry.word_id === selectedWordId}
              compact={isCompact}
              onSelect={() => onSelectEntry(entry.word_id)}
            />
          ))}
        </div>

        {selectedWord && (
          <NotebookMnemonicPhoto
            word={selectedWord}
            showImages={showImages}
            className="notebook-photo-well mt-auto ml-auto w-[min(28rem,70%)] max-w-[28rem] origin-bottom-right rotate-[-2deg]"
          />
        )}

        <div
          data-testid="notebook-page-controls"
          className="absolute bottom-10 left-10 z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-outline"
        >
          <button
            type="button"
            data-testid="notebook-prev-page"
            onClick={onPreviousPage}
            disabled={!canGoPreviousPage}
            aria-label={t('mastery.notebook.previousPage')}
            className={classes(
              'inline-flex h-8 w-8 items-center justify-center rounded-full border border-warm-accent/20 bg-surface-container-lowest/70 text-secondary transition-all active:scale-95',
              !canGoPreviousPage && 'cursor-not-allowed opacity-35',
            )}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <span data-testid="notebook-current-page">
            {t('mastery.notebook.pageOf', {
              page: archivePageIndex + 1,
              total: archivePageCount,
            })}
          </span>
          <button
            type="button"
            data-testid="notebook-next-page"
            onClick={onNextPage}
            disabled={!canGoNextPage}
            aria-label={t('mastery.notebook.nextPage')}
            className={classes(
              'inline-flex h-8 w-8 items-center justify-center rounded-full border border-warm-accent/20 bg-surface-container-lowest/70 text-secondary transition-all active:scale-95',
              !canGoNextPage && 'cursor-not-allowed opacity-35',
            )}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  )
}

interface NotebookArchiveEntryProps {
  entry: NotebookWordEntry
  selected: boolean
  compact: boolean
  onSelect: () => void
}

function NotebookArchiveEntry({
  entry,
  selected,
  compact,
  onSelect,
}: NotebookArchiveEntryProps) {
  const { t } = useTranslation()
  const word = entry.word

  if (!word) return null

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={t('mastery.notebook.selectWord', { word: word.word })}
      className={classes(
        'group block w-full text-left transition-all',
        selected ? 'translate-x-1' : 'hover:translate-x-1',
      )}
    >
      <article
        className={classes(
          'transition-colors',
          selected && 'border-l-4 border-primary-container pl-6 -ml-6',
        )}
      >
        <div className="flex items-baseline justify-between gap-4">
          <h4
            className={classes(
              'notebook-line-text notebook-engraved-text font-serif font-bold tracking-normal transition-colors',
              selected ? 'text-primary' : 'text-on-surface group-hover:text-primary',
              compact ? 'text-base' : 'text-xl',
            )}
          >
            {word.word}
          </h4>
          {getNotebookLevelLabel(word.difficulty) && (
            <span
              className={classes(
                'rounded-md border border-warm-accent/35 px-2 py-0.5 text-[10px] font-black uppercase leading-none',
                selected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary',
              )}
            >
              {getNotebookLevelLabel(word.difficulty)}
            </span>
          )}
        </div>

        <p
          data-testid={`notebook-archive-definition-${entry.word_id}`}
          className="notebook-line-text notebook-engraved-text font-body text-sm font-semibold text-on-surface"
        >
          {word.definition}
        </p>

        {word.example && !compact && (
          <p
            data-testid={`notebook-archive-example-${entry.word_id}`}
            className="notebook-line-text notebook-engraved-text line-clamp-1 font-body text-sm font-medium italic text-on-surface-variant"
          >
            "{word.example}"
          </p>
        )}
      </article>
    </button>
  )
}

function cleanTerms(terms?: string[] | null) {
  return (terms ?? []).map((term) => term.trim()).filter(Boolean)
}

function normalizeTerm(term: string) {
  return term.toLowerCase().replace(/[^a-z]/g, '')
}

function deriveCollocations(word: NonNullable<NotebookWordEntry['word']>) {
  if (!word.example) return []

  const tokens = word.example.match(/[A-Za-z']+/g) ?? []
  const target = normalizeTerm(word.word)
  if (!target) return []

  const phrases = new Set<string>()

  tokens.forEach((token, index) => {
    const current = normalizeTerm(token)
    const matchesTarget = current === target || current.startsWith(target) || target.startsWith(current)
    if (!matchesTarget) return

    const previous = tokens[index - 1]
    const next = tokens[index + 1]
    if (previous) phrases.add(`${previous} ${token}`)
    if (next) phrases.add(`${token} ${next}`)
    if (previous && next) phrases.add(`${previous} ${token} ${next}`)
  })

  return Array.from(phrases).slice(0, 4)
}

function getNotebookLevelLabel(difficulty?: number | null) {
  if (!difficulty) return null
  if (difficulty >= 5) return 'C2'
  if (difficulty === 4) return 'C1'
  if (difficulty === 3) return 'B2'
  if (difficulty === 2) return 'B1'
  return 'A2'
}

function getNotebookPosAbbr(pos?: NonNullable<NotebookWordEntry['word']>['pos']) {
  if (!pos) return null
  const labels: Record<NonNullable<NonNullable<NotebookWordEntry['word']>['pos']>, string> = {
    noun: 'n.',
    verb: 'v.',
    adj: 'adj.',
    adv: 'adv.',
    phrase: 'phr.',
    other: 'misc.',
  }
  return labels[pos]
}

function NotebookMnemonicPhoto({
  word,
  showImages,
  className,
}: {
  word: NonNullable<NotebookWordEntry['word']>
  showImages: boolean
  className?: string
}) {
  const { t } = useTranslation()
  const caption = word.example ?? word.definition

  return (
    <section
      data-testid="notebook-visual-mnemonic"
      className={classes(
        'relative',
        className,
      )}
    >
      <h5
        data-testid="notebook-visual-mnemonic-label"
        className="sr-only font-label text-[10px] font-bold uppercase tracking-[0.14em] text-outline"
      >
        {t('mastery.notebook.visualMnemonic')}
      </h5>
      <div
        data-testid="notebook-visual-mnemonic-card"
        className="group relative rounded-sm bg-surface-container-lowest p-2.5 pb-4 shadow-[0_34px_46px_rgba(40,30,20,0.24),0_10px_18px_rgba(40,30,20,0.14)] ring-1 ring-outline-variant/20"
      >
        <div
          data-testid="notebook-visual-mnemonic-frame"
          className="aspect-[4/3] overflow-hidden rounded-sm bg-surface-container-high shadow-inner"
        >
          {showImages && word.image_url ? (
            <img
              src={word.image_url}
              alt={t('mastery.notebook.visualMnemonic')}
              className="h-full w-full object-cover brightness-95 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgba(230,126,34,0.32),transparent_44%),var(--color-surface-container-low)] text-5xl font-black text-primary">
              {word.word.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <p
          data-testid="notebook-visual-mnemonic-caption"
          className="mt-2 line-clamp-3 px-1 text-center font-body text-[0.8rem] font-semibold italic leading-snug text-on-surface-variant"
        >
          {caption}
        </p>
      </div>
    </section>
  )
}

function NotebookVintageField({
  testId,
  label,
  children,
  className,
}: {
  testId: string
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      data-testid={testId}
      className={classes(
        'notebook-on-rule-text border-t border-warm-accent/20 pt-4',
        className,
      )}
    >
      <h5 className="notebook-line-text mb-0 text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
        {label}
      </h5>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

function NotebookVintageTerms({ terms, tone = 'sage' }: { terms: string[]; tone?: 'sage' | 'terracotta' | 'ink' }) {
  const { t } = useTranslation()

  if (terms.length === 0) {
    return <p className="notebook-line-text notebook-engraved-text text-center text-sm font-semibold italic text-on-surface-variant/55">{t('mastery.notebook.noDataYet')}</p>
  }

  return (
    <div className="flex flex-wrap justify-start gap-2">
      {terms.map((term) => (
        <span
          key={term}
          className={classes(
            'rounded-md border px-2.5 py-1 text-xs font-black leading-none',
            tone === 'sage' && 'border-secondary/25 bg-secondary-container/45 text-secondary',
            tone === 'terracotta' && 'border-primary/20 bg-primary-container/25 text-primary',
            tone === 'ink' && 'border-warm-accent/25 bg-surface-container-high text-on-surface',
          )}
        >
          {term}
        </span>
      ))}
    </div>
  )
}

interface NotebookInvestigationPageProps {
  entry: NotebookWordEntry | null
  viewStyle: NotebookViewStyle
  density: NotebookDensity
  showImages: boolean
  isEditing: boolean
  draftNote: string
  onStartEdit: () => void
  onDraftChange: (next: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => Promise<void>
  onClearNote: () => Promise<void>
}

function NotebookInvestigationPage({
  entry,
  isEditing,
  draftNote,
  onStartEdit,
  onDraftChange,
  onCancelEdit,
  onSaveEdit,
  onClearNote,
}: NotebookInvestigationPageProps) {
  const { t } = useTranslation()
  const [stickyMenuOpen, setStickyMenuOpen] = useState(false)
  const [stickyNoteColor, setStickyNoteColor] = useState<StickyNoteColor>('yellow')
  const word = entry?.word
  const stickyTheme = STICKY_NOTE_THEMES[stickyNoteColor]
  const noteStats = getNoteStats(entry?.personal_note)
  const wordFamily = word ? cleanTerms(word.word_family) : []
  const synonyms = word ? cleanTerms(word.synonyms) : []
  const antonyms = word ? cleanTerms(word.antonyms) : []
  const collocations = word ? deriveCollocations(word) : []
  const relatedTerms = Array.from(new Set([...synonyms, ...wordFamily])).slice(0, 4)
  const levelLabel = word ? getNotebookLevelLabel(word.difficulty) : null
  const posAbbr = word ? getNotebookPosAbbr(word.pos) : null

  useEffect(() => {
    setStickyMenuOpen(false)
    setStickyNoteColor('yellow')
  }, [entry?.word_id])

  const copyNote = async () => {
    if (!entry?.personal_note) return

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(entry.personal_note)
    }

    setStickyMenuOpen(false)
  }

  const clearNote = async () => {
    setStickyMenuOpen(false)
    await onClearNote()
  }

  return (
    <section
      data-testid="notebook-right-page"
      className="notebook-ruled-page notebook-baseline-page relative h-full min-h-0 overflow-hidden bg-surface-container-lowest p-8 pl-12 shadow-[inset_20px_0_38px_-38px_rgba(40,30,20,0.45)] md:p-10 md:pl-14"
      style={RULED_PAPER_STYLE}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[var(--bg-texture)] opacity-[0.04]"
      />

      {word && entry ? (
        <article
          data-testid="notebook-word-investigation"
          className="relative mx-auto flex min-h-full max-w-[46rem] flex-col"
        >
          <div
            data-testid="notebook-vocabulary-detail"
            className="font-body flex min-h-full flex-col text-on-surface"
          >
            <div data-testid="notebook-title-line" className="notebook-on-rule-text mb-1 flex items-start justify-between gap-5">
              <h3
                data-testid="notebook-headword"
                className="notebook-engraved-text font-serif break-words text-5xl font-black leading-none tracking-normal text-on-surface md:text-6xl"
              >
                {word.word}
              </h3>
              <div className="mt-3 flex items-center gap-2">
                {levelLabel && (
                  <span className="rounded-lg bg-primary px-3 py-1 text-xs font-bold leading-none text-on-primary">
                    {levelLabel}
                  </span>
                )}
              </div>
            </div>

            <div
              data-testid="notebook-headword-meta"
              className="notebook-line-text notebook-on-rule-text mb-2 flex flex-wrap items-center gap-x-5 gap-y-0 border-b border-outline-variant/20 pb-0"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-primary">volume_up</span>
                {word.phonetic && (
                    <span className="notebook-engraved-text text-xl font-semibold text-on-surface-variant">
                      {word.phonetic}
                    </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden h-4 w-px bg-outline-variant/30 sm:block" aria-hidden="true" />
                {posAbbr && (
                  <span className="notebook-engraved-text text-lg font-semibold italic text-secondary">
                    {posAbbr}
                  </span>
                )}
                {word.pos && (
                  <span className="rounded-md border border-primary/20 bg-primary-container/20 px-2 py-0.5 text-[10px] font-bold uppercase leading-none text-primary">
                    {t(`common.pos.${word.pos}`)}
                  </span>
                )}
                <span className="material-symbols-outlined text-outline">star</span>
                <span className="material-symbols-outlined text-outline">share</span>
              </div>
            </div>

            <div data-testid="notebook-primary-fields" className="mb-4 space-y-4">
              <NotebookVintageField
                testId="notebook-field-meaning"
                label={t('mastery.notebook.meaning')}
                className="border-t-0 pt-0"
              >
                <p className="notebook-line-text notebook-engraved-text text-xl font-medium text-on-surface">
                  {word.definition}
                </p>
              </NotebookVintageField>

              {word.example_vi && (
                <NotebookVintageField
                  testId="notebook-field-vietnamese"
                  label={t('mastery.notebook.vietnameseShort')}
                  className="border-t-0 pt-0"
                >
                  <p className="notebook-line-text notebook-engraved-text text-base font-bold italic text-primary">
                    {word.example_vi}
                  </p>
                </NotebookVintageField>
              )}

              {word.example && (
                <section data-testid="notebook-field-example">
                  <div
                    data-testid="notebook-quote-card"
                    className="notebook-line-text notebook-on-rule-text flex items-start gap-3 rounded-lg border-l-4 border-secondary/20 bg-surface-container-low/40 px-3 py-0"
                  >
                    <span className="material-symbols-outlined text-secondary">format_quote</span>
                    <p className="notebook-line-text notebook-engraved-text text-base italic text-on-surface-variant">
                      {word.example}
                    </p>
                  </div>
                </section>
              )}
            </div>

            <section
              data-testid="notebook-related-words"
              className="notebook-line-text notebook-on-rule-text space-y-4 bg-transparent"
            >
              <NotebookVintageField
                testId="notebook-field-word-family"
                label={t('mastery.notebook.wordFamily')}
              >
                <NotebookVintageTerms terms={wordFamily} tone="ink" />
              </NotebookVintageField>

              <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/10 pt-4">
                <NotebookVintageField
                  testId="notebook-field-synonyms"
                  label={t('mastery.notebook.synonyms')}
                  className="border-t-0 pt-0"
                >
                  <NotebookVintageTerms terms={synonyms} tone="sage" />
                </NotebookVintageField>

                <NotebookVintageField
                  testId="notebook-field-antonyms"
                  label={t('mastery.notebook.antonyms')}
                  className="border-t-0 pt-0"
                >
                  <NotebookVintageTerms terms={antonyms} tone="terracotta" />
                </NotebookVintageField>
              </div>

              <NotebookVintageField
                testId="notebook-field-collocations"
                label={t('mastery.notebook.collocations')}
              >
                <NotebookVintageTerms terms={collocations} tone="ink" />
              </NotebookVintageField>

              {relatedTerms.length > 0 && (
                <section
                  data-testid="notebook-smart-vocabulary"
                  className="relative rounded-xl border border-secondary/10 bg-secondary-container/20 p-4"
                >
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined absolute right-4 top-4 text-4xl text-secondary opacity-10"
                  >
                    psychology
                  </span>
                  <h5 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
                    {t('mastery.notebook.smartVocabulary')}
                  </h5>
                  <NotebookVintageTerms terms={relatedTerms} tone="sage" />
                </section>
              )}

              <section className="relative pb-3 pt-3">
                <div
                  data-testid="notebook-sticky-note"
                  className={classes(
                    'font-handwriting notebook-line-text notebook-on-rule-text sticky-note group/sticky relative ml-auto flex origin-top-right flex-col overflow-hidden rotate-[-0.7deg] rounded-sm border border-black/10 shadow-[0_24px_30px_-22px_rgba(87,64,32,0.45),0_14px_18px_-16px_rgba(40,30,20,0.35),inset_0_1px_0_rgba(255,255,255,0.62)]',
                    isEditing
                      ? 'aspect-[4/3] w-[min(34rem,76%)] max-w-[34rem]'
                      : 'aspect-[1/1] w-[min(15rem,42%)] max-w-[15rem]',
                    stickyTheme.note,
                    stickyTheme.text,
                  )}
                >
                  <div
                    data-testid="notebook-sticky-note-paper-edge"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 top-0 z-10 h-5 rounded-[50%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.64),rgba(255,255,255,0.18)_42%,transparent_72%)] opacity-70"
                  />
                  <div
                    data-testid="notebook-sticky-note-corner-lift"
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-0 z-10 h-10 w-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.58),rgba(255,255,255,0.16)_48%,rgba(87,64,32,0.14)_49%,transparent_70%)] opacity-75"
                  />
                  <div
                    data-testid="notebook-sticky-note-toolbar"
                    className={classes(
                      'relative z-20 flex h-10 shrink-0 items-center justify-between border-b border-black/10 px-3 font-sans shadow-[inset_0_-1px_0_rgba(255,255,255,0.45)]',
                      stickyTheme.toolbar,
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-current opacity-70">
                        {t('mastery.notebook.personalNote')}
                      </h4>
                    </div>
                    {isEditing ? (
                      <div
                        data-testid="notebook-sticky-note-actions"
                        className="flex shrink-0 items-center gap-1"
                      >
                        <button
                          type="button"
                          data-testid="notebook-sticky-cancel-button"
                          onClick={onCancelEdit}
                          aria-label={t('mastery.notebook.cancelEdit')}
                          className={classes(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors active:scale-95',
                            stickyTheme.control,
                          )}
                        >
                          <span className="material-symbols-outlined text-[17px]">close</span>
                        </button>
                        <button
                          type="button"
                          data-testid="notebook-sticky-save-button"
                          onClick={onSaveEdit}
                          aria-label={t('mastery.notebook.saveNote')}
                          className={classes(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors active:scale-95',
                            stickyTheme.activeControl,
                          )}
                        >
                          <span className="material-symbols-outlined text-[17px]">check</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        data-testid="notebook-sticky-idle-actions"
                        className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover/sticky:opacity-100 focus-within:opacity-100"
                      >
                        <button
                          type="button"
                          data-testid="notebook-sticky-edit-button"
                          onClick={onStartEdit}
                          aria-label={t('mastery.notebook.editNote')}
                          className={classes(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors active:scale-95',
                            stickyTheme.control,
                          )}
                        >
                          <span className="material-symbols-outlined text-[17px]">edit_note</span>
                        </button>
                        <button
                          type="button"
                          data-testid="notebook-sticky-menu-button"
                          onClick={() => setStickyMenuOpen((current) => !current)}
                          aria-label={t('mastery.notebook.noteMenu')}
                          className={classes(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors active:scale-95',
                            stickyTheme.control,
                          )}
                        >
                          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {stickyMenuOpen && (
                    <div
                      data-testid="notebook-sticky-menu"
                      className="absolute right-2 top-11 z-40 w-56 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-2 font-sans text-on-surface shadow-[0_16px_34px_rgba(40,30,20,0.22)]"
                    >
                      <div className="mb-2 grid grid-cols-6 gap-1 border-b border-outline-variant/10 pb-2">
                        {STICKY_NOTE_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            data-testid={`notebook-sticky-color-${color}`}
                            onClick={() => {
                              setStickyNoteColor(color)
                              setStickyMenuOpen(false)
                            }}
                            aria-label={t(`mastery.notebook.stickyColors.${color}`)}
                            className={classes(
                              'h-7 w-7 rounded-full border border-black/10 transition-transform hover:scale-110 active:scale-95',
                              STICKY_NOTE_THEMES[color].swatch,
                              stickyNoteColor === color && 'ring-2 ring-on-surface/25',
                            )}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        data-testid="notebook-sticky-copy-button"
                        onClick={() => void copyNote()}
                        disabled={!entry.personal_note}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        {t('mastery.notebook.copyNote')}
                      </button>
                      <button
                        type="button"
                        data-testid="notebook-sticky-clear-button"
                        onClick={() => void clearNote()}
                        disabled={!entry.personal_note}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        {t('mastery.notebook.clearNote')}
                      </button>
                    </div>
                  )}

                  <div
                    data-testid="notebook-field-note"
                    className="relative z-20 flex min-h-0 flex-1 flex-col px-4 pb-3 pt-3"
                  >
                    {isEditing ? (
                      <div className="min-h-0 flex-1 overflow-hidden font-sans">
                        <Suspense fallback={<div className="p-4 text-sm text-on-surface-variant">{t('common.loading')}</div>}>
                          <RichNoteEditor
                            content={draftNote}
                            onChange={onDraftChange}
                            placeholder={t('notebook.notePlaceholder')}
                          />
                        </Suspense>
                      </div>
                    ) : (
                      <div className={classes('prose prose-sm notebook-line-text max-w-none overflow-hidden text-xl leading-snug text-current', !entry.personal_note && 'opacity-55')}>
                        {entry.personal_note ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {entry.personal_note}
                          </ReactMarkdown>
                        ) : (
                          <p>{t('notebook.noNote')}</p>
                        )}
                      </div>
                    )}
                    {!isEditing && (
                      <p
                        data-testid="notebook-sticky-note-status"
                        className="mt-auto border-t border-black/10 pt-2 font-sans text-[9px] font-black uppercase tracking-widest opacity-55"
                      >
                        {t('mastery.notebook.noteStats', {
                          words: noteStats.words,
                          characters: noteStats.characters,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </section>
          </div>
        </article>
      ) : (
        <div className="relative">
          <NotebookBlankPageLines />
        </div>
      )}
    </section>
  )
}

function NotebookBlankPageLines() {
  return (
    <div className="space-y-5 py-3" aria-hidden="true">
      {Array.from({ length: 11 }).map((_, index) => (
        <div
          key={index}
          className={classes(
            'h-px rounded-full bg-outline-variant/15',
            index % 4 === 0 ? 'w-3/4' : 'w-full',
          )}
        />
      ))}
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
          <p className="text-xl font-black text-on-surface">{t('mastery.notebook.emptyTitle')}</p>
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
