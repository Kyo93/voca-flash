import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { updateUserSettings, resetTopicProgress, fetchAllTopics } from '../lib/supabase-storage'
import { setTtsConfig } from '../lib/tts'
import { Topic } from '../lib/types'
import { defaultSettings } from '../lib/settings-defaults'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, profile, refreshProfile, signOut } = useAuth()
  
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  
  const [formData, setFormData] = useState({
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

  // Avatar validation
  const [avatarError, setAvatarError] = useState(false)
  
  // Reset error when URL changes
  useEffect(() => {
    setAvatarError(false)
  }, [formData.avatar_url])

  const isBadPattern = formData.avatar_url.includes('photos.app.goo.gl') || 
                       formData.avatar_url.includes('drive.google.com') ||
                       (formData.avatar_url.includes('imgur.com') && !/\.(jpg|jpeg|png|webp|gif)$/.test(formData.avatar_url.split('?')[0]))

  // Danger Zone states
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)

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

  // Fetch Topics for reset dropdown
  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await fetchAllTopics()
        setTopics(data)
      } catch (err) {
        console.error('Failed to load topics', err)
      }
    }
    loadTopics()
  }, [])

  // SpeechSynthesis Voices
  const populateVoices = useCallback(() => {
    if (!window.speechSynthesis) return
    const availableVoices = window.speechSynthesis.getVoices()
    const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'))
    setVoices(englishVoices)
    
    // Automatically select a default voice if none matches and we have options
    if (englishVoices.length > 0 && !formData.tts_voice && !profile?.tts_voice) {
      const preferred = englishVoices.find(v => !v.name.includes('Google')) || englishVoices[0]
      setFormData(prev => ({ ...prev, tts_voice: preferred.voiceURI }))
    }
  }, [formData.tts_voice, profile])

  useEffect(() => {
    populateVoices()
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = populateVoices
    }
  }, [populateVoices])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveMessage('')
    try {
      await updateUserSettings(user.id, formData)
      
      // Apply immediate side-effects
      if (formData.app_language !== i18n.language) {
        i18n.changeLanguage(formData.app_language)
      }
      setTtsConfig(formData.tts_voice, formData.tts_rate)
      
      // Update AuthContext Profile state
      await refreshProfile()
      
      setSaveMessage(t('settings.saveSuccess'))
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save settings', err)
      setSaveMessage('Lỗi khi lưu cài đặt!')
    } finally {
      setSaving(false)
    }
  }

  const handleResetTopic = async () => {
    if (!selectedTopicId) return
    setResetting(true)
    try {
      await resetTopicProgress(selectedTopicId)
      setSelectedTopicId('')
      setShowConfirmReset(false)
      alert('Đã xóa tiến độ thành công!')
    } catch (err) {
      alert('Không thể xóa tiến độ lúc này.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="px-10 py-8 overflow-y-auto" style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tight mb-2">{t('settings.title')}</h1>
          <p className="text-stone-500 font-medium">
            Tùy chỉnh trải nghiệm học tập theo phong cách của bạn.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 primary-gradient text-white font-bold text-sm rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all w-full md:w-auto justify-center disabled:opacity-50 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-lg">
            {saving ? 'sync' : 'save'}
          </span>
          {saving ? t('settings.saving') : t('settings.save')}
        </button>
      </div>

      {saveMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined font-variation-fill">check_circle</span>
          <span className="font-bold">{saveMessage}</span>
        </div>
      )}

      <div className="space-y-8 pb-20">
        {/* Profile Card */}
        <section className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-stone-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <span className="material-symbols-outlined font-variation-fill">person</span>
            </div>
            <h2 className="text-xl font-black text-secondary">{t('settings.profile')}</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-full bg-stone-100 border-4 border-white shadow-xl flex items-center justify-center relative group overflow-hidden shrink-0">
              {formData.avatar_url && !avatarError ? (
                <img 
                  src={formData.avatar_url} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-300">
                  <span className="material-symbols-outlined text-4xl">
                    {avatarError ? 'broken_image' : 'account_circle'}
                  </span>
                  {avatarError && <span className="text-[8px] font-bold mt-1 uppercase text-rose-400">Lỗi Link</span>}
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-sm">visibility</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                    {t('settings.displayName') || 'Họ và tên'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.display_name} 
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                    placeholder="VD: Ocean Nguyen"
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-secondary font-medium focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                    {t('settings.email')}
                  </label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-stone-400 font-medium opacity-70 italic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                  {t('settings.avatarUrl') || 'Link ảnh đại diện (URL)'}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.avatar_url} 
                    onChange={(e) => {
                      const val = e.target.value
                      const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
                      const match = val.match(driveRegex)
                      if (match && match[1]) {
                        setFormData({...formData, avatar_url: `https://lh3.googleusercontent.com/d/${match[1]}`})
                      } else {
                        setFormData({...formData, avatar_url: val})
                      }
                    }}
                    placeholder="https://images.unsplash.com/photo..."
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-secondary font-medium focus:border-primary outline-none transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-300">link</span>
                </div>
              </div>

                {isBadPattern && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2 animate-pulse-subtle">
                    <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                      Link này có vẻ là <strong>link chia sẻ</strong>, không phải link ảnh trực tiếp. Vui lòng chuột phải vào ảnh chọn <span className="bg-amber-100 px-1 rounded text-amber-800">"Copy Image Address"</span> hoặc dùng Imgur để có kết quả tốt nhất.
                    </p>
                  </div>
                )}

                <p className="text-[10px] text-stone-400 mt-2 font-medium italic">
                  Ưu tiên dùng link trực tiếp (kết thúc bằng .jpg, .png, .webp). Thử dùng <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="text-primary hover:underline">Imgur</a> nếu bạn chưa có link.
                </p>
              </div>
            </div>
          </section>

        {/* Learning Preferences */}
        <section className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-stone-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined font-variation-fill">school</span>
            </div>
            <h2 className="text-xl font-black text-secondary">{t('settings.learning')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                {t('settings.dailyTarget')}
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="5"
                  value={formData.daily_target}
                  onChange={(e) => setFormData({...formData, daily_target: Number(e.target.value)})}
                  className="flex-1 accent-primary"
                />
                <span className="w-12 text-center font-black text-secondary text-lg">{formData.daily_target}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                FSRS Retention (Mức độ ghi nhớ)
              </label>
              <select 
                value={formData.srs_intensity}
                onChange={(e) => setFormData({...formData, srs_intensity: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-secondary font-medium outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
              >
                <option value={0.8}>80% - Relaxed (Ít ôn tập hơn)</option>
                <option value={0.9}>90% - Standard (Tiêu chuẩn tối ưu)</option>
                <option value={0.95}>95% - Intense (Ghi nhớ cực tốt)</option>
              </select>
              <p className="text-[10px] text-stone-400 mt-2 italic px-1">Mức càng cao, bạn sẽ phải ôn tập thường xuyên hơn để đạt được độ ghi nhớ mong muốn.</p>
            </div>
          </div>
        </section>

        {/* Audio & Interface */}
        <section className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-stone-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <span className="material-symbols-outlined font-variation-fill">volume_up</span>
            </div>
            <h2 className="text-xl font-black text-secondary">{t('settings.audio')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                {t('settings.voice')}
              </label>
              <select 
                value={formData.tts_voice || ''}
                onChange={(e) => setFormData({...formData, tts_voice: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-secondary font-medium outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
              >
                {voices.length === 0 && <option value="">Đang tải giọng đọc...</option>}
                <option value="">(Mặc định của hệ thống)</option>
                {voices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                {t('settings.speed')}
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.05"
                  value={formData.tts_rate}
                  onChange={(e) => setFormData({...formData, tts_rate: Number(e.target.value)})}
                  className="flex-1 accent-primary"
                />
                <span className="w-12 text-center font-black text-secondary text-lg">{formData.tts_rate}x</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-stone-400">play_circle</span>
                 <span className="font-bold text-secondary text-sm">{t('settings.autoPlay')}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.auto_play_audio}
                  onChange={(e) => setFormData({...formData, auto_play_audio: e.target.checked})}
                />
                <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-stone-400">language</span>
                 <span className="font-bold text-secondary text-sm">{t('settings.language')}</span>
              </div>
              <div className="flex bg-stone-200 rounded-lg p-1">
                <button
                  onClick={() => setFormData({...formData, app_language: 'vi'})}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${formData.app_language === 'vi' ? 'bg-white text-primary shadow-sm' : 'text-stone-500'}`}
                >
                  Việt
                </button>
                <button
                  onClick={() => setFormData({...formData, app_language: 'en'})}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${formData.app_language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-stone-500'}`}
                >
                  Eng
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 p-8 rounded-[2rem] border border-red-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-red-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
              <span className="material-symbols-outlined font-variation-fill">warning</span>
            </div>
            <h2 className="text-xl font-black text-red-700">{t('settings.dangerZone')}</h2>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-red-700 mb-1">{t('settings.resetProgress')}</h3>
              <p className="text-sm text-stone-500">Xóa vĩnh viễn tiến độ học của một chủ đề.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <select 
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-secondary font-medium outline-none focus:border-red-300 w-full md:w-48 appearance-none"
              >
                <option value="">{t('settings.selectTopic')}</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
              
              <button
                disabled={!selectedTopicId}
                onClick={() => setShowConfirmReset(true)}
                className="px-6 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
              >
                Xóa tiến độ
              </button>
            </div>
          </div>
          
          <div className="pt-4 flex justify-start">
             <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-500 hover:text-stone-700 hover:bg-stone-200 font-bold text-sm rounded-xl transition-colors"
             >
               <span className="material-symbols-outlined">logout</span>
               {t('settings.logout')}
             </button>
          </div>
        </section>
      </div>

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-slide-up">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            
            <h3 className="text-2xl font-black text-center text-secondary mb-2">
              Xác nhận xóa
            </h3>
            
            <p className="text-center text-stone-500 font-medium mb-8">
              {t('settings.resetConfirm')} <br/>
              <span className="text-red-500 font-bold">{t('settings.resetDesc')}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-3 font-bold text-stone-500 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleResetTopic}
                disabled={resetting}
                className="px-4 py-3 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                {resetting && <span className="material-symbols-outlined animate-spin font-variation-fill">progress_activity</span>}
                {resetting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
