import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import SettingsSection from './SettingsSection'

interface AudioSectionProps {
  formData: {
    tts_voice: string | null;
    tts_rate: number;
    auto_play_audio: boolean;
    app_language: string;
  };
  onChange: (updates: Partial<{ tts_voice: string; tts_rate: number; auto_play_audio: boolean; app_language: string }>) => void;
}

export default function AudioSection({ formData, onChange }: AudioSectionProps) {
  const { t } = useTranslation()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  const populateVoices = useCallback(() => {
    if (!window.speechSynthesis) return
    const availableVoices = window.speechSynthesis.getVoices()
    const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'))
    setVoices(englishVoices)

    // Automatically select a default voice if none matches
    if (englishVoices.length > 0 && !formData.tts_voice) {
      const preferred = englishVoices.find(v => !v.name.includes('Google')) || englishVoices[0]
      onChange({ tts_voice: preferred.voiceURI })
    }
  }, [formData.tts_voice, onChange])

  useEffect(() => {
    populateVoices()
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = populateVoices
    }
  }, [populateVoices])

  return (
    <SettingsSection
      icon="volume_up"
      title={t('settings.audio')}
      description={t('settings.audioDesc')}
      colorClass="text-purple-600"
      bgClass="bg-purple-50"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Voice Selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-stone-600 ml-1">
            {t('settings.voice')}
          </label>
          <div className="relative group">
            <select
              value={formData.tts_voice || ''}
              onChange={(e) => onChange({ tts_voice: e.target.value })}
              className="w-full px-5 py-4 bg-stone-50/50 border border-stone-200 rounded-2xl text-secondary font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none"
            >
              {voices.length === 0 && <option value="">{t('settings.loadingVoices')}</option>}
              <option value="">{t('settings.systemDefault')}</option>
              {voices.map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </option>
              ))}
            </select>
            <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 pointer-events-none group-focus-within:text-primary transition-colors">
              expand_more
            </span>
          </div>
        </div>

        {/* Speech Rate */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-600 ml-1">
              {t('settings.speed')}
            </label>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full shadow-sm">
              {formData.tts_rate}x
            </span>
          </div>
          <div className="pt-2 px-1">
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={formData.tts_rate}
              onChange={(e) => onChange({ tts_rate: Number(e.target.value) })}
              className="w-full h-8 appearance-none bg-transparent cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-1">
              <span>{t('settings.slow')} (0.5)</span>
              <span>{t('settings.fast')} (1.5)</span>
            </div>
          </div>
        </div>

        {/* Auto Play Toggle */}
        <div className="flex items-center justify-between p-5 bg-stone-50/50 border border-stone-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 shadow-sm">
              <span className="material-symbols-outlined font-variation-fill">play_circle</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-secondary">{t('settings.autoPlay')}</span>
              <span className="block text-[10px] text-stone-400 font-medium leading-tight">{t('settings.autoPlayDesc')}</span>
            </div>
          </div>
          <button
            onClick={() => onChange({ auto_play_audio: !formData.auto_play_audio })}
            className={`w-14 h-8 rounded-full transition-all relative ${formData.auto_play_audio ? 'bg-primary' : 'bg-stone-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${formData.auto_play_audio ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Interface Language */}
        <div className="flex items-center justify-between p-5 bg-stone-50/50 border border-stone-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 shadow-sm">
              <span className="material-symbols-outlined font-variation-fill">language</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-secondary">{t('settings.language')}</span>
              <span className="block text-[10px] text-stone-400 font-medium leading-tight">{t('settings.languageDesc')}</span>
            </div>
          </div>
          <div className="flex bg-stone-200/50 p-1 rounded-xl">
            <button
              onClick={() => onChange({ app_language: 'vi' })}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${formData.app_language === 'vi' ? 'bg-white text-primary shadow-sm' : 'text-stone-500'}`}
            >
              VI
            </button>
            <button
              onClick={() => onChange({ app_language: 'en' })}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${formData.app_language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-stone-500'}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}
