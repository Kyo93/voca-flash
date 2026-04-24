import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { parseFile, parseSheetsUrl, parseErrorToMessage } from '../../lib/import-parser'
import { batchInsertWords } from '../../lib/queries/word-queries'
import { processImportData } from '../../lib/import-logic'
import type { BatchInsertResult, NormalizedWord, Topic } from '../../lib/types'
import type { ImportRow, DuplicateAction } from '../../components/admin/ImportPreviewTable'

export type ImportState = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error'

interface UseImportFlowArgs {
  topics: Topic[]
  roadmapId: string
  roadmapSlug?: string
}

function getTopicNameMap(topics: Topic[]): Map<string, Topic> {
  const map = new Map<string, Topic>()
  for (const t of topics) {
    map.set(t.name.toLowerCase(), t)
  }
  return map
}

/**
 * Owns the entire import-flow state machine for ImportWordsModal.
 *
 * Collapses the previously-duplicated try/catch wrappers around parseFile()
 * and parseSheetsUrl() into a single `parseSource()` helper. The modal
 * component is now pure UI driven by `state`.
 */
export function useImportFlow({ topics, roadmapId, roadmapSlug }: UseImportFlowArgs) {
  const { t } = useTranslation()
  const filteredTopics = topics.filter((tp) => tp.roadmap_id === roadmapId)

  const [state, setState] = useState<ImportState>('idle')
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<BatchInsertResult | null>(null)

  const reset = useCallback(() => {
    setState('idle')
    setRows([])
    setErrorMessage('')
    setResult(null)
    setSheetsUrl('')
    setUrlError('')
  }, [])

  const handleParse = useCallback(
    async (parsed: { rows: NormalizedWord[]; unmatchedTopics: string[] }) => {
      try {
        const topicMap = getTopicNameMap(filteredTopics)
        const { importRows } = await processImportData(parsed, roadmapId, roadmapSlug, topicMap)
        setRows(importRows)
        setState('preview')
      } catch {
        setErrorMessage(t('admin.import.postParseError'))
        setState('error')
      }
    },
    [filteredTopics, roadmapId, roadmapSlug, t],
  )

  /**
   * Generic parse-source wrapper. The two callers differ only in which
   * library function they invoke — wrap the shared try/catch + state
   * transitions once, here.
   */
  const parseSource = useCallback(
    async (
      load: (topicMap: Map<string, Topic>) => Promise<{ rows: NormalizedWord[]; unmatchedTopics: string[] }>,
    ) => {
      setState('parsing')
      setErrorMessage('')
      try {
        const topicMap = getTopicNameMap(filteredTopics)
        const parsed = await load(topicMap)
        await handleParse(parsed)
      } catch (err) {
        const code = err instanceof Error ? err.message : 'PARSE_ERROR'
        setErrorMessage(parseErrorToMessage(code))
        setState('error')
      }
    },
    [filteredTopics, handleParse],
  )

  const handleFileSelected = useCallback(
    (file: File) => parseSource((topicMap) => parseFile(file, topicMap)),
    [parseSource],
  )

  const handleSheetsUrl = useCallback(() => {
    if (!sheetsUrl.trim()) {
      setUrlError(t('admin.import.fileRequired'))
      return Promise.resolve()
    }
    setUrlError('')
    return parseSource((topicMap) => parseSheetsUrl(sheetsUrl, topicMap))
  }, [parseSource, sheetsUrl, t])

  function handleDuplicateAction(rowIndex: number, action: DuplicateAction) {
    setRows((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, duplicateAction: action } : r)))
  }

  function handleBulkDuplicateAction(action: DuplicateAction) {
    setRows((prev) =>
      prev.map((r) => (r.status === 'duplicate' ? { ...r, duplicateAction: action } : r)),
    )
  }

  async function handleStartImport() {
    const validRows = rows.filter((r) => r.status !== 'invalid')
    const toImport = validRows.filter((r) => !(r.status === 'duplicate' && r.duplicateAction === 'skip'))
    if (toImport.length === 0) return

    setState('importing')
    setProgress({ done: 0, total: toImport.length })
    const insertResult = await batchInsertWords(toImport)
    setProgress({ done: toImport.length, total: toImport.length })
    setResult(insertResult)
    setState('done')
  }

  function clearError() {
    setState('idle')
    setErrorMessage('')
  }

  return {
    state,
    sheetsUrl, setSheetsUrl,
    urlError,
    errorMessage,
    rows,
    progress,
    result,
    reset,
    handleFileSelected,
    handleSheetsUrl,
    handleDuplicateAction,
    handleBulkDuplicateAction,
    handleStartImport,
    clearError,
  }
}
