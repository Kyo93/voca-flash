import type { CharacterDefinition, CharacterEvolutionStage } from '../../lib/characters'

interface CharacterFallbackAvatarProps {
  character: CharacterDefinition
  stageDefinition?: CharacterEvolutionStage
  size: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: {
    frame: 'w-20 h-20',
    head: 'w-10 h-10',
    body: 'w-14 h-8',
    icon: 'text-xl',
  },
  md: {
    frame: 'w-32 h-32',
    head: 'w-16 h-16',
    body: 'w-20 h-11',
    icon: 'text-3xl',
  },
  lg: {
    frame: 'w-44 h-44',
    head: 'w-20 h-20',
    body: 'w-28 h-14',
    icon: 'text-4xl',
  },
  xl: {
    frame: 'w-72 h-72',
    head: 'w-32 h-32',
    body: 'w-44 h-24',
    icon: 'text-6xl',
  },
} as const

export default function CharacterFallbackAvatar({
  character,
  stageDefinition,
  size,
}: CharacterFallbackAvatarProps) {
  const classes = sizeClasses[size]
  const visual = stageDefinition ?? character.evolutionStages[0]

  return (
    <div
      className={`${classes.frame} relative shrink-0 flex items-center justify-center`}
      data-character-avatar-fallback="true"
    >
      <div className={`absolute inset-3 rounded-full bg-linear-to-br ${visual.swatchClass} opacity-20 blur-sm`} />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-5 rounded-full bg-on-surface/10 blur-sm" />
      <div className="relative flex flex-col items-center">
        <div className={`${classes.head} rounded-full bg-linear-to-br ${visual.swatchClass} shadow-[inset_-10px_-10px_24px_rgba(0,0,0,0.16),0_16px_28px_rgba(29,27,22,0.16)] flex items-center justify-center text-white`}>
          <span className={`material-symbols-outlined ${classes.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {visual.icon}
          </span>
        </div>
        <div className={`${classes.body} -mt-2 rounded-t-full rounded-b-2xl bg-linear-to-br ${visual.swatchClass} shadow-[inset_-8px_-10px_20px_rgba(0,0,0,0.14),0_12px_20px_rgba(29,27,22,0.12)]`} />
      </div>
    </div>
  )
}
