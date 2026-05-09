import type { NotebookWordEntry } from '../../lib/storage/notebook'

const NOTEBOOK_VIEW_STYLES = ['journal', 'study', 'dictionary'] as const
const NOTEBOOK_DENSITIES = ['cozy', 'compact'] as const

export type NotebookViewStyle = (typeof NOTEBOOK_VIEW_STYLES)[number]
export type NotebookDensity = (typeof NOTEBOOK_DENSITIES)[number]

export interface NotebookPreferences {
  viewStyle: NotebookViewStyle
  density: NotebookDensity
  showImages: boolean
}

const NOTEBOOK_PREFS_KEY = 'voca-flash:mastery-notebook-prefs'

const DEFAULT_NOTEBOOK_PREFS: NotebookPreferences = {
  viewStyle: 'journal',
  density: 'cozy',
  showImages: true,
}

export const ARCHIVE_PREVIEW_LIMIT = 4
export const NOTEBOOK_DRAG_THRESHOLD = 80

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNotebookViewStyle(value: unknown): value is NotebookViewStyle {
  return typeof value === 'string' && NOTEBOOK_VIEW_STYLES.includes(value as NotebookViewStyle)
}

function isNotebookDensity(value: unknown): value is NotebookDensity {
  return typeof value === 'string' && NOTEBOOK_DENSITIES.includes(value as NotebookDensity)
}

function normalizeNotebookPrefs(value: unknown): NotebookPreferences {
  if (!isRecord(value)) return DEFAULT_NOTEBOOK_PREFS

  return {
    viewStyle: isNotebookViewStyle(value.viewStyle) ? value.viewStyle : DEFAULT_NOTEBOOK_PREFS.viewStyle,
    density: isNotebookDensity(value.density) ? value.density : DEFAULT_NOTEBOOK_PREFS.density,
    showImages: typeof value.showImages === 'boolean' ? value.showImages : DEFAULT_NOTEBOOK_PREFS.showImages,
  }
}

export function readNotebookPrefs(): NotebookPreferences {
  if (typeof window === 'undefined') return DEFAULT_NOTEBOOK_PREFS

  try {
    const raw = window.localStorage.getItem(NOTEBOOK_PREFS_KEY)
    if (!raw) return DEFAULT_NOTEBOOK_PREFS
    return normalizeNotebookPrefs(JSON.parse(raw))
  } catch {
    return DEFAULT_NOTEBOOK_PREFS
  }
}

export function writeNotebookPrefs(prefs: NotebookPreferences) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(NOTEBOOK_PREFS_KEY, JSON.stringify(normalizeNotebookPrefs(prefs)))
}

export function classes(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ')
}

export function shouldIgnoreBookDrag(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(target.closest('button, a, input, textarea, select, [contenteditable="true"], [role="button"]'))
    : false
}

export function getNoteStats(note?: string | null) {
  const content = (note ?? '').trim()
  return {
    characters: content.length,
    words: content ? content.split(/\s+/).filter(Boolean).length : 0,
  }
}

export function cleanTerms(terms?: string[] | null) {
  return (terms ?? []).map((term) => term.trim()).filter(Boolean)
}

function normalizeTerm(term: string) {
  return term.toLowerCase().replace(/[^a-z]/g, '')
}

export function deriveCollocations(word: NonNullable<NotebookWordEntry['word']>) {
  if (!word.example) return []

  const tokens = word.example.match(/[A-Za-z']+/g) ?? []
  const target = normalizeTerm(word.word)
  if (!target) return []

  const phrases = new Set<string>()

  tokens.forEach((token, index) => {
    const current = normalizeTerm(token)
    const matchesTarget = current === target || current.startsWith(target) || target.startsWith(current)
    if (!matchesTarget) return

    const previous = tokens[index - 1]
    const next = tokens[index + 1]
    if (previous) phrases.add(`${previous} ${token}`)
    if (next) phrases.add(`${token} ${next}`)
    if (previous && next) phrases.add(`${previous} ${token} ${next}`)
  })

  return Array.from(phrases).slice(0, 4)
}

export function getNotebookLevelLabel(difficulty?: number | null) {
  if (!difficulty) return null
  if (difficulty >= 5) return 'C2'
  if (difficulty === 4) return 'C1'
  if (difficulty === 3) return 'B2'
  if (difficulty === 2) return 'B1'
  return 'A2'
}

export function getNotebookPosAbbr(pos?: NonNullable<NotebookWordEntry['word']>['pos']) {
  if (!pos) return null
  const labels: Record<NonNullable<NonNullable<NotebookWordEntry['word']>['pos']>, string> = {
    noun: 'n.',
    verb: 'v.',
    adj: 'adj.',
    adv: 'adv.',
    phrase: 'phr.',
    other: 'misc.',
  }
  return labels[pos]
}
