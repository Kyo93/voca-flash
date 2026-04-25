import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SettingsSection from './SettingsSection'

interface ProfileSectionProps {
  userEmail: string | undefined;
  formData: {
    display_name: string;
    avatar_url: string;
  };
  onChange: (updates: Partial<{ display_name: string; avatar_url: string }>) => void;
}

export default function ProfileSection({ userEmail, formData, onChange }: ProfileSectionProps) {
  const { t } = useTranslation()
  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    setAvatarError(false)
  }, [formData.avatar_url])

  const isBadPattern = formData.avatar_url.includes('photos.app.goo.gl') ||
    formData.avatar_url.includes('drive.google.com') ||
    (formData.avatar_url.includes('imgur.com') && !/\.(jpg|jpeg|png|webp|gif)$/.test(formData.avatar_url.split('?')[0]))

  return (
    <SettingsSection
      icon="person"
      title={t('settings.profile')}
      description={t('settings.profileDesc')}
      colorClass="text-blue-600"
      bgClass="bg-blue-50"
    >
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Avatar Preview Section */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 rounded-4xl bg-stone-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
            {formData.avatar_url && !avatarError ? (
              <img
                src={formData.avatar_url}
              alt={t('settings.avatarAlt')}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-200">
                <span className="material-symbols-outlined text-5xl">
                  {avatarError ? 'broken_image' : 'face'}
                </span>
                {avatarError && <span className="text-[9px] font-black uppercase text-rose-400 mt-1">{t('settings.linkError')}</span>}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-stone-100 flex items-center justify-center text-stone-400">
            <span className="material-symbols-outlined text-xl">camera_alt</span>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-600 ml-1">
                {t('settings.displayName')}
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => onChange({ display_name: e.target.value })}
                placeholder={t('settings.displayNamePlaceholder')}
                className="w-full px-5 py-4 bg-stone-50/50 border border-stone-200 rounded-2xl text-secondary font-medium focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-600 ml-1">
                {t('settings.email')}
              </label>
              <div className="px-5 py-4 bg-stone-100/50 border border-stone-200 rounded-2xl text-stone-400 font-medium italic opacity-70 cursor-not-allowed">
                {userEmail || '—'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600 ml-1">
              {t('settings.avatarUrl')}
            </label>
            <div className="relative group">
              <input
                type="text"
                value={formData.avatar_url}
                onChange={(e) => {
                  const val = e.target.value
                  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
                  const match = val.match(driveRegex)
                  if (match && match[1]) {
                    onChange({ avatar_url: `https://lh3.googleusercontent.com/d/${match[1]}` })
                  } else {
                    onChange({ avatar_url: val })
                  }
                }}
              placeholder={t('settings.avatarPlaceholder')}
                className="w-full px-5 py-4 bg-stone-50/50 border border-stone-200 rounded-2xl text-secondary font-medium focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all pr-12"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-300 group-focus-within:text-primary transition-colors">link</span>
            </div>
          </div>

          {isBadPattern && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 animate-pulse-subtle">
              <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                {t('settings.badLinkWarning')}
              </p>
            </div>
          )}

          <p className="text-[11px] text-stone-400 font-medium italic ml-1">
            {t('settings.imgurTip')}
          </p>
        </div>
      </div>
    </SettingsSection>
  )
}
