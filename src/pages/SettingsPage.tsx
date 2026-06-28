import { useTranslation } from 'react-i18next'
import { useSettingsForm } from '../hooks/useSettingsForm'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useAuth } from '../contexts/AuthContext'

import ProfileSection from '../components/settings/ProfileSection'
import LearningSection from '../components/settings/LearningSection'
import AudioSection from '../components/settings/AudioSection'
import DangerZoneSection from '../components/settings/DangerZoneSection'
import MobileSettingsView from '../components/mobile/MobileSettingsView'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const isMobileProfile = useMediaQuery('(max-width: 767px)')
  const {
    user,
    formData,
    saving,
    saveMessage,
    error,
    handleChange,
    handleSave
  } = useSettingsForm()

  if (isMobileProfile) {
    return (
      <MobileSettingsView
        userEmail={user?.email}
        formData={formData}
        saving={saving}
        saveMessage={saveMessage}
        error={error}
        onChange={handleChange}
        onSave={handleSave}
        onSignOut={signOut}
      />
    )
  }

  return (
    <div className="relative px-6 md:px-10 py-8 overflow-y-auto min-h-full">
      <div className="max-w-[800px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-semibold text-secondary tracking-tight mb-2">{t('settings.title')}</h1>
            <p className="text-stone-500 font-medium">
              {t('settings.subtitle')}
            </p>
          </div>

          {/* Desktop Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="hidden md:flex items-center gap-2 px-8 py-4 primary-gradient text-white font-medium text-sm rounded-2xl shadow-[0_10px_30px_rgba(255,145,0,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-xl">
              {saving ? 'sync' : 'save'}
            </span>
            {saving ? t('settings.saving') : t('settings.save')}
          </button>
        </div>

        {/* Status Messages */}
        <div className="space-y-4 mb-8">
          {saveMessage && (
            <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-200/50 flex items-center gap-3 animate-fade-in shadow-sm">
              <span className="material-symbols-outlined font-variation-fill">check_circle</span>
              <span className="font-medium">{saveMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200/50 flex items-center gap-3 animate-fade-in shadow-sm">
              <span className="material-symbols-outlined font-variation-fill">error</span>
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 gap-10 pb-32">
          <ProfileSection
            userEmail={user?.email}
            formData={formData}
            onChange={handleChange}
          />

          <LearningSection
            formData={formData}
            onChange={handleChange}
          />

          <AudioSection
            formData={formData}
            onChange={handleChange}
          />

          <DangerZoneSection />
        </div>
      </div>

      {/* Floating Save Button (Mobile & Secondary accessibility) */}
      <div className="fixed bottom-10 left-0 right-0 px-6 z-50 md:hidden pointer-events-none">
        <div className="max-w-[800px] mx-auto flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="pointer-events-auto flex items-center justify-center w-16 h-16 primary-gradient text-white rounded-full shadow-[0_15px_40px_rgba(255,145,0,0.4)] hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            title={t('settings.save')}
          >
            <span className="material-symbols-outlined text-3xl">
              {saving ? 'sync' : 'save'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

