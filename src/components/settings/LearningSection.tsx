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
      description={t('settings.learningDesc')}
      colorClass="text-emerald-600"
      bgClass="bg-emerald-50"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Daily Target */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-600 ml-1">
              {t('settings.dailyTarget')}
            </label>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full shadow-sm">
              {formData.daily_target} {t('topics.words')}
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
            <div className="flex justify-between text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-1">
              <span>{t('settings.relaxed')} (5)</span>
              <span>{t('settings.determined')} (50)</span>
            </div>
          </div>
        </div>

        {/* FSRS Retention */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-stone-600 ml-1">
            {t('settings.retentionLabel')}
          </label>
          <div className="relative group">
            <select
              value={formData.srs_intensity}
              onChange={(e) => onChange({ srs_intensity: Number(e.target.value) })}
              className="w-full px-5 py-4 bg-stone-50/50 border border-stone-200 rounded-2xl text-secondary font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none"
            >
              <option value={0.8}>{t('settings.retention80')}</option>
              <option value={0.9}>{t('settings.retention90')}</option>
              <option value={0.95}>{t('settings.retention95')}</option>
            </select>
            <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 pointer-events-none group-focus-within:text-primary transition-colors">
              expand_more
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-medium italic leading-relaxed ml-1">
            {t('settings.retentionDesc')}
          </p>
        </div>
      </div>
    </SettingsSection>
  )
}
