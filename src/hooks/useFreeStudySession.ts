import { useState, useCallback, useMemo, useRef } from 'react'
import { CardProgress } from '../lib/srs'
import { upsertFreeStudyFail, getUserVocabulary } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'
import { Word, MasteryWord } from '../lib/types'
import { ReviewChallenge, selectQuadrant } from '../lib/challenge-logic'
import { shuffleArray } from '../lib/utils'

const FREE_STUDY_DEFAULT_SAMPLE_SIZE = 20
const POINTS_PER_CORRECT = 10
const DEFAULT_WORD_DIFFICULTY = 3

export function useFreeStudySession(deckId: string = 'all', wordsOverride?: MasteryWord[]) {
  const { user } = useAuth()
  const [queue, setQueue] = useState<ReviewChallenge[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState({ 
    correct: 0, 
    wrong: 0, 
    points: 0, 
    mistakes: [] as Word[] 
  })
  const [syncError, setSyncError] = useState<string | null>(null)
  const isInitializing = useRef(false)

  const initialize = useCallback(async () => {
    if (!user || isInitializing.current) return
    isInitializing.current = true
    setIsLoading(true)
    setSyncError(null)
    
    try {
      let sourceWords: MasteryWord[] = []
      
      if (wordsOverride && wordsOverride.length > 0) {
        sourceWords = wordsOverride
      } else {
        const { data: allWords } = await getUserVocabulary(user.id)
        if (deckId === 'all') {
          // Default: Take N random words for free study if none selected
          sourceWords = shuffleArray(allWords ?? []).slice(0, FREE_STUDY_DEFAULT_SAMPLE_SIZE)
        } else if (deckId === 'mastered') {
          sourceWords = (allWords ?? []).filter(w => w.mastered === true)
        } else {
          // Filter by topic if deckId looks like a topic slug
          sourceWords = (allWords ?? []).filter(w => w.topic_names === deckId)
        }
      }

      const challenges: ReviewChallenge[] = sourceWords.map(w => {
        // Map MasteryWord to CardProgress
        const progress: CardProgress = {
          cardId: w.word_id,
          stability: w.fsrs_stability ?? 0,
          difficulty: w.fsrs_difficulty ?? 0.5,
          state: w.fsrs_state ?? 0,
          reps: w.fsrs_reps ?? 0,
          lapses: w.fsrs_lapses ?? 0,
          scheduledDays: 0, // v2 does not return fsrs_scheduled_days
          due: w.next_review_at ? new Date(w.next_review_at).getTime() : Date.now(),
          lastReview: w.last_reviewed ? new Date(w.last_reviewed).getTime() : 0,
        }

        const wordObj: Word = {
          id: w.word_id,
          word: w.word,
          definition: w.definition,
          phonetic: w.phonetic,
          pos: 'other', // v2 does not return pos
          difficulty: DEFAULT_WORD_DIFFICULTY,
          image_url: w.image_url,
          image_position: null, // v2 does not return image_position
          example: w.example,
          example_vi: null, // v2 does not return example_vi
          tags: [], // v2 does not return tags
          created_at: '',
          updated_at: '',
        }

        return {
          id: w.word_id,
          word: wordObj,
          progress: progress,
          choices: [], // We'll skip recognition for now in Free Study for simplicity
          quadrant: selectQuadrant(w.fsrs_stability ?? 0, !!w.example)
        }
      })

      setQueue(shuffleArray(challenges))
      setCurrentIndex(0)
      setIsComplete(challenges.length === 0)
    } catch (err) {
      console.error('[useFreeStudySession] initialization failed:', err)
      setSyncError('Không thể tải bài học tự do.')
    } finally {
      setIsLoading(false)
      isInitializing.current = false
    }
  }, [user, deckId, wordsOverride])

  const submitAnswer = useCallback(async (isCorrect: boolean) => {
    if (currentIndex >= queue.length) return
    if (!user) return

    const current = queue[currentIndex]
    
    // In Free Study, Fail results in an SRS reset (Forget)
    if (!isCorrect) {
      upsertFreeStudyFail(user.id, current.word.id)
        .catch(err => {
          console.error('[useFreeStudySession] fail sync error:', err)
          setSyncError('Lỗi cập nhật tiến độ tự do.')
        })
    }

    // Update session stats
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      points: prev.points + (isCorrect ? POINTS_PER_CORRECT : 0),
      mistakes: isCorrect ? prev.mistakes : [...prev.mistakes, current.word]
    }))

    // Move to next
    setCurrentIndex(prev => {
      const nextIndex = prev + 1
      if (nextIndex >= queue.length) {
        setIsComplete(true)
        return prev
      }
      return nextIndex
    })
  }, [currentIndex, queue, user])

  const currentChallenge = useMemo(() => queue[currentIndex] || null, [queue, currentIndex])

  return {
    isLoading,
    isComplete,
    currentIndex,
    totalCount: queue.length,
    currentChallenge,
    stats,
    syncError,
    initialize,
    submitAnswer
  }
}
