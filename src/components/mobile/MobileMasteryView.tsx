import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FilterType } from '../../hooks/useMasteryWords'
import type { MasteryStats, MasteryWord } from '../../lib/types'

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
  notebookCount: number
  onOpenNotebook: () => void
  isNotebookSaved: (wordId: string) => boolean
  onToggleNotebook: (wordId: string, event?: React.MouseEvent) => Promise<void>
  getNote: (wordId: string) => string | null
  onSaveNote: (note: string) => Promise<void>
  lastElementRef: (node: HTMLElement | null) => void
}

const FILTERS: FilterType[] = ['all', 'due', 'weak', 'mastered']

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

function getStrengthPercent(word: MasteryWord) {
  return clampPercent((Number(word.fsrs_stability ?? 0) / 21) * 100)
}

function isWordDue(word: MasteryWord) {
  if (!word.next_review_at) return false
  return new Date(word.next_review_at) <= new Date()
}

function getTopicName(word: MasteryWord) {
  return word.topic_names?.split(',')[0]?.trim() || null
}

function formatReviewDate(word: MasteryWord, t: (key: string) => string) {
  if (!word.next_review_at) return t('mastery.mobile.noReview')
  if (isWordDue(word)) return t('mastery.mobile.dueNow')
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(word.next_review_at))
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
  notebookCount,
  onOpenNotebook,
  isNotebookSaved,
  onToggleNotebook,
  getNote,
  lastElementRef,
}: MobileMasteryViewProps) {
  const { t } = useTranslation()
  const [selectedWord, setSelectedWord] = useState<MasteryWord | null>(null)

  const statCards = useMemo(() => [
    { key: 'learning', label: t('mastery.stats.learning'), value: stats?.learning ?? 0, icon: 'school' },
    { key: 'due', label: t('mastery.stats.due'), value: stats?.due ?? 0, icon: 'schedule' },
    { key: 'weak', label: t('mastery.stats.weak'), value: stats?.weak ?? 0, icon: 'trending_down' },
    { key: 'mastered', label: t('mastery.stats.mastered'), value: stats?.mastered ?? 0, icon: 'verified' },
  ], [stats, t])

  return (
    <main data-mobile-mastery className="min-h-full bg-surface px-4 pb-6 pt-3">
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              {t('mastery.filters.lexicalArchive')}
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-on-surface">
              {t('mastery.mobile.title')}
            </h1>
            <p className="mt-2 text-sm font-medium leading-5 text-on-surface-variant">
              {t('mastery.mobile.subtitle', { count: totalCount })}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNotebook}
            className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container px-3 text-sm font-bold text-on-primary-container active:scale-95"
            aria-label={t('mastery.mobile.openNotebook')}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">menu_book</span>
            <span className="ml-1 tabular-nums">{notebookCount}</span>
          </button>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/45" aria-hidden="true">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('mastery.mobile.searchPlaceholder')}
            className="min-h-12 w-full rounded-2xl border border-outline-variant/30 bg-surface-container-lowest pl-12 pr-4 text-sm font-medium text-on-surface outline-hidden transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </header>

      <section className="mt-4 grid grid-cols-4 gap-2" aria-label={t('mastery.mobile.statsLabel')}>
        {statCards.map((item) => (
          <div key={item.key} className="min-w-0 rounded-2xl bg-surface-container-lowest p-3 text-center shadow-sm ring-1 ring-outline-variant/30">
            <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">{item.icon}</span>
            <p className="mt-1 text-base font-bold tabular-nums text-on-surface">{item.value}</p>
            <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-tight text-on-surface-variant/65">{item.label}</p>
          </div>
        ))}
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`min-h-11 rounded-full px-3 text-[13px] font-bold transition-all active:scale-95 ${
                active
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              {t(`mastery.filters.${filter}`)}
            </button>
          )
        })}
      </div>

      {selectedIds.size > 0 && (
        <button
          type="button"
          onClick={onStartFreeStudy}
          className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-on-primary shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">bolt</span>
          {t('mastery.mobile.studySelected')}
          <span className="rounded-full bg-on-primary/15 px-2 py-0.5 text-[11px]">
            {t('mastery.mobile.selectedCount', { count: selectedIds.size })}
          </span>
        </button>
      )}

      <section className="mt-4 space-y-3">
        {loading && words.length === 0 ? (
          Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-3xl bg-surface-container-low" />
          ))
        ) : words.length === 0 ? (
          <div className="rounded-3xl bg-surface-container-low p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined" aria-hidden="true">folder_off</span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-on-surface">{t('mastery.mobile.emptyTitle')}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">{t('mastery.mobile.emptyDesc')}</p>
          </div>
        ) : (
          words.map((word, index) => {
            const selected = selectedIds.has(word.word_id)
            const saved = isNotebookSaved(word.word_id)
            const note = getNote(word.word_id)
            const strength = getStrengthPercent(word)
            const topicName = getTopicName(word)

            return (
              <article
                key={word.word_id}
                ref={index === words.length - 1 ? lastElementRef : undefined}
                data-mobile-mastery-card={word.word_id}
                className={`rounded-3xl border bg-surface-container-lowest p-4 shadow-sm transition-all ${
                  selected ? 'border-primary/50 ring-2 ring-primary/15' : 'border-outline-variant/30'
                }`}
                onClick={() => setSelectedWord(word)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => onToggleSelect(word.word_id, event)}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-1 h-5 w-5 rounded-md border-outline-variant text-primary accent-primary"
                    aria-label={t('mastery.mobile.selectWord', { word: word.word })}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold leading-tight text-on-surface">{word.word}</h2>
                        {word.phonetic && (
                          <p className="mt-1 truncate font-mono text-xs font-medium text-on-surface-variant/65">
                            /{word.phonetic.replace(/\//g, '')}/
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onToggleNotebook(word.word_id, event)
                        }}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all active:scale-95 ${
                          saved ? 'bg-primary-container text-primary' : 'bg-surface-container-low text-on-surface-variant/55'
                        }`}
                        aria-label={saved
                          ? t('mastery.mobile.unsaveWord', { word: word.word })
                          : t('mastery.mobile.saveWord', { word: word.word })}
                      >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
                          aria-hidden="true"
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-on-surface-variant">
                      {word.definition}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {topicName && (
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold text-on-secondary-container">
                      {topicName}
                    </span>
                  )}
                  {note && (
                    <span className="rounded-full bg-primary-container px-3 py-1 text-[11px] font-bold text-on-primary-container">
                      {t('mastery.mobile.note')}
                    </span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                    isWordDue(word) ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                  }`}>
                    {formatReviewDate(word, t)}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <span>{t('mastery.mobile.strength')}</span>
                    <span>{Math.round(Number(word.fsrs_stability ?? 0))}d</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${strength}%` }} />
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

      {selectedWord && (
        <div className="fixed inset-0 z-70 flex items-end bg-scrim/35 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" onClick={() => setSelectedWord(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={t('mastery.mobile.detailTitle')}
            data-mobile-mastery-detail={selectedWord.word_id}
            className="max-h-[82dvh] w-full overflow-y-auto rounded-t-3xl bg-surface-container-lowest p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-outline-variant" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">{t('mastery.mobile.detailTitle')}</p>
                <h2 className="mt-1 text-xl font-bold leading-tight text-on-surface">{selectedWord.word}</h2>
                {selectedWord.phonetic && (
                  <p className="mt-1 font-mono text-xs font-medium text-on-surface-variant/65">
                    /{selectedWord.phonetic.replace(/\//g, '')}/
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedWord(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant"
                aria-label={t('common.close')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <section className="rounded-2xl bg-surface p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/65">
                  {t('mastery.detail.definitionAndExample')}
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-on-surface">{selectedWord.definition}</p>
                {selectedWord.example && (
                  <p className="mt-3 border-l-4 border-secondary/40 pl-3 text-sm italic leading-6 text-on-surface-variant">
                    {selectedWord.example}
                  </p>
                )}
              </section>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-surface p-3 text-center">
                  <p className="text-base font-bold tabular-nums text-on-surface">{selectedWord.fsrs_reps}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant">{t('mastery.mobile.reps', { count: selectedWord.fsrs_reps })}</p>
                </div>
                <div className="rounded-2xl bg-surface p-3 text-center">
                  <p className="text-base font-bold tabular-nums text-on-surface">{selectedWord.fsrs_lapses}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant">{t('mastery.mobile.lapses', { count: selectedWord.fsrs_lapses })}</p>
                </div>
                <div className="rounded-2xl bg-surface p-3 text-center">
                  <p className="text-base font-bold tabular-nums text-on-surface">{Math.round(selectedWord.fsrs_stability)}d</p>
                  <p className="text-[10px] font-bold text-on-surface-variant">{t('mastery.mobile.strength')}</p>
                </div>
              </div>

              <section className="rounded-2xl bg-primary-container/60 p-4 text-on-primary-container">
                <p className="text-[11px] font-bold uppercase tracking-wider">{t('mastery.mobile.note')}</p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {getNote(selectedWord.word_id) || t('mastery.mobile.noNote')}
                </p>
              </section>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
