import { useTranslation } from 'react-i18next'
import SettingsSection from './SettingsSection'

interface LearningSectionProps {
  formData: {
    daily_target: number;
    srs_intensity: number;
  };
  onChange: (updates: Partial<{ daily_target: number; srs_intensity: number }>) => void;
}

export default function LearningSection({ formData, onChange }: LearningSectionProps) {
  const { t } = useTranslation()

  return (
    <SettingsSection
      icon="school"
      title={t('settings.learning')}
      description="Cấu hình mục tiêu hằng ngày và độ nhạy của thuật toán ghi nhớ FSRS."
      colorClass="text-emerald-600"
      bgClass="bg-emerald-50"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Daily Target */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-stone-600 ml-1">
              {t('settings.dailyTarget')}
            </label>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full shadow-sm">
              {formData.daily_target} từ
            </span>
          </div>
          <div className="pt-2 px-1">
            <input 
              type="range" 
              min="5" 
              max="50" 
              step="5"
              value={formData.daily_target}
              onChange={(e) => onChange({ daily_target: Number(e.target.value) })}
              className="w-full h-8 appearance-none bg-transparent cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">
              <span>Nhẹ nhàng (5)</span>
              <span>Quyết tâm (50)</span>
            </div>
          </div>
        </div>
        
        {/* FSRS Retention */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-stone-600 ml-1">
            FSRS Retention (Mức độ ghi nhớ)
          </label>
          <div className="relative group">
            <select 
              value={formData.srs_intensity}
              onChange={(e) => onChange({ srs_intensity: Number(e.target.value) })}
              className="w-full px-5 py-4 bg-stone-50/50 border border-stone-200 rounded-2xl text-secondary font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none"
            >
              <option value={0.8}>80% - Relaxed (Ít ôn tập hơn)</option>
              <option value={0.9}>90% - Standard (Tiêu chuẩn tối ưu)</option>
              <option value={0.95}>95% - Intense (Ghi nhớ cực tốt)</option>
            </select>
            <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 pointer-events-none group-focus-within:text-primary transition-colors">
              expand_more
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-medium italic leading-relaxed ml-1">
            Mức càng cao, bạn sẽ phải ôn tập thường xuyên hơn để đạt được độ ghi nhớ mong muốn. 90% là con số lý tưởng nhất.
          </p>
        </div>
      </div>
    </SettingsSection>
  )
}
