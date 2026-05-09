import {
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { NotebookWordEntry } from '../../lib/storage/notebook'
import {
  classes,
  cleanTerms,
  deriveCollocations,
  getNotebookLevelLabel,
  getNotebookPosAbbr,
  getNoteStats,
} from './notebook-utils'
import { RULED_PAPER_STYLE } from './notebook-styles'

const RichNoteEditor = lazy(() => import('../common/RichNoteEditor'))

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
    note: 'notebook-sticky-note-yellow',
    toolbar: 'notebook-sticky-toolbar-yellow',
    text: 'text-amber-950',
    control: 'text-amber-900/75 hover:bg-amber-900/10 hover:text-amber-950',
    activeControl: 'bg-amber-900/10 text-amber-950 hover:bg-amber-900/18',
    swatch: 'notebook-sticky-swatch-yellow',
  },
  green: {
    note: 'notebook-sticky-note-green',
    toolbar: 'notebook-sticky-toolbar-green',
    text: 'text-lime-950',
    control: 'text-lime-950/70 hover:bg-lime-950/10 hover:text-lime-950',
    activeControl: 'bg-lime-950/10 text-lime-950 hover:bg-lime-950/18',
    swatch: 'notebook-sticky-swatch-green',
  },
  blue: {
    note: 'notebook-sticky-note-blue',
    toolbar: 'notebook-sticky-toolbar-blue',
    text: 'text-slate-950',
    control: 'text-slate-900/70 hover:bg-slate-900/10 hover:text-slate-950',
    activeControl: 'bg-slate-900/10 text-slate-950 hover:bg-slate-900/18',
    swatch: 'notebook-sticky-swatch-blue',
  },
  pink: {
    note: 'notebook-sticky-note-pink',
    toolbar: 'notebook-sticky-toolbar-pink',
    text: 'text-rose-950',
    control: 'text-rose-950/70 hover:bg-rose-950/10 hover:text-rose-950',
    activeControl: 'bg-rose-950/10 text-rose-950 hover:bg-rose-950/18',
    swatch: 'notebook-sticky-swatch-pink',
  },
  purple: {
    note: 'notebook-sticky-note-purple',
    toolbar: 'notebook-sticky-toolbar-purple',
    text: 'text-violet-950',
    control: 'text-violet-950/70 hover:bg-violet-950/10 hover:text-violet-950',
    activeControl: 'bg-violet-950/10 text-violet-950 hover:bg-violet-950/18',
    swatch: 'notebook-sticky-swatch-purple',
  },
  charcoal: {
    note: 'notebook-sticky-note-charcoal',
    toolbar: 'notebook-sticky-toolbar-charcoal',
    text: 'text-stone-50',
    control: 'text-stone-50/70 hover:bg-white/10 hover:text-white',
    activeControl: 'bg-white/14 text-white hover:bg-white/20',
    swatch: 'notebook-sticky-swatch-charcoal',
  },
}

interface NotebookInvestigationPageProps {
  entry: NotebookWordEntry | null
  isEditing: boolean
  draftNote: string
  onStartEdit: () => void
  onDraftChange: (next: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => Promise<void>
  onClearNote: () => Promise<void>
}

export function NotebookInvestigationPage({
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
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
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

export function NotebookBlankPageLines() {
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
