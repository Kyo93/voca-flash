import { useState, useCallback, useMemo } from 'react'
import { CardProgress, Rating } from '../lib/srs'
import { upsertFreeStudyFail, fetchUserVocabulary } from '../lib/supabase-storage'
import { useAuth } from '../contexts/AuthContext'
import { Word, MasteryWord } from '../lib/types'
import { QuadrantType, ReviewChallenge } from './useReviewSession'

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

  // Quadrant selection logic (kept for consistency)
  const selectQuadrant = (word: MasteryWord): QuadrantType => {
    const hasExample = !!word.example
    const reps = word.repetitions

    if (reps < 2) {
      const options: QuadrantType[] = ['construction', 'recognition']
      if (hasExample) options.push('context_gap')
      return options[Math.floor(Math.random() * options.length)]
    } else if (reps < 4) {
      const options: QuadrantType[] = ['construction', 'phonetics']
      if (hasExample) options.push('context_gap')
      return options[Math.floor(Math.random() * options.length)]
    } else {
      if (hasExample && Math.random() > 0.5) return 'usage_master'
      return 'ghost_recall'
    }
  }

  const initialize = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    
    try {
      let sourceWords: MasteryWord[] = []
      
      if (wordsOverride && wordsOverride.length > 0) {
        sourceWords = wordsOverride
      } else {
        const allWords = await fetchUserVocabulary(user.id)
        if (deckId === 'all') {
          // Default: Take 20 random words for free study if none selected
          sourceWords = allWords.sort(() => Math.random() - 0.5).slice(0, 20)
        } else {
          // Filter by topic if deckId looks like a topic slug
          sourceWords = allWords.filter(w => w.topics?.slug === deckId)
        }
      }

      const challenges: ReviewChallenge[] = sourceWords.map(w => {
        // Create a dummy CardProgress for compatibility
        const progress: CardProgress = {
          repetitions: w.repetitions,
          ease: w.ease_factor,
          interval: w.interval_days,
          nextReview: w.next_review_at ? new Date(w.next_review_at) : new Date()
        }

        const wordObj: Word = {
          id: w.word_id,
          word: w.word,
          definition: w.definition,
          phonetic: w.phonetic,
          pos: w.pos as any,
          difficulty: 3,
          image_url: w.image_url,
          example: w.example,
          example_vi: w.example_vi,
          created_at: w.first_encountered,
          updated_at: w.first_encountered
        }

        return {
          id: w.word_id,
          word: wordObj,
          progress: progress,
          choices: [], // We'll skip recognition for now in Free Study for simplicity
          quadrant: selectQuadrant(w)
        }
      })

      setQueue(challenges.sort(() => Math.random() - 0.5))
      setCurrentIndex(0)
      setIsComplete(challenges.length === 0)
    } catch (err) {
      console.error('[useFreeStudySession] initialization failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user, deckId, wordsOverride])

  const submitAnswer = useCallback(async (isCorrect: boolean) => {
    if (currentIndex >= queue.length) return
    if (!user) return

    const current = queue[currentIndex]
    
    // Logic Option B:
    // Pass -> No action in DB.
    // Fail -> Reset SM-2 process.
    if (!isCorrect) {
      upsertFreeStudyFail(user.id, current.word.id)
        .catch(err => console.error('[useFreeStudySession] fail sync error:', err))
    }

    // Update session stats
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      points: prev.points + (isCorrect ? 10 : 0),
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
    initialize,
    submitAnswer
  }
}
