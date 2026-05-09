import type { CSSProperties } from 'react'

export const PAPER_BACKGROUND_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, rgba(248, 245, 241, 0.46), rgba(248, 245, 241, 0.66)), url('/notebook-assets/notebook-flat-lay-desk.jpg')",
  backgroundPosition: 'center center',
  backgroundSize: 'cover',
}

export const RULED_PAPER_STYLE: CSSProperties = {
  backgroundPositionY: 'var(--notebook-rule-offset)',
}
