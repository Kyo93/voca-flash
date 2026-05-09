import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import type { NotebookWordEntry } from '../../lib/storage/notebook'
import {
  ARCHIVE_PREVIEW_LIMIT,
  NOTEBOOK_DRAG_THRESHOLD,
  shouldIgnoreBookDrag,
} from './notebook-utils'

interface UseNotebookScreenStateArgs {
  entries: NotebookWordEntry[]
  searchQuery: string
  onSaveNote: (wordId: string, note: string) => Promise<void>
}

export function useNotebookScreenState({
  entries,
  searchQuery,
  onSaveNote,
}: UseNotebookScreenStateArgs) {
  const [editingWordId, setEditingWordId] = useState<string | null>(null)
  const [draftNote, setDraftNote] = useState('')
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [archivePageIndex, setArchivePageIndex] = useState(0)
  const [bookDragDelta, setBookDragDelta] = useState(0)
  const bookDragStartX = useRef<number | null>(null)

  const visibleEntries = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    if (!needle) return entries

    return entries.filter((entry) => {
      const word = entry.word
      return [
        word?.word,
        word?.definition,
        word?.phonetic,
        word?.example,
        entry.personal_note,
      ].some((value) => value?.toLowerCase().includes(needle))
    })
  }, [entries, searchQuery])

  useEffect(() => {
    if (visibleEntries.length === 0) {
      if (selectedWordId) setSelectedWordId(null)
      return
    }

    if (!visibleEntries.some((entry) => entry.word_id === selectedWordId)) {
      setSelectedWordId(visibleEntries[0].word_id)
    }
  }, [selectedWordId, visibleEntries])

  useEffect(() => {
    setArchivePageIndex(0)
  }, [searchQuery])

  const archivePageCount = Math.max(1, Math.ceil(visibleEntries.length / ARCHIVE_PREVIEW_LIMIT))
  const activeArchivePageIndex = Math.min(archivePageIndex, archivePageCount - 1)
  const archivePageEntries = visibleEntries.slice(
    activeArchivePageIndex * ARCHIVE_PREVIEW_LIMIT,
    (activeArchivePageIndex + 1) * ARCHIVE_PREVIEW_LIMIT,
  )

  useEffect(() => {
    if (archivePageIndex !== activeArchivePageIndex) {
      setArchivePageIndex(activeArchivePageIndex)
    }
  }, [activeArchivePageIndex, archivePageIndex])

  const goToArchivePage = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(nextIndex, archivePageCount - 1))
    setArchivePageIndex(boundedIndex)

    const firstEntryOnPage = visibleEntries[boundedIndex * ARCHIVE_PREVIEW_LIMIT]
    if (firstEntryOnPage) {
      setSelectedWordId(firstEntryOnPage.word_id)
    }
  }

  const goToPreviousArchivePage = () => {
    goToArchivePage(activeArchivePageIndex - 1)
  }

  const goToNextArchivePage = () => {
    goToArchivePage(activeArchivePageIndex + 1)
  }

  const handleBookPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (archivePageCount < 2) return
    if (shouldIgnoreBookDrag(event.target)) return

    bookDragStartX.current = event.clientX
    setBookDragDelta(0)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handleBookPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (bookDragStartX.current === null) return
    setBookDragDelta(event.clientX - bookDragStartX.current)
  }

  const finishBookDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (bookDragStartX.current === null) return

    const dragDistance = event.clientX - bookDragStartX.current
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    bookDragStartX.current = null
    setBookDragDelta(0)

    if (Math.abs(dragDistance) < NOTEBOOK_DRAG_THRESHOLD) return
    if (dragDistance < 0) {
      goToNextArchivePage()
    } else {
      goToPreviousArchivePage()
    }
  }

  const selectedEntry = useMemo(
    () =>
      visibleEntries.find((entry) => entry.word_id === selectedWordId) ??
      visibleEntries[0] ??
      null,
    [selectedWordId, visibleEntries],
  )

  const startEditing = (entry: NotebookWordEntry) => {
    setEditingWordId(entry.word_id)
    setDraftNote(entry.personal_note ?? '')
  }

  const closeEditor = () => {
    setEditingWordId(null)
    setDraftNote('')
  }

  const saveNote = async (entry: NotebookWordEntry) => {
    await onSaveNote(entry.word_id, draftNote)
    closeEditor()
  }

  const clearNote = async (entry: NotebookWordEntry) => {
    await onSaveNote(entry.word_id, '')
    closeEditor()
  }

  return {
    activeArchivePageIndex,
    archivePageCount,
    archivePageEntries,
    bookDragDelta,
    canGoNextArchivePage: activeArchivePageIndex < archivePageCount - 1,
    canGoPreviousArchivePage: activeArchivePageIndex > 0,
    clearNote,
    closeEditor,
    draftNote,
    editingWordId,
    finishBookDrag,
    goToNextArchivePage,
    goToPreviousArchivePage,
    handleBookPointerDown,
    handleBookPointerMove,
    saveNote,
    selectedEntry,
    selectEntry: setSelectedWordId,
    setDraftNote,
    startEditing,
    visibleEntries,
  }
}
