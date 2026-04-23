import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { FSRS_STATES } from '../../lib/constants'
import type { UserProfile } from '../../lib/types'
import LoadingSpinner from '../common/LoadingSpinner'

interface FsrsStateStat {
  label: string
  state: number
  count: number
  color: string
  icon: string
}

/**
 * Fetches and tallies an admin-viewed user's SRS-record states.
 * Returns stats + loading + error suitable for rendering in the side panel.
 */
function useUserSrsStats(userId: string) {
  const { t } = useTranslation()
  const [stats, setStats] = useState<FsrsStateStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('user_srs_records')
        .select('fsrs_state')
        .eq('user_id', userId)
      if (cancelled) return
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const counts = (data ?? []).reduce<Record<number, number>>((acc, record) => {
        const state = record.fsrs_state ?? FSRS_STATES.NEW
        acc[state] = (acc[state] ?? 0) + 1
        return acc
      }, {})

      setStats([
        { label: t('admin.users.panel.levels.again'), state: FSRS_STATES.NEW, count: counts[FSRS_STATES.NEW] ?? 0, color: 'bg-red-500', icon: 'history' },
        { label: t('admin.users.panel.levels.hard'), state: FSRS_STATES.LEARNING, count: counts[FSRS_STATES.LEARNING] ?? 0, color: 'bg-orange-500', icon: 'psychology' },
        { label: t('admin.users.panel.levels.good'), state: FSRS_STATES.REVIEW, count: counts[FSRS_STATES.REVIEW] ?? 0, color: 'bg-green-500', icon: 'task_alt' },
        { label: t('admin.users.panel.levels.easy'), state: FSRS_STATES.RELEARNING, count: counts[FSRS_STATES.RELEARNING] ?? 0, color: 'bg-blue-500', icon: 'auto_awesome' },
      ])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [userId, t])

  return { stats, loading, error }
}

export default function UserSrsPanel({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const { t } = useTranslation()
  const { stats, loading } = useUserSrsStats(user.id)

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-secondary/20 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-surface-container-lowest border-l border-white/20 shadow-2xl pointer-events-auto flex flex-col"
      >
        <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100 shadow-sm overflow-hidden">
              {user.avatar_url ? <img src={user.avatar_url} /> : <span className="text-2xl font-black text-primary">{(user.display_name || user.email)[0].toUpperCase()}</span>}
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary leading-tight">{user.display_name || user.email}</h2>
              <p className="text-xs text-stone-400 font-medium">{t('admin.users.panel.srsDetails')}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors">
            <span className="material-symbols-outlined text-stone-400">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <section>
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-6">{t('admin.users.panel.distribution')}</h3>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <LoadingSpinner size="text-3xl" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-xl ${stat.color}/10 flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-lg ${stat.color.replace('bg-', 'text-')}`}>{stat.icon}</span>
                      </div>
                      <span className="text-xs font-black text-stone-400 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <p className="text-3xl font-black text-secondary">{stat.count}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-linear-to-br from-primary/5 to-transparent rounded-3xl p-6 border border-primary/5">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">{t('admin.users.panel.systemInfo')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-stone-100/50">
                <span className="text-sm text-stone-500 font-medium">User ID</span>
                <span className="text-xs font-mono text-stone-400 truncate max-w-[150px]">{user.id}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 bg-stone-50/50 border-t border-stone-100 border-dashed">
          <button className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-sm hover:bg-primary transition-all shadow-xl shadow-secondary/10">
            {t('admin.users.panel.viewAll')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
