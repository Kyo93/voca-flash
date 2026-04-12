import { useEffect, useState } from 'react'
import { getAllUsers, getUserSrsRecords } from '../../lib/admin-queries'
import type { UserProfile, SrsRecord } from '../../lib/types'

function UserRow({
  user,
  onClick,
}: {
  user: UserProfile
  onClick: () => void
}) {
  const joined = new Date(user.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

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
        <p className="text-xs text-stone-400">{joined}</p>
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

function UserSrsPanel({
  user,
  progress,
  onClose,
}: {
  user: UserProfile
  progress: SrsRecord[]
  onClose: () => void
}) {
  const mastered = progress.filter((p) => p.mastered).length
  const learning = progress.filter((p) => !p.mastered && (p.repetitions > 0 || p.lapse_count > 0)).length
  const total = progress.length

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-100">
          <div>
            <h2 className="text-xl font-black text-secondary">Chi tiết người dùng</h2>
            <p className="text-sm text-stone-400 mt-1">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-stone-100">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-green-600">{mastered}</p>
              <p className="text-xs font-bold text-green-500">Đã master</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-orange-600">{learning}</p>
              <p className="text-xs font-bold text-orange-500">Đang học</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-blue-600">{total}</p>
              <p className="text-xs font-bold text-blue-500">Tổng số</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-stone-400 mb-1">
              <span>Tiến độ master</span>
              <span>{total > 0 ? Math.round((mastered / total) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${total > 0 ? (mastered / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progress list */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-black text-stone-500 uppercase tracking-wider mb-3">
            Lịch sử học tập
          </h3>
          {progress.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">Chưa có tiến độ học tập</p>
          ) : (
            <div className="space-y-2">
              {progress.slice(0, 20).map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border text-sm ${
                    p.mastered
                      ? 'bg-green-50 border-green-100'
                      : 'bg-stone-50 border-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-secondary text-xs">
                      {p.word_id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.mastered
                          ? 'bg-green-100 text-green-600'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {p.mastered ? 'Mastered' : 'Learning'}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-stone-400">
                    <span>🔁 {p.repetitions}</span>
                    <span>✗ {p.lapse_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider w-12">Avatar</th>
              <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Tên</th>
              <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Tham gia</th>
              <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Streak</th>
              <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Từ đã học</th>
              <th className="px-4 py-3 text-right text-xs font-black text-stone-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                    <p>Đang tải...</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl">group_off</span>
                    <p>Chưa có người dùng nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onClick={() => handleSelectUser(user)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserSrsPanel
          user={selectedUser}
          progress={srsRecords}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}
