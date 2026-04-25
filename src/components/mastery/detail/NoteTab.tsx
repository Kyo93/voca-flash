import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

const RichNoteEditor = lazy(() => import('../../common/RichNoteEditor'))

interface NoteTabProps {
  isEditing: boolean
  onStartEdit: () => void
  draftNote: string
  onDraftChange: (next: string) => void
  personalNote: string | null
  onSave: () => Promise<void>
  onCancel: () => void
}

/**
 * Personal-note tab for WordDetailPanel. Displays markdown read-only or
 * swaps in RichNoteEditor when editing.
 */
export function NoteTab({
  isEditing,
  onStartEdit,
  draftNote,
  onDraftChange,
  personalNote,
  onSave,
  onCancel,
}: NoteTabProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="label-md text-on-surface-variant font-black tracking-widest uppercase opacity-40">{t('mastery.detail.personalNote')}</h3>
        {!isEditing && (
          <button
            onClick={onStartEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-primary/5 text-primary transition-all active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">edit</span>
            <span className="text-[10px] font-black uppercase tracking-wider">{t('mastery.detail.edit')}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Suspense fallback={<div className="p-8 text-sm text-on-surface-variant">{t('common.loading')}</div>}>
            <RichNoteEditor
              content={draftNote}
              onChange={onDraftChange}
              placeholder={t('notebook.notePlaceholder')}
            />
          </Suspense>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl bg-surface-container-highest text-on-surface font-semibold hover:bg-surface-dim active:scale-95 transition-all tracking-wider uppercase text-[10px]"
            >
              {t('admin.import.cancel')}
            </button>
            <button
              onClick={onSave}
              className="flex-2 py-4 rounded-2xl primary-gradient text-on-primary font-semibold sun-drenched-shadow hover:brightness-105 active:scale-95 transition-all tracking-widest uppercase text-[10px] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              {t('settings.save')}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-10 bg-surface-container-highest/30 rounded-3xl relative overflow-hidden group min-h-[200px] border border-outline-variant/10">
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-9xl text-primary/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">edit_note</span>
          <div className={`text-on-surface text-xl leading-relaxed relative z-10 font-normal prose max-w-none prose-p:leading-relaxed prose-li:my-1 ${!personalNote ? 'opacity-30' : ''}`}>
            {personalNote ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="marker:text-primary/40">{children}</li>,
                  strong: ({ children }) => <strong className="text-primary font-black not-italic">{children}</strong>,
                  em: ({ children }) => <em className="text-on-surface/80">{children}</em>,
                }}
              >
                {personalNote}
              </ReactMarkdown>
            ) : (
              t('mastery.detail.notePlaceholder')
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
