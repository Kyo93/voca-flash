import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { DESIGN_TOKENS } from '../../lib/tokens'

interface MasteryDistributionProps {
  distribution: {
    new?: number
    learning?: number
    review?: number
    relearning?: number
  }
}

export default function MasteryDistribution({ distribution }: MasteryDistributionProps) {
  const { t } = useTranslation()

  const data = [
    { name: t('progress.mastery.new'), value: distribution.new || 0, color: '#f5f5f4' }, // stone-100
    { name: t('progress.mastery.learning'), value: distribution.learning || 0, color: '#3b82f6' }, // blue-500
    { name: t('progress.mastery.review'), value: distribution.review || 0, color: '#22c55e' }, // green-500
    { name: t('progress.mastery.relearning'), value: distribution.relearning || 0, color: '#ef4444' }, // red-500
  ].filter(d => d.value > 0)

  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className={`bg-white p-10 ${DESIGN_TOKENS.RADIUS['4XL']} border border-stone-100 ${DESIGN_TOKENS.SHADOW.SM}`}>
      <div className="flex items-center gap-2 mb-8">
        <span className="material-symbols-outlined text-primary text-lg">donut_large</span>
        <h3 className="text-sm font-black text-secondary tracking-tight uppercase">{t('progress.mastery_distribution')}</h3>
      </div>

      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-3xl font-black text-secondary tracking-tighter">{total}</p>
          <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest leading-none">{t('progress.total_words')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-tight leading-none">{item.name}</span>
              <span className="text-xs font-black text-secondary">{item.value} ({((item.value / total) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
