import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, parseISO } from 'date-fns'
import { DESIGN_TOKENS } from '../../lib/tokens'

interface WorkloadForecastProps {
  forecast: { date: string; count: number }[]
}

export default function WorkloadForecast({ forecast }: WorkloadForecastProps) {
  const data = forecast.slice(0, 14)

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(parseISO(date), 'dd/MM')}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fontWeight: 'bold', fill: '#DCC1B1' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fontWeight: 'bold', fill: '#DCC1B1' }}
          />
          <Tooltip 
            cursor={{ fill: '#F9F2EF' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? DESIGN_TOKENS.COLORS.PRIMARY : DESIGN_TOKENS.COLORS.SECONDARY}
                fillOpacity={index === 0 ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
