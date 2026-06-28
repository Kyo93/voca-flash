import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SettingsFormData } from '../../hooks/useSettingsForm'

interface MobileSettingsViewProps {
  userEmail?: string
  formData: SettingsFormData
  saving: boolean
  saveMessage: string
  error: string
  onChange: (updates: Partial<SettingsFormData>) => void
  onSave: () => void
  onSignOut: () => void
}

function clampRate(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(1.5, Math.max(0.5, value))
}

export default function MobileSettingsView({
  userEmail,
  formData,
  saving,
  saveMessage,
  error,
  onChange,
  onSave,
  onSignOut,
}: MobileSettingsViewProps) {
  const { t } = useTranslation()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  const populateVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const englishVoices = window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'))
    setVoices(englishVoices)
  }, [])

  useEffect(() => {
    populateVoices()
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.onvoiceschanged = populateVoices
  }, [populateVoices])

  return (
    <main data-mobile-settings className="mobile-page min-h-full pb-32">
      <section className="mobile-panel p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
          {t('mobileNav.profile')}
        </p>
        <h1 className="mt-1 text-xl font-medium leading-tight text-on-surface">{t('settings.title')}</h1>
        <p className="mt-2 text-sm font-medium leading-5 text-on-surface-variant">
          {t('settings.subtitle')}
        </p>
      </section>

      <div className="mt-4 space-y-4">
        {(saveMessage || error) && (
          <div className={`rounded-2xl p-3 text-sm font-medium ${
            error ? 'bg-error/10 text-error' : 'bg-success-container text-success'
          }`}>
            {error || saveMessage}
          </div>
        )}

        <section className="mobile-panel p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">person</span>
            </div>
            <div>
              <h2 className="text-base font-medium text-on-surface">{t('settings.profile')}</h2>
              <p className="text-xs font-medium text-on-surface-variant">{t('settings.profileDesc')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-on-surface-variant">{t('settings.displayName')}</span>
              <input
                type="text"
                value={formData.display_name}
                onChange={(event) => onChange({ display_name: event.target.value })}
                placeholder={t('settings.displayNamePlaceholder')}
                className="min-h-12 w-full rounded-2xl border border-outline-variant/40 bg-surface px-4 text-sm font-medium text-on-surface outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-on-surface-variant">{t('settings.email')}</span>
              <div className="min-h-12 rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface-variant">
                {userEmail || t('common.no_data')}
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-on-surface-variant">{t('settings.avatarUrl')}</span>
              <input
                type="text"
                value={formData.avatar_url}
                onChange={(event) => onChange({ avatar_url: event.target.value })}
                placeholder={t('settings.avatarPlaceholder')}
                className="min-h-12 w-full rounded-2xl border border-outline-variant/40 bg-surface px-4 text-sm font-medium text-on-surface outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>
        </section>

        <section className="mobile-panel p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-container text-secondary">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">school</span>
            </div>
            <div>
              <h2 className="text-base font-medium text-on-surface">{t('settings.learning')}</h2>
              <p className="text-xs font-medium text-on-surface-variant">{t('settings.learningDesc')}</p>
            </div>
          </div>

          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="flex items-center justify-between gap-2 text-xs font-medium text-on-surface-variant">
                <span>{t('settings.dailyTarget')}</span>
                <span className="rounded-full bg-secondary-container px-2 py-1 text-secondary">
                  {formData.daily_target} {t('topics.words')}
                </span>
              </span>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={formData.daily_target}
                onChange={(event) => onChange({ daily_target: Number(event.target.value) })}
                className="h-8 w-full accent-primary"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-on-surface-variant">{t('settings.retentionLabel')}</span>
              <select
                value={formData.srs_intensity}
                onChange={(event) => onChange({ srs_intensity: Number(event.target.value) })}
                className="min-h-12 w-full rounded-2xl border border-outline-variant/40 bg-surface px-4 text-sm font-medium text-on-surface outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              >
                <option value={0.8}>{t('settings.retention80')}</option>
                <option value={0.9}>{t('settings.retention90')}</option>
                <option value={0.95}>{t('settings.retention95')}</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mobile-panel p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">volume_up</span>
            </div>
            <div>
              <h2 className="text-base font-medium text-on-surface">{t('settings.audio')}</h2>
              <p className="text-xs font-medium text-on-surface-variant">{t('settings.audioDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-on-surface-variant">{t('settings.voice')}</span>
              <select
                value={formData.tts_voice || ''}
                onChange={(event) => onChange({ tts_voice: event.target.value })}
                className="min-h-12 w-full rounded-2xl border border-outline-variant/40 bg-surface px-4 text-sm font-medium text-on-surface outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              >
                <option value="">{t('settings.systemDefault')}</option>
                {voices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="flex items-center justify-between gap-2 text-xs font-medium text-on-surface-variant">
                <span>{t('settings.speed')}</span>
                <span className="rounded-full bg-primary-container px-2 py-1 text-primary">
                  {t('profileMobile.rateValue', { rate: clampRate(formData.tts_rate) })}
                </span>
              </span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={formData.tts_rate}
                onChange={(event) => onChange({ tts_rate: Number(event.target.value) })}
                className="h-8 w-full accent-primary"
              />
            </label>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => onChange({ auto_play_audio: !formData.auto_play_audio })}
                className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-surface-container-low px-4 text-left"
                aria-pressed={formData.auto_play_audio}
              >
                <span className="text-sm font-medium text-on-surface">{t('settings.autoPlay')}</span>
                <span className={`relative h-8 w-14 rounded-full transition-colors ${
                  formData.auto_play_audio ? 'bg-primary' : 'bg-outline-variant'
                }`}>
                  <span className={`absolute top-1 h-6 w-6 rounded-full bg-surface transition-transform ${
                    formData.auto_play_audio ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </span>
              </button>

              <div className="grid min-h-12 grid-cols-2 rounded-2xl bg-surface-container-low p-1">
                <button
                  type="button"
                  onClick={() => onChange({ app_language: 'vi' })}
                  className={`rounded-xl text-xs font-medium ${
                    formData.app_language === 'vi' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  {t('profileMobile.languageVi')}
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ app_language: 'en' })}
                  className={`rounded-xl text-xs font-medium ${
                    formData.app_language === 'en' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  {t('profileMobile.languageEn')}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mobile-panel p-4">
          <h2 className="text-base font-medium text-on-surface">{t('profileMobile.accountActions')}</h2>
          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-surface-container-low px-4 text-sm font-medium text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">logout</span>
            {t('settings.logout')}
          </button>
        </section>
      </div>

      <div
        data-mobile-settings-savebar
        className="fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 px-4"
      >
        <div className="mobile-panel mx-auto flex max-w-md items-center justify-between gap-3 p-3">
          <p className="min-w-0 text-xs font-medium leading-5 text-on-surface-variant">
            {t('profileMobile.settingsHint')}
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-on-primary disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {saving ? 'sync' : 'save'}
            </span>
            {saving ? t('settings.saving') : t('profileMobile.saveSettings')}
          </button>
        </div>
      </div>
    </main>
  )
}
