import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FilterType } from '../../hooks/useMasteryWords'
import { getMasteryWordDetail } from '../../lib/storage/mastery'
import type { MasteryStats, MasteryWord, MasteryWordDetail } from '../../lib/types'

export interface MobileMasteryAdvancedFilters {
  roadmapId: string | null
  stability: string | null
  abcLetter: string | null
  sortBy: string
}

interface MobileMasteryRoadmapOption {
  id: string
  name: string
}

interface MobileMasteryViewProps {
  words: MasteryWord[]
  stats: MasteryStats | null
  totalCount: number
  loading: boolean
  loadingMore: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeFilter: FilterType
  setActiveFilter: (filter: FilterType) => void
  selectedIds: Set<string>
  onToggleSelect: (wordId: string, event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => void
  onStartFreeStudy: () => void
  onStartWordSetStudy: (words: MasteryWord[]) => void
  notebookCount: number
  onOpenNotebook: () => void
  isNotebookSaved: (wordId: string) => boolean
  onToggleNotebook: (wordId: string, event?: React.MouseEvent) => Promise<void>
  getNote: (wordId: string) => string | null
  onSaveNote: (wordId: string, note: string) => Promise<void>
  roadmaps?: MobileMasteryRoadmapOption[]
  advancedFilters?: MobileMasteryAdvancedFilters
  onAdvancedFilterChange?: (filters: Partial<MobileMasteryAdvancedFilters>) => void
  lastElementRef: (node: HTMLElement | null) => void
}

const FILTERS: FilterType[] = ['all', 'due', 'weak', 'mastered']
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const INBOX_PREVIEW_LIMIT = 3
const DEFAULT_ADVANCED_FILTERS: MobileMasteryAdvancedFilters = {
  roadmapId: null,
  stability: null,
  abcLetter: null,
  sortBy: 'date',
}
type MobileMasteryMode = 'inbox' | 'archive'
type MobileMasteryQueueKey = 'due' | 'weak' | 'saved'
type MobileDossierTab = 'overview' | 'linguistic' | 'notes' | 'stats'

export interface MobileMasteryQueues {
  due: MasteryWord[]
  weak: MasteryWord[]
  saved: MasteryWord[]
}

function isWordDue(word: MasteryWord, now = new Date()) {
  if (!word.next_review_at) return false
  return new Date(word.next_review_at) <= now
}

function isWordWeak(word: MasteryWord) {
  return !word.mastered && (Number(word.fsrs_stability ?? 0) < 10 || Number(word.fsrs_lapses ?? 0) > 0)
}

function getTopicName(word: MasteryWord) {
  return word.topic_names?.split(',')[0]?.trim() || null
}

function formatReviewDate(word: MasteryWord, t: (key: string) => string) {
  if (!word.next_review_at) return t('mastery.mobile.noReview')
  if (isWordDue(word)) return t('mastery.mobile.dueNow')
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(word.next_review_at))
}

export function getMobileMasteryQueues(
  words: MasteryWord[],
  isNotebookSaved: (wordId: string) => boolean,
  now = new Date(),
): MobileMasteryQueues {
  const due = words
    .filter(word => isWordDue(word, now))
    .sort((left, right) => {
      const leftTime = left.next_review_at ? new Date(left.next_review_at).getTime() : Number.MAX_SAFE_INTEGER
      const rightTime = right.next_review_at ? new Date(right.next_review_at).getTime() : Number.MAX_SAFE_INTEGER
      return leftTime - rightTime
    })

  const weak = words
    .filter(isWordWeak)
    .sort((left, right) => {
      const stabilityDelta = Number(left.fsrs_stability ?? 0) - Number(right.fsrs_stability ?? 0)
      if (stabilityDelta !== 0) return stabilityDelta
      return Number(right.fsrs_lapses ?? 0) - Number(left.fsrs_lapses ?? 0)
    })

  const saved = words.filter(word => isNotebookSaved(word.word_id))

  return { due, weak, saved }
}

