import { useTranslation } from 'react-i18next'
import type { NotebookWordEntry } from '../../lib/storage/notebook'
import {
  classes,
  cleanTerms,
  deriveCollocations,
  getNotebookLevelLabel,
  getNotebookPosAbbr,
} from './notebook-utils'
import { RULED_PAPER_STYLE } from './notebook-styles'
import { NotebookInvestigationFields } from './NotebookInvestigationFields'
import { NotebookStickyNote } from './NotebookStickyNote'

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
  const word = entry?.word
  const wordFamily = word ? cleanTerms(word.word_family) : []
  const synonyms = word ? cleanTerms(word.synonyms) : []
  const antonyms = word ? cleanTerms(word.antonyms) : []
  const collocations = word ? deriveCollocations(word) : []
  const relatedTerms = Array.from(new Set([...synonyms, ...wordFamily])).slice(0, 4)
  const levelLabel = word ? getNotebookLevelLabel(word.difficulty) : null
  const posAbbr = word ? getNotebookPosAbbr(word.pos) : null

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

            <NotebookInvestigationFields
              word={word}
              wordFamily={wordFamily}
              synonyms={synonyms}
              antonyms={antonyms}
              collocations={collocations}
              relatedTerms={relatedTerms}
            >
              <NotebookStickyNote
                entry={entry}
                isEditing={isEditing}
                draftNote={draftNote}
                onStartEdit={onStartEdit}
                onDraftChange={onDraftChange}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                onClearNote={onClearNote}
              />
            </NotebookInvestigationFields>
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
