interface DifficultyDotsProps {
  value: number
}

export default function DifficultyDots({ value }: DifficultyDotsProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <div
          key={n}
          className={`w-1.5 h-1.5 rounded-full ${n <= value ? 'bg-primary' : 'bg-stone-200'}`}
        />
      ))}
    </div>
  )
}
