// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StudyPrepScreen from '../../src/components/StudyPrepScreen'
import type { Card } from '../../src/lib/srs'

vi.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values }: { i18nKey: string; values?: Record<string, unknown> }) => (
    <span>{i18nKey}:{values?.total}</span>
  ),
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        'common.back': 'Back',
        'studyPrep.title': 'Study Preparation',
        'studyPrep.loading': 'Loading',
        'studyPrep.emptyTitle': 'No vocabulary in this topic',
        'studyPrep.emptyDesc': 'Add words first.',
        'studyPrep.newWords': 'New words',
        'studyPrep.learning': 'In progress',
        'studyPrep.mastered': 'Mastered',
        'studyPrep.masteredDesc': 'Completed',
        'studyPrep.learnOnlyNew': 'Learn only new',
        'studyPrep.learnCombined': 'Learn both old & new',
        'studyPrep.startNow': 'Start now',
        'studyPrep.includeMastered': 'Yes, review all',
      }
      return labels[key] ?? key
    },
  }),
}))

function card(id: string): Card {
  return {
    id,
    front: id,
    back: id,
    topic: 'topic',
    createdAt: 0,
  }
}

describe('StudyPrepScreen mobile-safe actions', () => {
  it('does not offer a new-only session when there are no new words', async () => {
    const onStart = vi.fn()

    render(
      <StudyPrepScreen
        stats={{
          unlearned: [],
          learning: [card('learning-1'), card('learning-2')],
          mastered: [card('mastered-1')],
        }}
        loading={false}
        onStart={onStart}
        onBack={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: /Learn only new/i })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /Learn both old & new/i }))
    expect(onStart).toHaveBeenCalledWith('combined')
  })

  it('keeps the new-only option when new words are available', () => {
    render(
      <StudyPrepScreen
        stats={{
          unlearned: [card('new-1')],
          learning: [card('learning-1')],
          mastered: [],
        }}
        loading={false}
        onStart={vi.fn()}
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /Learn only new/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Learn both old & new/i })).toBeTruthy()
  })
})
