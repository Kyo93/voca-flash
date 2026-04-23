import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { DESIGN_TOKENS } from '../../lib/tokens'
import { TIME_CONSTANTS } from '../../lib/constants'

interface Props {
  data: { date: string; reviews: number; duration_ms: number }[]
}

export default function ActivityChart({ data }: Props) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-2xl text-stone-200 mb-2">show_chart</span>
        <p className="text-[10px] text-stone-300 font-medium italic">{t('progress.no_activity')}</p>
      </div>
    )
  }

  const chartData = data.map(item => ({
    ...item,
    minutes: Math.round(item.duration_ms / TIME_CONSTANTS.ONE_MINUTE_MS),
    formattedDate: format(new Date(item.date), 'dd/MM', { locale: vi })
  }))

  const hasMinutes = chartData.some(d => d.minutes > 0)

  if (!hasMinutes) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-2xl text-stone-200 mb-2">show_chart</span>
        <p className="text-[10px] text-stone-300 font-medium italic">{t('progress.no_activity')}</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={DESIGN_TOKENS.COLORS.PRIMARY} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={DESIGN_TOKENS.COLORS.PRIMARY} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="formattedDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
            }}
            itemStyle={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 'black' }}
            labelStyle={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}
          />
          <Area
            type="monotone"
            dataKey="minutes"
            name={t('progress.studyMinutes')}
            stroke={DESIGN_TOKENS.COLORS.PRIMARY}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMinutes)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
