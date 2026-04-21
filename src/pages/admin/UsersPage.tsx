import { useEffect, useState } from 'react'
import { getAllUsers, getUserSrsRecords } from '../../lib/admin-queries'
import type { UserProfile, SrsRecord } from '../../lib/types'
import { formatDetailedDate } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import AdminCard from '../../components/admin/AdminCard'
import { supabase } from '../../lib/supabase'

function UserRow({
  user,
  onClick,
}: {
  user: UserProfile
  onClick: () => void
}) {
  return (
    <tr
      className="border-b border-stone-50 last:border-0 hover:bg-orange-50/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Avatar */}
      <td className="px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-black text-primary">
            {(user.display_name ?? user.email)[0].toUpperCase()}
          </span>
        </div>
      </td>
      {/* Email */}
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-secondary">{user.email}</p>
      </td>
      {/* Display name */}
      <td className="px-4 py-3">
        <p className="text-sm text-stone-500">
          {user.display_name ?? <span className="text-stone-300">—</span>}
        </p>
      </td>
      {/* Joined */}
      <td className="px-4 py-3">
        <p className="text-xs text-stone-400">{new Date(user.created_at).toLocaleDateString('vi-VN')}</p>
      </td>
      {/* Streak */}
      <td className="px-4 py-3">
        {user.streak_days > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
            <span>🔥</span>
            {user.streak_days} ngày
          </span>
        ) : (
          <span className="text-xs text-stone-300">—</span>
        )}
      </td>
      {/* Total words */}
      <td className="px-4 py-3">
        <span className="text-sm font-bold text-secondary">
          {user.total_words}
        </span>
      </td>
      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="px-3 py-1.5 text-xs font-bold text-primary bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors"
        >
          Chi tiết
        </button>
      </td>
    </tr>
  )
}

function UserSrsPanel({ user, onClose }: { user: any; onClose: () => void }) {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('user_words')
        .select('mastery_level')
        .eq('user_id', user.id)
      
      const counts = (data || []).reduce((acc: any, cur: any) => {
        acc[cur.mastery_level] = (acc[cur.mastery_level] || 0) + 1
        return acc
      }, {})
      
      setStats([
        { label: 'Lặp lại', level: 0, count: counts[0] || 0, color: 'bg-red-500', icon: 'history' },
        { label: 'Khó', level: 1, count: counts[1] || 0, color: 'bg-orange-500', icon: 'psychology' },
        { label: 'Tốt', level: 2, count: counts[2] || 0, color: 'bg-green-500', icon: 'task_alt' },
        { label: 'Dễ', level: 3, count: counts[3] || 0, color: 'bg-blue-500', icon: 'auto_awesome' },
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
            <div className="w-14 h-14 rounded-[1.25rem] bg-stone-50 flex items-center justify-center border border-stone-100 shadow-sm overflow-hidden">
               {user.avatar_url ? <img src={user.avatar_url} /> : <span className="text-2xl font-black text-primary">{(user.full_name || user.username || user.email)[0].toUpperCase()}</span>}
            </div>
            <div>
              <h2 className="text-xl font-black text-secondary leading-tight">{user.full_name || user.username || user.email}</h2>
              <p className="text-xs text-stone-400 font-medium">Chi tiết thuật toán SRS</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors">
            <span className="material-symbols-outlined text-stone-400">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <section>
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-6">Phân phối thẻ (SRS Distribution)</h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-xl ${s.color}/10 flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-lg ${s.color.replace('bg-', 'text-')}`}>{s.icon}</span>
                    </div>
                    <span className="text-xs font-black text-stone-400 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <p className="text-3xl font-black text-secondary">{s.count}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-primary/5 to-transparent rounded-[2rem] p-6 border border-primary/5">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Thông tin hệ thống</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-stone-100/50">
                <span className="text-sm text-stone-500 font-medium">User ID</span>
                <span className="text-xs font-mono text-stone-400 truncate max-w-[150px]">{user.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100/50">
                <span className="text-sm text-stone-500 font-medium">Lần cuối online</span>
                <span className="text-xs font-mono text-stone-400">Vừa xong</span>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 bg-stone-50/50 border-t border-stone-100 border-dashed">
          <button className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-sm hover:bg-primary transition-all shadow-xl shadow-secondary/10">
            Xem tất cả từ đang học
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [srsRecords, setSrsRecords] = useState<SrsRecord[]>([])

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
    const { data } = await getUserSrsRecords(user.id)
    setSrsRecords((data as SrsRecord[]) ?? [])
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-secondary">Người dùng</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {loading ? '...' : `${users.length} người dùng đã đăng ký`}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <AdminCard title="Danh sách học viên" description="Quản lý thông tin và theo dõi tiến độ học tập của người dùng.">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-8 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Người dùng</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Email</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Streak</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Tham gia</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Hành động</th>
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
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.full_name || u.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-black text-primary">{(u.full_name || u.username || u.email || '?')[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-secondary leading-tight">{u.full_name || u.username}</p>
                        <p className="text-[10px] text-stone-400 font-mono tracking-wider mt-0.5 uppercase">{u.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-stone-500 font-medium">{u.email}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-500 text-xl filled">local_fire_department</span>
                      <span className="text-sm font-black text-secondary">{u.streak_count || 0}</span>
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
