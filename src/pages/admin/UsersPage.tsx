import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAllUsers } from '../../lib/queries/user-queries'
import type { UserProfile } from '../../lib/types'
import { formatDetailedDate } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import AdminCard from '../../components/admin/AdminCard'
import ErrorBanner from '../../components/common/ErrorBanner'
import UserSrsPanel from '../../components/admin/UserSrsPanel'

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

return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-secondary">{t('admin.users.title')}</h1>
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
                <th className="px-8 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.user')}</th>
                <th className="px-8 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.email')}</th>
                <th className="px-8 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.streak')}</th>
                <th className="px-8 py-4 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.joined')}</th>
                <th className="px-8 py-4 text-right text-[10px] font-semibold text-stone-400 uppercase tracking-[0.2em]">{t('admin.users.table.header.actions')}</th>
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
                  onClick={() => setSelectedUser(u)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.display_name || u.email} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-semibold text-primary">{(u.display_name || u.email || '?')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-secondary leading-tight">{u.display_name || u.email}</p>
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
                      <span className="text-sm font-semibold text-secondary">{u.streak_days || 0}</span>
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
