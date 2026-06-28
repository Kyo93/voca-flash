import { useTranslation } from 'react-i18next'
import type { NotebookWordEntry } from '../../lib/storage/notebook'
import {
  classes,
  getNotebookLevelLabel,
  type NotebookDensity,
} from './notebook-utils'
import { RULED_PAPER_STYLE } from './notebook-styles'

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

export function NotebookArchivePage({
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
            <h3 className="font-serif text-3xl font-medium text-primary">
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
          className="absolute bottom-10 left-10 z-10 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-outline"
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

  const levelLabel = getNotebookLevelLabel(word.difficulty)

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
              'notebook-line-text notebook-engraved-text font-serif font-medium tracking-normal transition-colors',
              selected ? 'text-primary' : 'text-on-surface group-hover:text-primary',
              compact ? 'text-base' : 'text-xl',
            )}
          >
            {word.word}
          </h4>
          {levelLabel && (
            <span
              className={classes(
                'rounded-md border border-warm-accent/35 px-2 py-0.5 text-[10px] font-semibold uppercase leading-none',
                selected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary',
              )}
            >
              {levelLabel}
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
      className={classes('relative', className)}
    >
      <h5
        data-testid="notebook-visual-mnemonic-label"
        className="sr-only font-label text-[10px] font-medium uppercase tracking-[0.14em] text-outline"
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
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgba(230,126,34,0.32),transparent_44%),var(--color-surface-container-low)] text-5xl font-semibold text-primary">
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
