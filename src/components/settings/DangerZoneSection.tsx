import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { resetTopicProgress, resetAllProgress, fetchAllTopics } from '../../lib/supabase-storage'
import { Topic } from '../../lib/types'
import SettingsSection from './SettingsSection'
import { TIME_CONSTANTS } from '../../lib/constants'

export default function DangerZoneSection() {
  const { t } = useTranslation()
  const { signOut } = useAuth()

  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [showConfirmGlobal, setShowConfirmGlobal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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

  const handleResetTopic = async () => {
    if (!selectedTopicId) return
    setLoading(true)
    setMessage(null)
    try {
      await resetTopicProgress(selectedTopicId)
      setSelectedTopicId('')
      setShowConfirmReset(false)
      setMessage({ type: 'success', text: t('settings.resetSuccess') })
    } catch (err) {
      setMessage({ type: 'error', text: t('settings.resetError') })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), TIME_CONSTANTS.TIMEOUT_SHORT_MS)
    }
  }

  const handleResetGlobal = async () => {
    setLoading(true)
    setMessage(null)
    try {
      await resetAllProgress()
      setShowConfirmGlobal(false)
      setMessage({ type: 'success', text: t('settings.resetSuccess') })
    } catch (err) {
      setMessage({ type: 'error', text: t('settings.resetError') })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), TIME_CONSTANTS.TIMEOUT_SHORT_MS)
    }
  }

  return (
    <SettingsSection
      icon="warning"
      title={t('settings.dangerZone')}
      description={t('settings.dangerZoneDesc')}
      colorClass="text-rose-600"
      bgClass="bg-rose-50"
    >
      <div className="space-y-6">
        {/* Reset Topic */}
        <div className="bg-stone-50/50 p-6 rounded-3xl border border-stone-200/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="font-semibold text-secondary mb-1">{t('settings.resetProgress')}</h3>
            <p className="text-[11px] text-stone-400 font-medium leading-relaxed">{t('settings.resetProgressDesc')}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative group">
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="px-5 py-3 bg-white border border-stone-200 rounded-2xl text-secondary font-medium outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-400/5 transition-all text-sm w-full md:w-48 appearance-none cursor-pointer"
              >
                <option value="">{t('settings.selectTopic')}</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 pointer-events-none group-focus-within:text-rose-400 transition-colors">
                expand_more
              </span>
            </div>

            <button
              disabled={!selectedTopicId || loading}
              onClick={() => setShowConfirmReset(true)}
              className="px-6 py-3 bg-rose-50 text-rose-600 font-semibold rounded-2xl hover:bg-rose-100 transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap text-sm shadow-sm"
            >
              {t('settings.resetAction')}
            </button>
          </div>
        </div>

        {/* Reset Global */}
        <div className="bg-rose-50/30 p-6 rounded-3xl border border-rose-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="font-semibold text-rose-700 mb-1">{t('settings.resetGlobal')}</h3>
            <p className="text-[11px] text-rose-600/70 font-medium leading-relaxed">{t('settings.resetGlobalDesc')}</p>
          </div>

          <button
            disabled={loading}
            onClick={() => setShowConfirmGlobal(true)}
            className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-2xl hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap text-sm shadow-lg shadow-rose-200"
          >
            {t('settings.resetGlobal')}
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
            <span className="material-symbols-outlined font-variation-fill">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        {/* Logout */}
        <div className="pt-4 border-t border-stone-100 flex justify-start">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-8 py-4 bg-stone-100 text-stone-500 hover:text-stone-700 hover:bg-stone-200 font-semibold text-sm rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined">logout</span>
            {t('settings.logout')}
          </button>
        </div>
      </div>

      {/* Reset Topic Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-md flex items-center justify-center z-1000 p-6 animate-fade-in touch-none">
          <div className="bg-white rounded-4xl p-10 max-w-md w-full shadow-2xl relative animate-slide-up border border-stone-100">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-500 shadow-inner">
              <span className="material-symbols-outlined text-4xl font-variation-fill">delete_forever</span>
            </div>

            <h3 className="text-2xl font-semibold text-center text-secondary mb-3">
              {t('settings.resetGlobalConfirm')}
            </h3>

            <p className="text-center text-stone-400 font-medium mb-10 leading-relaxed">
              {t('settings.resetConfirm')} <br />
              <span className="text-rose-500 font-semibold mt-2 block">{t('settings.resetDesc')}</span>
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-6 py-4 font-semibold text-stone-500 bg-stone-100 rounded-2xl hover:bg-stone-200 transition-all active:scale-95"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={handleResetTopic}
                disabled={loading}
                className="px-6 py-4 font-semibold text-white bg-rose-500 rounded-2xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-rose-200"
              >
                {loading && <span className="material-symbols-outlined animate-spin font-variation-fill text-xl">progress_activity</span>}
                {loading ? t('settings.deleting') : t('settings.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Reset Modal */}
      {showConfirmGlobal && (
        <div className="fixed inset-0 bg-rose-950/40 backdrop-blur-md flex items-center justify-center z-1000 p-6 animate-fade-in">
          <div className="bg-white rounded-4xl p-12 max-w-lg w-full shadow-2xl relative animate-slide-up border border-rose-100">
            <div className="w-24 h-24 bg-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-10 text-white shadow-xl rotate-3">
              <span className="material-symbols-outlined text-5xl font-variation-fill">bomb</span>
            </div>

            <h3 className="text-3xl font-semibold text-center text-rose-700 mb-4">
              {t('settings.resetGlobalConfirm')}
            </h3>

            <p className="text-center text-stone-500 font-medium mb-10 leading-relaxed px-4">
              {t('settings.resetGlobalDesc')} <br />
              <span className="text-rose-600 bg-rose-50 px-3 py-1 rounded-lg mt-4 inline-block transform -rotate-1">{t('settings.cannotUndo')}</span>
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleResetGlobal}
                disabled={loading}
                className="w-full py-5 font-semibold text-white bg-rose-600 rounded-3xl hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl shadow-rose-200"
              >
                {loading && <span className="material-symbols-outlined animate-spin font-variation-fill">progress_activity</span>}
                {loading ? t('settings.deleting') : t('settings.confirmDelete')}
              </button>
              <button
                onClick={() => setShowConfirmGlobal(false)}
                className="w-full py-5 font-semibold text-stone-400 bg-stone-100 rounded-3xl hover:bg-stone-200 transition-all active:scale-[0.98]"
              >
                {t('settings.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsSection>
  )
}

