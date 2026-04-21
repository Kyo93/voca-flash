/**
 * Import Constants — Configuration and Mappings for Word Import
 */

import type { NormalizedWord } from './types'

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const COLUMN_ALIASES: Record<string, string> = {
  word: 'word', words: 'word',
  phonetic: 'phonetic',
  pos: 'pos', type: 'pos',
  difficulty: 'difficulty', level: 'difficulty',
  definition: 'definition', meaning: 'definition',
  example: 'example',
  example_vi: 'example_vi',
  image_url: 'image_url', image: 'image_url',
  topics: 'topics', topic: 'topics',
  wrong1: 'wrong1',
  wrong2: 'wrong2',
  wrong3: 'wrong3',
  image_position: 'image_position',
}

export const VALID_POS = ['noun', 'verb', 'adj', 'adv', 'phrase', 'other'] as const

export const POS_LABEL_MAP: Record<string, NormalizedWord['pos']> = {
  danh_từ: 'noun', danh_tu: 'noun', noun: 'noun',
  động_từ: 'verb', dong_tu: 'verb', verb: 'verb',
  tính_từ: 'adj', tinh_tu: 'adj', adj: 'adj',
  trạng_từ: 'adv', trang_tu: 'adv', adv: 'adv',
  cụm_từ: 'phrase', cum_tu: 'phrase', phrase: 'phrase',
  khác: 'other',
}

export const DIFFICULTY_LABEL_MAP: Record<string, number> = {
  rất_dễ: 1, rat_de: 1, very_easy: 1,
  dễ: 2, de: 2, easy: 2,
  trung_bình: 3, trung_binh: 3, medium: 3, trungbình: 3, trungbinh: 3,
  khó: 4, kho: 4, hard: 4,
  rất_khó: 5, rat_kho: 5, very_hard: 5,
}

export function parseErrorToMessage(code: string): string {
  const messages: Record<string, string> = {
    FILE_TOO_LARGE: 'admin.import.fileTooLarge',
    EMPTY_FILE: 'admin.import.emptyFile',
    INVALID_SHEETS_URL: 'admin.import.invalidUrl',
    SHEETS_ACCESS_DENIED: 'admin.import.sheetsError',
    SHEETS_FETCH_FAILED: 'admin.import.sheetsError',
    UNSUPPORTED_FORMAT: 'admin.import.invalidFile',
    PARSE_ERROR: 'admin.import.invalidFile',
    READ_ERROR: 'admin.import.invalidFile',
    NO_SHEETS: 'admin.import.invalidFile',
  }
  return messages[code] ?? 'admin.import.invalidFile'
}
