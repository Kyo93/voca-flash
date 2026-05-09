import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { NotebookWordEntry } from '../../lib/storage/notebook'
import { classes, getNoteStats } from './notebook-utils'

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

interface NotebookStickyNoteProps {
  entry: NotebookWordEntry
  isEditing: boolean
  draftNote: string
  onStartEdit: () => void
  onDraftChange: (next: string) => void
  onCancelEdit: () => void
  onSaveEdit: () => Promise<void>
  onClearNote: () => Promise<void>
}

export function NotebookStickyNote({
  entry,
  isEditing,
  draftNote,
  onStartEdit,
  onDraftChange,
  onCancelEdit,
  onSaveEdit,
  onClearNote,
}: NotebookStickyNoteProps) {
  const { t } = useTranslation()
  const [stickyMenuOpen, setStickyMenuOpen] = useState(false)
  const [stickyNoteColor, setStickyNoteColor] = useState<StickyNoteColor>('yellow')
  const stickyTheme = STICKY_NOTE_THEMES[stickyNoteColor]
  const noteStats = getNoteStats(entry.personal_note)

  useEffect(() => {
    setStickyMenuOpen(false)
    setStickyNoteColor('yellow')
  }, [entry.word_id])

  const copyNote = async () => {
    if (!entry.personal_note) return

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
  )
}
