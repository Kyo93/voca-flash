import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

interface Props {
  rate: number
}

export default function RetentionMetric({ rate }: Props) {
  const percentage = Math.round(rate * 100)
  const data = [
    { value: percentage },
    { value: 100 - percentage }
  ]

  const COLORS = ['var(--color-primary)', 'rgba(0, 0, 0, 0.05)']

  return (
    <div className="relative h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            startAngle={225}
            endAngle={-45}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            cornerRadius={10}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-black text-stone-900"
        >
          {percentage}%
        </motion.span>
        <span className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-2">Retention</span>
      </div>
    </div>
  )
}
