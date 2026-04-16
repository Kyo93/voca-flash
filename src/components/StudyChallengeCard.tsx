/**
 * StudyChallengeCard — unified Material 3 warm-light wrapper
 *
 * Wraps the actual challenge component (ContextGap, GhostRecall, Recognition)
 * in a consistent design that matches the VocaFlash warm light theme.
 *
 * NOT a full replacement — just a styled container shell.
 * The inner challenge component is passed as children.
 */

import type { StudyChallengeType } from '../lib/srs'
import type { ReactNode } from 'react'

interface StudyChallengeCardProps {
  type: StudyChallengeType
  children: ReactNode
}

const CHALLENGE_META: Record<StudyChallengeType, { label: string; color: string; bg: string }> = {
  cloze: {
    label: 'Điền từ',
    color: 'text-primary',
    bg: 'bg-primary/5 border-primary/20',
  },
  listen: {
    label: 'Nghe lại',
    color: 'text-secondary',
    bg: 'bg-secondary/5 border-secondary/20',
  },
  recognition: {
    label: 'Chọn nghĩa',
    color: 'text-tertiary',
    bg: 'bg-tertiary/5 border-tertiary/20',
  },
}

export default function StudyChallengeCard({ type, children }: StudyChallengeCardProps) {
  const meta = CHALLENGE_META[type]

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Challenge type badge */}
      <div className="flex items-center justify-center">
        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${meta.color} ${meta.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`} />
          {meta.label}
        </span>
      </div>

      {/* Challenge content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}
