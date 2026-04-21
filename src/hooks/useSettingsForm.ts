import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { updateUserSettings } from '../lib/supabase-storage'
import { setTtsConfig } from '../lib/tts'
import { defaultSettings } from '../lib/settings-defaults'

export interface SettingsFormData {
  daily_target: number
  srs_intensity: number
  tts_voice: string | null
  tts_rate: number
  auto_play_audio: boolean
  app_language: string
  theme_mode: string
  display_name: string
  avatar_url: string
}

export function useSettingsForm() {
  const { t, i18n } = useTranslation()
  const { user, profile, refreshProfile } = useAuth()
  
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<SettingsFormData>({
    daily_target: defaultSettings.daily_target,
    srs_intensity: defaultSettings.srs_intensity,
    tts_voice: defaultSettings.tts_voice,
    tts_rate: defaultSettings.tts_rate,
    auto_play_audio: defaultSettings.auto_play_audio,
    app_language: defaultSettings.app_language,
    theme_mode: defaultSettings.theme_mode,
    display_name: '',
    avatar_url: '',
  })

  // Load Profile Settings
  useEffect(() => {
    if (profile) {
      setFormData({
        daily_target: profile.daily_target ?? defaultSettings.daily_target,
        srs_intensity: profile.srs_intensity ?? defaultSettings.srs_intensity,
        tts_voice: profile.tts_voice ?? defaultSettings.tts_voice,
        tts_rate: profile.tts_rate ?? defaultSettings.tts_rate,
        auto_play_audio: profile.auto_play_audio ?? defaultSettings.auto_play_audio,
        app_language: profile.app_language ?? defaultSettings.app_language,
        theme_mode: profile.theme_mode ?? defaultSettings.theme_mode,
        display_name: profile.display_name ?? '',
        avatar_url: profile.avatar_url ?? '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveMessage('')
    setError('')
    
    try {
      await updateUserSettings(user.id, formData)
      
      // Apply immediate side-effects
      if (formData.app_language !== i18n.language) {
        await i18n.changeLanguage(formData.app_language)
      }
      
      if (formData.tts_voice) {
        setTtsConfig(formData.tts_voice, formData.tts_rate)
      }
      
      // Update AuthContext Profile state
      await refreshProfile()
      
      setSaveMessage(t('settings.saveSuccess'))
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save settings', err)
      setError(t('settings.resetError')) // Reusing common error key or specific save error
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (updates: Partial<SettingsFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  return {
    user,
    formData,
    saving,
    saveMessage,
    error,
    handleChange,
    handleSave
  }
}
