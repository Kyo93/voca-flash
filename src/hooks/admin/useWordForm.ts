import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Word } from '../../lib/types'

export function useWordForm(
  word: Word | null | undefined,
  initialWrongChoices: string[] | undefined,
  open: boolean
) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [wordText, setWordText] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [pos, setPos] = useState<Word['pos']>('noun')
  const [difficulty, setDifficulty] = useState(3)
  const [definition, setDefinition] = useState('')
  const [example, setExample] = useState('')
  const [exampleVi, setExampleVi] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePosition, setImagePosition] = useState('center')
  const [wrong1, setWrong1] = useState('')
  const [wrong2, setWrong2] = useState('')
  const [wrong3, setWrong3] = useState('')
  const [synonyms, setSynonyms] = useState('')
  const [antonyms, setAntonyms] = useState('')
  const [wordFamily, setWordFamily] = useState('')

  // Tags state (only data, UI logic is in WordTagsInput)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    if (word) {
      setWordText(word.word ?? '')
      setPhonetic(word.phonetic ?? '')
      setPos(word.pos ?? 'noun')
      setDifficulty(word.difficulty ?? 3)
      setDefinition(word.definition ?? '')
      setExample(word.example ?? '')
      setExampleVi(word.example_vi ?? '')
      setSynonyms(word?.synonyms?.join(', ') ?? '')
      setAntonyms(word?.antonyms?.join(', ') ?? '')
      setWordFamily(word?.word_family?.join(', ') ?? '')

      setImageUrl(word.image_url ?? '')
      setImagePosition(word.image_position ?? 'center')
      if (initialWrongChoices) {
        setWrong1(initialWrongChoices[0] || '')
        setWrong2(initialWrongChoices[1] || '')
        setWrong3(initialWrongChoices[2] || '')
      } else {
        setWrong1('')
        setWrong2('')
        setWrong3('')
      }
      setSelectedTags(word.tags ?? [])
    } else {
      setWordText('')
      setPhonetic('')
      setPos('noun')
      setDifficulty(3)
      setDefinition('')
      setExample('')
      setExampleVi('')
      setImageUrl('')
      setImagePosition('center')
      setWrong1('')
      setWrong2('')
      setWrong3('')
      setSynonyms('')
      setAntonyms('')
      setWordFamily('')
      setSelectedTags([])
    }
    setError(null)
  }, [word, open, initialWrongChoices])

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed || selectedTags.includes(trimmed)) return
    setSelectedTags(prev => [...prev, trimmed])
  }

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  function buildPayload() {
    if (!wordText.trim() || !definition.trim()) {
      setError(t('admin.wordForm.requiredFields'))
      return null
    }
    
    const wrongChoices = [wrong1, wrong2, wrong3].filter((c) => c.trim())
    
    const payload = {
      word: wordText.trim(),
      phonetic: phonetic.trim() || null,
      pos,
      difficulty,
      definition: definition.trim(),
      example: example.trim() || null,
      example_vi: exampleVi.trim() || null,
      topic_id: undefined,
      image_url: imageUrl.trim() || null,
      image_position: imagePosition || 'center',
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      synonyms: synonyms.trim() ? synonyms.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      antonyms: antonyms.trim() ? antonyms.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      word_family: wordFamily.trim() ? wordFamily.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    }
    
    return { payload, wrongChoices }
  }

  return {
    state: {
      loading, error,
      wordText, phonetic, pos, difficulty, definition,
      example, exampleVi, imageUrl, imagePosition,
      wrong1, wrong2, wrong3, synonyms, antonyms, wordFamily,
      selectedTags
    },
    actions: {
      setLoading, setError,
      setWordText, setPhonetic, setPos, setDifficulty, setDefinition,
      setExample, setExampleVi, setImageUrl, setImagePosition,
      setWrong1, setWrong2, setWrong3, setSynonyms, setAntonyms, setWordFamily,
      addTag, removeTag, buildPayload
    }
  }
}
