import { Card, CardProgress, createInitialProgress, getDueCards } from './srs'

const STORAGE_KEY = 'voca-flash-cards'
const PROGRESS_KEY = 'voca-flash-progress'

export const sampleCards: Card[] = [
  // Daily Communication
  { id: '1', front: 'hello', back: 'xin chào', example: 'Hello, how are you today?', example_vi: 'Xin chào, hôm nay bạn thế nào?', topic: 'daily', createdAt: Date.now() },
  { id: '2', front: 'goodbye', back: 'tạm biệt', example: 'Goodbye, see you tomorrow!', example_vi: 'Tạm biệt, hẹn gặp lại vào ngày mai!', topic: 'daily', createdAt: Date.now() },
  { id: '3', front: 'please', back: 'làm ơn / xin vui lòng', example: 'Please pass me the salt.', example_vi: 'Làm ơn đưa giúp tôi lọ muối.', topic: 'daily', createdAt: Date.now() },
  { id: '4', front: 'thank you', back: 'cảm ơn', example: 'Thank you so much for your help.', example_vi: 'Cảm ơn bạn rất nhiều vì sự giúp đỡ.', topic: 'daily', createdAt: Date.now() },
  // Travel
  { id: '5', front: 'airport', back: 'sân bay', example: 'The airport is 30 minutes from here.', example_vi: 'Sân bay cách đây 30 phút.', topic: 'travel', createdAt: Date.now() },
  { id: '6', front: 'passport', back: 'hộ chiếu', example: 'Do you have your passport ready?', example_vi: 'Bạn đã chuẩn bị sẵn hộ chiếu chưa?', topic: 'travel', createdAt: Date.now() },
  { id: '7', front: 'hotel', back: 'khách sạn', example: 'I booked a hotel near the beach.', example_vi: 'Tôi đã đặt một khách sạn gần bãi biển.', topic: 'travel', createdAt: Date.now() },
  // Business
  { id: '8', front: 'meeting', back: 'cuộc họp', example: 'The meeting starts at 9 AM sharp.', example_vi: 'Cuộc họp bắt đầu đúng 9 giờ sáng.', topic: 'business', createdAt: Date.now() },
  { id: '9', front: 'deadline', back: 'thời hạn', example: 'The deadline is next Friday.', example_vi: 'Hạn chót là thứ Sáu tới.', topic: 'business', createdAt: Date.now() },
  // Technology
  { id: '10', front: 'technology', back: 'công nghệ', example: 'Technology is changing rapidly.', example_vi: 'Công nghệ đang thay đổi nhanh chóng.', topic: 'technology', createdAt: Date.now() },
  // Food
  { id: '11', front: 'breakfast', back: 'bữa sáng', example: 'I usually have breakfast at 7 AM.', example_vi: 'Tôi thường ăn sáng lúc 7 giờ sáng.', topic: 'food', createdAt: Date.now() },
  { id: '12', front: 'delicious', back: 'ngon', example: 'This pizza is absolutely delicious!', example_vi: 'Chiếc bánh pizza này thực sự rất ngon!', topic: 'food', createdAt: Date.now() },
  { id: '13', front: 'recipe', back: 'công thức nấu ăn', example: 'Can you share the recipe?', example_vi: 'Bạn có thể chia sẻ công thức nấu ăn không?', topic: 'food', createdAt: Date.now() },
  { id: '14', front: 'restaurant', back: 'nhà hàng', example: 'Let\'s meet at that Italian restaurant.', example_vi: 'Hãy gặp nhau ở nhà hàng Ý đó.', topic: 'food', createdAt: Date.now() },
  { id: '15', front: 'order', back: 'đặt món / gọi món', example: 'I would like to order coffee, please.', example_vi: 'Tôi muốn đặt cà phê, làm ơn.', topic: 'food', createdAt: Date.now() },
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
      return new Map(arr.map((p) => [p.cardId, p]))
    }
  } catch {}
  return new Map()
}

export function saveProgress(progressMap: Map<string, CardProgress>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...progressMap.values()]))
}

export function getCardStats(cards: Card[], progressMap: Map<string, CardProgress>) {
  const dueCards = getDueCards(cards, progressMap)
  const mastered = [...progressMap.values()].filter((p) => p.repetitions >= 5).length
  const learning = [...progressMap.values()].filter((p) => p.repetitions > 0 && p.repetitions < 5).length
  const newCards = cards.length - progressMap.size

  return {
    dueCards,
    mastered,
    learning,
    new: Math.max(0, newCards),
  }
}
