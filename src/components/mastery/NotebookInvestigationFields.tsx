import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { NotebookWordEntry } from '../../lib/storage/notebook'
import { classes } from './notebook-utils'

type NotebookWord = NonNullable<NotebookWordEntry['word']>

interface NotebookInvestigationFieldsProps {
  word: NotebookWord
  wordFamily: string[]
  synonyms: string[]
  antonyms: string[]
  collocations: string[]
  relatedTerms: string[]
  children: ReactNode
}

export function NotebookInvestigationFields({
  word,
  wordFamily,
  synonyms,
  antonyms,
  collocations,
  relatedTerms,
  children,
}: NotebookInvestigationFieldsProps) {
  const { t } = useTranslation()

  return (
    <>
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

        {children}
      </section>
    </>
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

function NotebookVintageTerms({
  terms,
  tone = 'sage',
}: {
  terms: string[]
  tone?: 'sage' | 'terracotta' | 'ink'
}) {
  const { t } = useTranslation()

  if (terms.length === 0) {
    return (
      <p className="notebook-line-text notebook-engraved-text text-center text-sm font-semibold italic text-on-surface-variant/55">
        {t('mastery.notebook.noDataYet')}
      </p>
    )
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
