import { useTranslation } from 'react-i18next'
import { DESIGN_TOKENS } from '../../lib/tokens'

interface StabilityBin {
  label: string
  value: number
  desc: string
  color: string
  bg: string
  pct: number
}

interface FSRSBinsProps {
  bins: StabilityBin[]
}

export default function FSRSBins({ bins }: FSRSBinsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {bins.map((bin, i) => (
        <div key={i} className={`p-8 bg-white ${DESIGN_TOKENS.RADIUS['4XL']} border border-stone-100 ${DESIGN_TOKENS.SHADOW.SM} flex flex-col justify-between hover:${DESIGN_TOKENS.SHADOW.MD} hover:-translate-y-1 transition-all group`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 ${bin.bg} rounded-2xl flex items-center justify-center ${bin.color} shrink-0`}>
              <span className="material-symbols-outlined text-2xl font-variation-fill">psychology</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">Trạng thái</p>
              <p className={`text-[11px] font-black ${bin.color} uppercase tracking-tight`}>{t(bin.label)}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-5xl font-black text-secondary tracking-tight">{bin.value}</p>
              <p className="text-[10px] font-bold text-stone-400 mt-1 italic">{bin.desc}</p>
            </div>
            <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
              <div className={`h-full bg-current ${bin.color} opacity-60`} style={{ width: `${Math.max(5, bin.pct)}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
