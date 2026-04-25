import { type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { Word } from '../../lib/types'
import { useWordForm } from '../../hooks/admin/useWordForm'
import ErrorBanner from '../common/ErrorBanner'
import { WordTagsInput } from './WordTagsInput'
import { WrongChoicesInput } from './WordFormModal/WrongChoicesInput'

/** Tailwind class chung cho mọi input/textarea/select trong form. */
const FORM_FIELD_CLASS =
  'w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all'

import { ADMIN_FALLBACK_IMAGE } from '../../lib/constants'

const FALLBACK_PREVIEW_IMAGE = ADMIN_FALLBACK_IMAGE

const getPosOptions = (t: TFunction) => [
  { value: 'noun', label: t('common.pos.noun') },
  { value: 'verb', label: t('common.pos.verb') },
  { value: 'adj', label: t('common.pos.adj') },
  { value: 'adv', label: t('common.pos.adv') },
  { value: 'phrase', label: t('common.pos.phrase') },
  { value: 'other', label: t('common.pos.other') },
]

const getDifficultyLabels = (t: TFunction) => [
  t('common.difficulty.v-easy'),
  t('common.difficulty.easy'),
  t('common.difficulty.medium'),
  t('common.difficulty.hard'),
  t('common.difficulty.v-hard'),
]

interface Props {
  open: boolean
  word?: Word | null
  initialWrongChoices?: string[]
  onSave: (word: Omit<Word, 'id' | 'created_at' | 'updated_at'>, wrongChoices: string[]) => Promise<void>
  onClose: () => void
}

export default function WordFormModal({ open, word, initialWrongChoices, onSave, onClose }: Props) {
  const { t } = useTranslation()
  const { state, actions } = useWordForm(word, initialWrongChoices, open)
  
  const posOptions = getPosOptions(t)
  const difficultyLabels = getDifficultyLabels(t)

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const buildResult = actions.buildPayload()
    if (!buildResult) return

    actions.setLoading(true)
    actions.setError(null)

    await onSave(buildResult.payload, buildResult.wrongChoices)
    
    actions.setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-orange-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-100 sticky top-0 bg-white rounded-t-2xl z-20">
          <div>
            <h2 className="text-xl font-black text-secondary">
              {word ? t('admin.wordForm.titleEdit') : t('admin.wordForm.titleAdd')}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {word ? t('admin.wordForm.subtitleEdit') : t('admin.wordForm.subtitleAdd')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Word + Phonetic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">{t('admin.wordForm.wordLabel')}</label>
              <input
                type="text"
                value={state.wordText}
                onChange={(e) => actions.setWordText(e.target.value)}
                placeholder={t('admin.wordForm.wordPlaceholder')}
                required
                className={FORM_FIELD_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">{t('admin.wordForm.phoneticLabel')}</label>
              <input
                type="text"
                value={state.phonetic}
                onChange={(e) => actions.setPhonetic(e.target.value)}
                placeholder={t('admin.wordForm.phoneticPlaceholder')}
                className={FORM_FIELD_CLASS}
              />
            </div>
          </div>

          {/* POS + Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">{t('admin.wordForm.posLabel')}</label>
              <select
                value={state.pos ?? 'noun'}
                onChange={(e) => actions.setPos(e.target.value as Word['pos'])}
                className={FORM_FIELD_CLASS}
              >
                {posOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">
                {t('admin.wordForm.difficultyLabel')}: <span className="text-primary">{difficultyLabels[state.difficulty - 1]}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={state.difficulty}
                onChange={(e) => actions.setDifficulty(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>{t('common.difficulty.easy')}</span><span>{t('common.difficulty.hard')}</span>
              </div>
            </div>
          </div>

          {/* Definition */}
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">{t('admin.wordForm.definitionLabel')}</label>
            <textarea
              value={state.definition}
              onChange={(e) => actions.setDefinition(e.target.value)}
              placeholder={t('admin.wordForm.definitionPlaceholder')}
              rows={2}
              required
              className={`${FORM_FIELD_CLASS} resize-none`}
            />
          </div>

          {/* Example EN & VI */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">{t('admin.wordForm.exampleEn')}</label>
              <input
                type="text"
                value={state.example}
                onChange={(e) => actions.setExample(e.target.value)}
                placeholder={t('admin.wordForm.exampleEnPlaceholder')}
                className={FORM_FIELD_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">{t('admin.wordForm.exampleVi')}</label>
              <input
                type="text"
                value={state.exampleVi}
                onChange={(e) => actions.setExampleVi(e.target.value)}
                placeholder={t('admin.wordForm.exampleViPlaceholder')}
                className={FORM_FIELD_CLASS}
              />
            </div>
          </div>

          {/* Synonyms / Antonyms / Word Family */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">
                {t('admin.wordForm.synonyms')} <span className="font-normal text-stone-400">{t('admin.wordForm.commaSeparated')}</span>
              </label>
              <input
                type="text"
                value={state.synonyms}
                onChange={(e) => actions.setSynonyms(e.target.value)}
                placeholder={t('admin.wordForm.synonymsPlaceholder')}
                className={FORM_FIELD_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">
                {t('admin.wordForm.antonyms')} <span className="font-normal text-stone-400">{t('admin.wordForm.commaSeparated')}</span>
              </label>
              <input
                type="text"
                value={state.antonyms}
                onChange={(e) => actions.setAntonyms(e.target.value)}
                placeholder={t('admin.wordForm.antonymsPlaceholder')}
                className={FORM_FIELD_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary mb-2">
                {t('admin.wordForm.wordFamily')} <span className="font-normal text-stone-400">{t('admin.wordForm.variants')}</span>
              </label>
              <input
                type="text"
                value={state.wordFamily}
                onChange={(e) => actions.setWordFamily(e.target.value)}
                placeholder={t('admin.wordForm.wordFamilyPlaceholder')}
                className={FORM_FIELD_CLASS}
              />
            </div>
          </div>

          {/* Tags */}
          <WordTagsInput
            selectedTags={state.selectedTags}
            onAddTag={actions.addTag}
            onRemoveTag={actions.removeTag}
          />

          {/* Image URL + Focal Point + Preview */}
            <div>
            <label className="block text-sm font-bold text-secondary mb-2">{t('admin.wordForm.imageUrl')}</label>
            <input
              type="text"
              value={state.imageUrl}
              onChange={(e) => actions.setImageUrl(e.target.value)}
              placeholder={t('admin.wordForm.imageUrlPlaceholder')}
              className={`w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary text-sm outline-none focus:border-primary focus:bg-white transition-all`}
            />
            {state.imageUrl && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">{t('admin.wordForm.focalPoint')}:</span>
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => actions.setImagePosition(pos)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        state.imagePosition === pos
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {pos === 'top' ? `⬆ ${t('admin.wordForm.focalTop')}` : pos === 'center' ? `⬛ ${t('admin.wordForm.focalCenter')}` : `⬇ ${t('admin.wordForm.focalBottom')}`}
                    </button>
                  ))}
                </div>
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">{t('admin.wordForm.previewTitle')}</p>
                  <div className="aspect-4/3 w-full max-w-[280px] rounded-lg overflow-hidden border border-stone-200 shadow-sm relative">
                    <img
                      src={state.imageUrl}
                    alt={t('common.preview')}
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{ objectPosition: state.imagePosition }}
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_PREVIEW_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-3 text-white text-sm font-bold drop-shadow-lg">
                      {state.wordText || 'word'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wrong choices */}
          <WrongChoicesInput
            wrong1={state.wrong1} setWrong1={actions.setWrong1}
            wrong2={state.wrong2} setWrong2={actions.setWrong2}
            wrong3={state.wrong3} setWrong3={actions.setWrong3}
          />

          {state.error && <ErrorBanner message={state.error} />}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
               type="button"
               onClick={onClose}
               className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-all"
             >
               {t('common.cancel')}
             </button>
             <button
               type="submit"
               disabled={state.loading}
               className="flex-1 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
             >
               {state.loading ? t('common.loading') : word ? t('common.save') : t('common.add')}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
