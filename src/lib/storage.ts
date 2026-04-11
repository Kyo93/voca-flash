import { Card, CardProgress, createInitialProgress, getDueCards } from './srs'

const STORAGE_KEY = 'voca-flash-cards'
const PROGRESS_KEY = 'voca-flash-progress'

export const sampleCards: Card[] = [
  { id: '1', front: 'hello', back: 'xin chào', example: 'Hello, how are you?', topic: 'daily', createdAt: Date.now() },
  { id: '2', front: 'goodbye', back: 'tạm biệt', example: 'Goodbye, see you tomorrow!', topic: 'daily', createdAt: Date.now() },
  { id: '3', front: 'thank you', back: 'cảm ơn', example: 'Thank you for your help.', topic: 'daily', createdAt: Date.now() },
  { id: '4', front: 'please', back: 'làm ơn / xin vui lòng', example: 'Please help me.', topic: 'daily', createdAt: Date.now() },
  { id: '5', front: 'airport', back: 'sân bay', example: 'The airport is 30 minutes away.', topic: 'travel', createdAt: Date.now() },
  { id: '6', front: 'passport', back: 'hộ chiếu', example: 'Do you have your passport?', topic: 'travel', createdAt: Date.now() },
  { id: '7', front: 'hotel', back: 'khách sạn', example: 'I booked a hotel for 3 nights.', topic: 'travel', createdAt: Date.now() },
  { id: '8', front: 'meeting', back: 'cuộc họp', example: 'The meeting starts at 9 AM.', topic: 'business', createdAt: Date.now() },
  { id: '9', front: 'deadline', back: 'thời hạn', example: 'The deadline is next Friday.', topic: 'business', createdAt: Date.now() },
  { id: '10', front: 'technology', back: 'công nghệ', example: 'Technology is changing fast.', topic: 'technology', createdAt: Date.now() },
]

export function loadCards(): Card[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return [...sampleCards]
}

export function saveCards(cards: Card[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

export function loadProgress(): Map<string, CardProgress> {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY)
    if (stored) {
      const arr: CardProgress[] = JSON.parse(stored)
      return new Map(arr.map(p => [p.cardId, p]))
    }
  } catch {}
  return new Map()
}

export function saveProgress(progressMap: Map<string, CardProgress>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...progressMap.values()]))
}

export function getCardStats(cards: Card[], progressMap: Map<string, CardProgress>) {
  const dueCards = getDueCards(cards, progressMap)
  const mastered = [...progressMap.values()].filter(p => p.repetitions >= 5).length
  const learning = [...progressMap.values()].filter(p => p.repetitions > 0 && p.repetitions < 5).length
  const newCards = cards.length - progressMap.size

  return { dueCards, mastered, learning, new: Math.max(0, newCards) }
}