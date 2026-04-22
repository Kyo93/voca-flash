import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAllTags } from '../../lib/queries/tag-queries'

interface WordTagsInputProps {
  selectedTags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

export function WordTagsInput({ selectedTags, onAddTag, onRemoveTag }: WordTagsInputProps) {
  const { t } = useTranslation()
  const [allTags, setAllTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const tagDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getAllTags().then(tags => setAllTags(tags))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node) &&
        tagInputRef.current && !tagInputRef.current.contains(e.target as Node)
      ) {
        setTagDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredSuggestions = tagInput.trim()
    ? allTags.filter(t =>
        t.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.includes(t)
      )
    : allTags.filter(t => !selectedTags.includes(t)).slice(0, 20)

  function handleAddTag(tag: string) {
    onAddTag(tag)
    setTagInput('')
    setTagDropdownOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim().replace(/,/g, '')
      if (val) handleAddTag(val)
    } else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
      onRemoveTag(selectedTags[selectedTags.length - 1])
    }
  }

  return (
    <div>
      <label className="block text-sm font-bold text-secondary mb-2">
        {t('admin.wordForm.tagsLabel')} <span className="font-normal text-stone-400">{t('admin.wordForm.tagsHint')}</span>
      </label>
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <span className="material-symbols-outlined text-xs leading-none">close</span>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative" ref={tagDropdownRef}>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value)
                setTagDropdownOpen(true)
              }}
              onFocus={() => setTagDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={t('admin.wordForm.tagsPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
            />
            {tagDropdownOpen && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-100 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredSuggestions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleAddTag(tag) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-secondary hover:bg-orange-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => { if (tagInput.trim()) handleAddTag(tagInput.trim()) }}
            className="px-4 py-3 rounded-xl bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 transition-all shrink-0"
          >
            + {t('common.add')}
          </button>
        </div>
      </div>
    </div>
  )
}
