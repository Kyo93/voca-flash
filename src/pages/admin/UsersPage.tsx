import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAllUsers } from '../../lib/queries/user-queries'
import type { UserProfile } from '../../lib/types'
import { formatDetailedDate } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import AdminCard from '../../components/admin/AdminCard'
import ErrorBanner from '../../components/common/ErrorBanner'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { supabase } from '../../lib/supabase'
import { FSRS_STATES } from '../../lib/constants'

interface FsrsStateStat {
  label: string
  state: number
  count: number
  color: string
  icon: string
}

function UserSrsPanel({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const { t } = useTranslation()
  const [stats, setStats] = useState<FsrsStateStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('user_srs_records')
        .select('fsrs_state')
        .eq('user_id', user.id)

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
  }, [user.id])

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

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    getAllUsers()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setUsers((data as UserProfile[]) ?? [])
        setLoading(false)
      })
  }, [])

  async function handleSelectUser(user: UserProfile) {
    setSelectedUser(user)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-secondary">{t('admin.users.title')}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {loading ? '...' : t('admin.users.count', { count: users.length })}
        </p>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}

      <AdminCard title={t('admin.users.table.title')} description={t('admin.users.table.description')}>
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-8 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.user')}</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.email')}</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.streak')}</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.joined')}</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-all cursor-pointer ${selectedUser?.id === u.id ? 'bg-primary/5' : ''}`}
                  onClick={() => handleSelectUser(u)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.display_name || u.email} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-black text-primary">{(u.display_name || u.email || '?')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-secondary leading-tight">{u.display_name || u.email}</p>
                        <p className="text-[10px] text-stone-400 font-mono tracking-wider mt-0.5 uppercase">{t('admin.users.table.student')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-stone-500 font-medium">{u.email}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-500 text-xl filled">local_fire_department</span>
                      <span className="text-sm font-black text-secondary">{u.streak_days || 0}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[10px] text-stone-400 font-mono">{formatDetailedDate(u.created_at)}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      className="w-10 h-10 rounded-2xl flex items-center justify-center bg-stone-100 text-stone-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xl">stat_3</span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AnimatePresence>
        {selectedUser && (
          <UserSrsPanel
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
