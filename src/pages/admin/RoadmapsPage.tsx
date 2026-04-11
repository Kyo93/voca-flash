import { useEffect, useState } from 'react'
import { useAdminRoadmaps } from '../../hooks/admin/useAdminRoadmaps'
import RoadmapFormModal from '../../components/admin/RoadmapFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Roadmap } from '../../lib/types'

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
        active
          ? 'bg-green-50 text-green-600 border border-green-200'
          : 'bg-stone-100 text-stone-500'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-stone-400'}`}
      />
      {active ? 'Hoạt động' : 'Tạm dừng'}
    </span>
  )
}

export default function AdminRoadmapsPage() {
  const { roadmaps, loading, error, fetch, addRoadmap, editRoadmap, removeRoadmap } =
    useAdminRoadmaps()

  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<Roadmap | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Roadmap | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetch() }, [])

  async function handleSave(data: {
    name: string
    slug: string
    description: string | null
    is_active: boolean
  }) {
    if (editData) {
      const { error: err } = await editRoadmap(editData.id, data)
      if (err) { console.error(err); return }
    } else {
      const { error: err } = await addRoadmap({
        name: data.name,
        slug: data.slug,
        description: data.description,
        is_active: data.is_active,
      })
      if (err) { console.error(err); return }
    }
    setShowModal(false)
    setEditData(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await removeRoadmap(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-secondary">Lộ trình</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {loading ? '...' : `${roadmaps.length} lộ trình học tập`}
          </p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowModal(true) }}
          className="flex items-center gap-2 px-5 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm lộ trình
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && roadmaps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <span className="material-symbols-outlined text-5xl text-stone-300 animate-spin">progress_activity</span>
          <p className="text-stone-400">Đang tải...</p>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <span className="material-symbols-outlined text-5xl text-stone-300">route</span>
          <p className="text-stone-400">Chưa có lộ trình nào.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Tên</th>
                <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-4 py-3 text-left text-xs font-black text-stone-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-black text-stone-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {roadmaps.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-stone-50 last:border-0 hover:bg-orange-50/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <p className="font-black text-secondary">{r.name}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded-lg">
                      {r.slug}
                    </span>
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    <p className="text-sm text-on-surface-variant truncate">
                      {r.description ?? <span className="text-stone-300">—</span>}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge active={r.is_active} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditData(r); setShowModal(true) }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-orange-100 transition-colors cursor-pointer"
                        title="Sửa"
                      >
                        <span className="material-symbols-outlined text-stone-400 text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RoadmapFormModal
        open={showModal}
        roadmap={editData}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditData(null) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa lộ trình?"
        message={`Xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
