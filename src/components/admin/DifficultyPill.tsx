interface Props {
  value: number
  className?: string
}

export default function DifficultyPill({ value, className = '' }: Props) {
  const label = value <= 2 ? 'Easy' : value === 3 ? 'Medium' : 'Hard'
  
  const classes = value <= 2
    ? 'bg-green-50 text-green-700 border border-green-100'
    : value === 3
    ? 'bg-orange-50 text-orange-700 border border-orange-100'
    : 'bg-red-50 text-red-700 border border-red-100'

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${classes} ${className}`}>
      {label}
    </span>
  )
}
