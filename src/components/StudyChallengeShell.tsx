import { memo } from 'react'
import ContextGapChallenge from './review/ContextGapChallenge'
import GhostRecallChallenge from './review/GhostRecallChallenge'
import RecognitionChallenge from './review/RecognitionChallenge'
import { generateChoices } from '../lib/utils'
import type { StudyChallengeType } from '../lib/srs'
import type { Word } from '../lib/types'

interface StudyChallengeShellProps {
  type: StudyChallengeType
  word: Word
  choices?: string[]
  onSubmit: (isCorrect: boolean) => void
}

function StudyChallengeShellInner({
  type,
  word,
  choices,
  onSubmit,
}: StudyChallengeShellProps) {
  // Cloze fallback: không có example → dùng recognition
  if (type === 'cloze' && !word.example) {
    return (
      <RecognitionChallenge
        word={word}
        choices={choices ?? generateChoices(word)}
        onSubmit={onSubmit}
      />
    )
  }

  switch (type) {
    case 'cloze':
      return <ContextGapChallenge word={word} onSubmit={onSubmit} />
    case 'listen':
      return <GhostRecallChallenge word={word} onSubmit={onSubmit} />
    case 'recognition':
      return (
        <RecognitionChallenge
          word={word}
          choices={choices ?? generateChoices(word)}
          onSubmit={onSubmit}
        />
      )
  }
}

export default memo(StudyChallengeShellInner)