export default function MobileMasteryView({
  words,
  stats,
  totalCount,
  loading,
  loadingMore,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  selectedIds,
  onToggleSelect,
  onStartFreeStudy,
  onStartWordSetStudy,
  notebookCount,
  onOpenNotebook,
  isNotebookSaved,
  onToggleNotebook,
  getNote,
  onSaveNote,
  roadmaps = [],
  advancedFilters = DEFAULT_ADVANCED_FILTERS,
  onAdvancedFilterChange,
  lastElementRef,
}: MobileMasteryViewProps) {
  const { t } = useTranslation()
  const [activeMode, setActiveMode] = useState<MobileMasteryMode>('inbox')
  const [selectedWord, setSelectedWord] = useState<MasteryWord | null>(null)
  const [detailCache, setDetailCache] = useState<Record<string, MasteryWordDetail | null>>({})
  const [activeDossierTab, setActiveDossierTab] = useState<MobileDossierTab>('overview')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [draftNote, setDraftNote] = useState('')

  const inboxQueues = useMemo(
    () => getMobileMasteryQueues(words, isNotebookSaved),
    [words, isNotebookSaved],
  )
  const selectionActive = selectionMode

  const openWordDetail = (word: MasteryWord) => {
    setSelectedWord(word)
    setActiveDossierTab('overview')
    setIsEditingNote(false)
    setDraftNote(getNote(word.word_id) || '')
    if (Object.prototype.hasOwnProperty.call(detailCache, word.word_id)) return
    void getMasteryWordDetail(word.word_id).then((detail) => {
      setDetailCache(current => (
        Object.prototype.hasOwnProperty.call(current, word.word_id)
          ? current
          : { ...current, [word.word_id]: detail }
      ))
    })
  }

  const openArchiveQueue = (queue: MobileMasteryQueueKey) => {
    if (queue === 'due' || queue === 'weak') {
      setActiveFilter(queue)
    } else {
      setActiveFilter('all')
    }
    setActiveMode('archive')
  }

  const handleSaveNote = async () => {
    if (!selectedWord) return
    await onSaveNote(selectedWord.word_id, draftNote)
    setIsEditingNote(false)
  }

  const renderInboxQueue = (queue: MobileMasteryQueueKey, queueWords: MasteryWord[]) => {
    const previewWords = queueWords.slice(0, INBOX_PREVIEW_LIMIT)

    return (
      <section
        key={queue}
        data-mobile-mastery-queue={queue}
        className="mobile-panel p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-medium text-on-surface">{t(`mastery.mobile.queues.${queue}`)}</h2>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">
              {t('mastery.mobile.selectedCount', { count: queueWords.length })}
            </p>
          </div>
          <span className="rounded-full bg-primary-container px-3 py-1 text-sm font-medium text-on-primary-container">
            {queueWords.length}
          </span>
        </div>

        {previewWords.length > 0 ? (
          <div className="mt-3 space-y-2">
            {previewWords.map((word) => (
              <button
                key={word.word_id}
                type="button"
                onClick={() => openWordDetail(word)}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl bg-surface-container-low px-3 py-2 text-left active:scale-95"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-on-surface">{word.word}</span>
                  <span className="block truncate text-xs font-medium text-on-surface-variant/70">{word.definition}</span>
                </span>
                <span className="shrink-0 text-xs font-medium text-on-surface-variant">
                  {Math.round(Number(word.fsrs_stability ?? 0))}d
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl bg-surface-container-low px-3 py-3 text-sm font-medium text-on-surface-variant">
            {t(`mastery.mobile.emptyQueue.${queue}`)}
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          {queueWords.length > 0 && (
            <button
              type="button"
              onClick={() => onStartWordSetStudy(queueWords)}
              className="flex min-h-11 items-center justify-center rounded-2xl bg-primary px-3 text-sm font-medium text-on-primary active:scale-95"
            >
              {t('mastery.mobile.queueActions.study')}
            </button>
          )}
          <button
            type="button"
            onClick={() => openArchiveQueue(queue)}
            className={`flex min-h-11 items-center justify-center rounded-2xl bg-surface px-3 text-sm font-medium text-primary active:scale-95 ${
              queueWords.length > 0 ? '' : 'col-span-2'
            }`}
          >
            {t('mastery.mobile.queueActions.viewAll')}
          </button>
        </div>
      </section>
    )
  }

  const selectedWordDetail = selectedWord ? detailCache[selectedWord.word_id] : null

  return (
    <main data-mobile-mastery className="mobile-page min-h-full">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-medium tracking-tight text-on-surface">
              {t('mastery.mobile.title')}
            </h1>
            <p className="mt-1 text-sm font-medium leading-5 text-on-surface-variant">
              {t('mastery.mobile.summaryInbox', { due: stats?.due ?? 0, total: totalCount })}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNotebook}
            className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container px-3 text-sm font-medium text-on-primary-container active:scale-95"
            aria-label={t('mastery.mobile.openNotebook')}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">menu_book</span>
            <span className="ml-1 tabular-nums">{notebookCount}</span>
          </button>
        </div>

        <div className="grid min-h-11 grid-cols-2 rounded-2xl bg-surface-container-low p-1">
          {(['inbox', 'archive'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setActiveMode(mode)}
              aria-pressed={activeMode === mode}
              className={`rounded-xl text-sm font-medium outline-hidden transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                activeMode === mode ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              {t(`mastery.mobile.modes.${mode}`)}
            </button>
          ))}
        </div>
      </header>

      {activeMode === 'inbox' ? (
        <section data-mobile-mastery-inbox className="mt-4 space-y-3">
          {renderInboxQueue('due', inboxQueues.due)}
          {renderInboxQueue('weak', inboxQueues.weak)}
          {renderInboxQueue('saved', inboxQueues.saved)}
        </section>
      ) : (
        <>
          <section data-mobile-mastery-archive-controls className="sticky top-[4.75rem] z-20 mt-4 bg-surface py-2">
            <div className="flex items-center gap-2">
              <label className="relative min-w-0 flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/45" aria-hidden="true">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t('mastery.mobile.searchPlaceholder')}
                  className="min-h-11 w-full rounded-[8px] border-0 bg-surface-container-low pl-10 pr-3 text-sm font-medium text-on-surface outline-hidden transition placeholder:text-on-surface-variant/55 focus:ring-2 focus:ring-primary/15"
                />
              </label>

              <button
                type="button"
                onClick={() => setFiltersOpen(open => !open)}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] active:scale-95 ${
                  filtersOpen ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}
                aria-expanded={filtersOpen}
                aria-label={t('mastery.mobile.filtersLabel')}
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">tune</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectionMode(active => !active)}
                className={`flex h-11 shrink-0 items-center rounded-[8px] px-3 text-xs font-medium active:scale-95 ${
                  selectionActive ? 'bg-primary-container text-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                {selectionActive ? t('mastery.mobile.selectionDone') : t('mastery.mobile.selectionOn')}
              </button>
            </div>

            <div className="mt-2 grid grid-cols-4 gap-1.5">
                {FILTERS.map((filter) => {
                  const active = activeFilter === filter

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`flex min-h-10 items-center justify-center rounded-[6px] px-2 text-[12px] font-medium transition-all active:scale-95 ${
                        active
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-transparent text-on-surface-variant'
                      }`}
                    >
                      {t(`mastery.mobile.filterShorts.${filter}`)}
                    </button>
                  )
                })}
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-2 px-0.5">
              <p className="min-w-0 truncate text-[11px] font-medium text-on-surface-variant/70">
                {t('mastery.mobile.archiveSummary', {
                  total: totalCount,
                  due: stats?.due ?? 0,
                  weak: stats?.weak ?? 0,
                })}
              </p>
              <p className="shrink-0 text-[11px] font-medium text-on-surface-variant/70">
                {t('mastery.mobile.archiveResults', { count: words.length })}
              </p>
            </div>
          </section>

      {filtersOpen && (
        <section className="mt-2 space-y-3 rounded-[8px] bg-surface-container-lowest p-3 shadow-sm ring-1 ring-outline-variant/30">
          <div className="grid grid-cols-1 gap-3">
            <select
              aria-label={t('mastery.filters.allRoadmaps')}
              value={advancedFilters.roadmapId ?? ''}
              onChange={(event) => onAdvancedFilterChange?.({ roadmapId: event.target.value || null })}
              className="min-h-11 rounded-[8px] border border-outline-variant/30 bg-surface px-4 text-sm font-medium text-on-surface outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            >
              <option value="">{t('mastery.filters.allRoadmaps')}</option>
              {roadmaps.map((roadmap) => (
                <option key={roadmap.id} value={roadmap.id}>{roadmap.name}</option>
              ))}
            </select>

            <select
              aria-label={t('mastery.filters.allStability')}
              value={advancedFilters.stability ?? ''}
              onChange={(event) => onAdvancedFilterChange?.({ stability: event.target.value || null })}
              className="min-h-11 rounded-[8px] border border-outline-variant/30 bg-surface px-4 text-sm font-medium text-on-surface outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            >
              <option value="">{t('mastery.filters.allStability')}</option>
              {['fresh', 'learning', 'mastered', 'rooted'].map((stability) => (
                <option key={stability} value={stability}>
                  {t(`mastery.filters.stability.${stability}`)}
                </option>
              ))}
            </select>

            <select
              aria-label={t('mastery.filters.sortBy')}
              value={advancedFilters.sortBy}
              onChange={(event) => onAdvancedFilterChange?.({ sortBy: event.target.value })}
              className="min-h-11 rounded-[8px] border border-outline-variant/30 bg-surface px-4 text-sm font-medium text-on-surface outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            >
              {['date', 'stability', 'alphabetical'].map((sortBy) => (
                <option key={sortBy} value={sortBy}>{t(`mastery.filters.sort.${sortBy}`)}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => onAdvancedFilterChange?.({ abcLetter: null })}
              className={`flex h-11 min-w-11 items-center justify-center rounded-[8px] text-xs font-medium ${
                advancedFilters.abcLetter === null ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              {t('mastery.filters.all')}
            </button>
            {LETTERS.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => onAdvancedFilterChange?.({ abcLetter: letter })}
                className={`flex h-11 min-w-11 items-center justify-center rounded-[8px] text-xs font-medium ${
                  advancedFilters.abcLetter === letter ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}
                aria-pressed={advancedFilters.abcLetter === letter}
              >
                {letter}
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedIds.size > 0 && (
        <button
          type="button"
          onClick={onStartFreeStudy}
          className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-primary px-4 text-sm font-medium text-on-primary shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">bolt</span>
          {t('mastery.mobile.studySelected')}
          <span className="rounded-full bg-on-primary/15 px-2 py-0.5 text-[11px]">
            {t('mastery.mobile.selectedCount', { count: selectedIds.size })}
          </span>
        </button>
      )}

      <section data-mobile-mastery-archive-list className="mt-2">
        {loading && words.length === 0 ? (
          Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-24 animate-pulse bg-surface-container-low" />
          ))
        ) : words.length === 0 ? (
          <div className="bg-surface-container-low p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined" aria-hidden="true">folder_off</span>
            </div>
            <h2 className="mt-4 text-lg font-medium text-on-surface">{t('mastery.mobile.emptyTitle')}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">{t('mastery.mobile.emptyDesc')}</p>
          </div>
        ) : (
          words.map((word, index) => {
            const selected = selectedIds.has(word.word_id)
            const saved = isNotebookSaved(word.word_id)
            const note = getNote(word.word_id)
            const topicName = getTopicName(word)

            return (
              <article
                key={word.word_id}
                ref={index === words.length - 1 ? lastElementRef : undefined}
                data-mobile-mastery-card={word.word_id}
                data-mobile-mastery-row={word.word_id}
                className={`rounded-none bg-surface-container-lowest px-3 py-2 transition-all ${
                  selected ? 'border-l-2 border-primary bg-primary-container/20' : 'border-l-2 border-transparent'
                }`}
                onClick={(event) => {
                  if (selectionMode) {
                    onToggleSelect(word.word_id, event)
                    return
                  }
                  openWordDetail(word)
                }}
              >
                <div className="flex min-h-14 items-center gap-2">
                  {selectionMode && (
                    <div className="flex h-11 w-9 shrink-0 items-center justify-start">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(event) => onToggleSelect(word.word_id, event)}
                        onClick={(event) => event.stopPropagation()}
                        className="h-6 w-6 rounded-sm border-outline-variant text-primary accent-primary"
                        aria-label={t('mastery.mobile.selectWord', { word: word.word })}
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <h2 className="truncate text-base font-medium leading-tight text-on-surface">{word.word}</h2>
                      {word.phonetic && (
                        <span className="shrink truncate font-mono text-[11px] font-medium text-on-surface-variant/65">
                          /{word.phonetic.replace(/\//g, '')}/
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-[13px] font-medium leading-5 text-on-surface-variant">
                      {word.definition}
                    </p>

                    <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[11px] font-medium text-on-surface-variant/70">
                      {topicName && <span className="truncate">{topicName}</span>}
                      {note && (
                        <span className="shrink-0 rounded-[6px] bg-primary-container/70 px-2 py-0.5 text-[10px] text-on-primary-container">
                          {t('mastery.mobile.note')}
                        </span>
                      )}
                      <span className={`shrink-0 rounded-[6px] px-2 py-0.5 text-[10px] ${
                        isWordDue(word) ? 'bg-primary/90 text-on-primary' : 'bg-surface-container-low/70 text-on-surface-variant'
                      }`}>
                        {formatReviewDate(word, t)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="w-7 text-right text-xs font-medium tabular-nums text-on-surface-variant">
                      {Math.round(Number(word.fsrs_stability ?? 0))}d
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onToggleNotebook(word.word_id, event)
                      }}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] transition-all active:scale-95 ${
                        saved ? 'text-primary' : 'text-on-surface-variant/55'
                      }`}
                      aria-label={saved
                        ? t('mastery.mobile.unsaveWord', { word: word.word })
                        : t('mastery.mobile.saveWord', { word: word.word })}
                    >
                      <span
                        className="material-symbols-outlined text-[24px]"
                        style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
                        aria-hidden="true"
                      >
                        favorite
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </section>

      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
      )}
        </>
      )}

      {selectedWord && (
        <div className="fixed inset-0 z-70 flex items-end bg-scrim/35 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" onClick={() => setSelectedWord(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={t('mastery.mobile.detailTitle')}
            data-mobile-mastery-detail={selectedWord.word_id}
            data-mobile-word-dossier={selectedWord.word_id}
            className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-surface-container-lowest p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-outline-variant" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-secondary">{t('mastery.mobile.detailTitle')}</p>
                <h2 className="mt-1 text-xl font-medium leading-tight text-on-surface">{selectedWord.word}</h2>
                {selectedWord.phonetic && (
                  <p className="mt-1 font-mono text-xs font-medium text-on-surface-variant/65">
                    /{selectedWord.phonetic.replace(/\//g, '')}/
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedWord(null)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant"
                aria-label={t('common.close')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-1 rounded-2xl bg-surface-container-low p-1">
              {(['overview', 'linguistic', 'notes', 'stats'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveDossierTab(tab)
                    setIsEditingNote(false)
                  }}
                  aria-pressed={activeDossierTab === tab}
                  className={`min-h-11 rounded-xl px-2 text-xs font-medium ${
                    activeDossierTab === tab ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  {t(`mastery.mobile.dossier.tabs.${tab}`)}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              {activeDossierTab === 'overview' && (
                <>
                  <section className="rounded-2xl bg-surface p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/65">
                      {t('mastery.mobile.dossier.tabs.overview')}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-on-surface">{selectedWord.definition}</p>
                    {selectedWord.example && (
                      <p className="mt-3 border-l-4 border-secondary/40 pl-3 text-sm italic leading-6 text-on-surface-variant">
                        {selectedWord.example}
                      </p>
                    )}
                    {selectedWordDetail?.example_vi && (
                      <div className="mt-3 rounded-2xl bg-secondary-container/70 p-3 text-on-secondary-container">
                        <p className="text-[11px] font-medium uppercase tracking-wider">
                          {t('mastery.mobile.dossier.exampleVi')}
                        </p>
                        <p className="mt-1 text-sm font-medium leading-6">{selectedWordDetail.example_vi}</p>
                      </div>
                    )}
                  </section>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-surface p-3 text-center">
                      <p className="text-base font-medium tabular-nums text-on-surface">{selectedWord.fsrs_reps}</p>
                      <p className="text-[10px] font-medium text-on-surface-variant">{t('mastery.mobile.reps', { count: selectedWord.fsrs_reps })}</p>
                    </div>
                    <div className="rounded-2xl bg-surface p-3 text-center">
                      <p className="text-base font-medium tabular-nums text-on-surface">{selectedWord.fsrs_lapses}</p>
                      <p className="text-[10px] font-medium text-on-surface-variant">{t('mastery.mobile.lapses', { count: selectedWord.fsrs_lapses })}</p>
                    </div>
                    <div className="rounded-2xl bg-surface p-3 text-center">
                      <p className="text-base font-medium tabular-nums text-on-surface">{Math.round(selectedWord.fsrs_stability)}d</p>
                      <p className="text-[10px] font-medium text-on-surface-variant">{t('mastery.mobile.strength')}</p>
                    </div>
                  </div>
                </>
              )}

              {activeDossierTab === 'linguistic' && (
                <section className="space-y-3 rounded-2xl bg-surface p-4">
                  {selectedWordDetail && (
                    <>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/65">{t('mastery.mobile.dossier.partOfSpeech')}</p>
                        <p className="mt-1 text-sm font-medium text-on-surface">{selectedWordDetail.pos || t('mastery.mobile.dossier.noLinguisticData')}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/65">{t('mastery.mobile.dossier.difficulty')}</p>
                        <p className="mt-1 text-sm font-medium text-on-surface">{selectedWordDetail.difficulty ?? t('mastery.mobile.dossier.noLinguisticData')}</p>
                      </div>
                      {[
                        ['wordFamily', selectedWordDetail.word_family],
                        ['synonyms', selectedWordDetail.synonyms],
                        ['antonyms', selectedWordDetail.antonyms],
                      ].map(([key, values]) => (
                        <div key={key as string}>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/65">
                            {t(`mastery.mobile.dossier.${key as string}`)}
                          </p>
                          {(values as string[]).length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(values as string[]).map((value) => (
                                <span key={value} className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant">
                                  {value}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-sm font-medium text-on-surface-variant">{t('mastery.mobile.dossier.noLinguisticData')}</p>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                  {!selectedWordDetail && (
                    <p className="text-sm font-medium text-on-surface-variant">{t('mastery.mobile.dossier.noLinguisticData')}</p>
                  )}
                </section>
              )}

              {activeDossierTab === 'notes' && (
                <section className="rounded-2xl bg-primary-container/60 p-4 text-on-primary-container">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider">{t('mastery.mobile.note')}</p>
                    {!isEditingNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setDraftNote(getNote(selectedWord.word_id) || '')
                          setIsEditingNote(true)
                        }}
                        className="flex min-h-11 items-center justify-center rounded-2xl bg-surface/60 px-3 text-xs font-medium text-primary active:scale-95"
                      >
                        {t('mastery.mobile.editNote')}
                      </button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div className="mt-3 space-y-3">
                      <textarea
                        value={draftNote}
                        onChange={(event) => setDraftNote(event.target.value)}
                        placeholder={t('mastery.mobile.notePlaceholder')}
                        className="min-h-28 w-full resize-none rounded-2xl border border-primary/15 bg-surface px-4 py-3 text-sm font-medium leading-6 text-on-surface outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDraftNote(getNote(selectedWord.word_id) || '')
                            setIsEditingNote(false)
                          }}
                          className="min-h-11 rounded-2xl bg-surface/60 px-4 text-sm font-medium text-primary"
                        >
                          {t('mastery.mobile.cancelNote')}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNote}
                          className="min-h-11 rounded-2xl bg-primary px-4 text-sm font-medium text-on-primary"
                        >
                          {t('mastery.mobile.saveNote')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-medium leading-6">
                      {getNote(selectedWord.word_id) || t('mastery.mobile.noNote')}
                    </p>
                  )}
                </section>
              )}

              {activeDossierTab === 'stats' && (
                <section className="space-y-3 rounded-2xl bg-surface p-4">
                  {[
                    [t('mastery.mobile.strength'), `${Math.round(selectedWord.fsrs_stability)}d`],
                    [t('mastery.mobile.reps', { count: selectedWord.fsrs_reps }), selectedWord.fsrs_reps],
                    [t('mastery.mobile.lapses', { count: selectedWord.fsrs_lapses }), selectedWord.fsrs_lapses],
                    [t('mastery.mobile.nextReview'), formatReviewDate(selectedWord, t)],
                    [t('mastery.mobile.dossier.difficulty'), selectedWordDetail?.difficulty ?? selectedWord.fsrs_difficulty],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-surface-container-low px-3">
                      <span className="text-xs font-medium text-on-surface-variant">{label}</span>
                      <span className="text-sm font-medium tabular-nums text-on-surface">{value}</span>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
