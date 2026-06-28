import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAdminRoadmaps } from '../../hooks/admin/useAdminRoadmaps'
import { supabase } from '../../lib/supabase'
import RoadmapFormModal from '../../components/admin/RoadmapFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import type { Roadmap } from '../../lib/types'

import { motion } from 'framer-motion'

function StatusBadge({ active }: { active: boolean }) {
  const { t } = useTranslation()
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        active
          ? 'bg-green-50 text-green-600 border border-green-200'
          : 'bg-stone-100 text-stone-500'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-stone-400'}`}
      />
      {active ? t('admin.roadmaps.status.active') : t('admin.roadmaps.status.paused')}
    </span>
  )
}

export default function AdminRoadmapsPage() {
  const { t } = useTranslation()
  const { roadmaps, loading, error, fetch, addRoadmap, editRoadmap, removeRoadmap } =
    useAdminRoadmaps()

  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<Roadmap | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Roadmap | null>(null)
  const [deleteTopicCount, setDeleteTopicCount] = useState(0)

  useEffect(() => { fetch() }, [])

  async function handleSave(data: {
    name: string
    slug: string
    description: string | null
    image_url: string | null
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
        image_url: data.image_url,
        is_active: data.is_active,
      })
      if (err) { console.error(err); return }
    }
    setShowModal(false)
    setEditData(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await removeRoadmap(deleteTarget.id)
    setDeleteTarget(null)
  }

  async function checkAndDelete(roadmap: Roadmap) {
    // Kiểm tra có topics trong roadmap không
    const { count } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('roadmap_id', roadmap.id)

    setDeleteTopicCount(count ?? 0)
    setDeleteTarget(roadmap)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-secondary">{t('admin.roadmaps.title')}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {loading ? '...' : t('admin.roadmaps.count', { count: roadmaps.length })}
          </p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowModal(true) }}
          className="flex items-center gap-2 px-5 py-3 primary-gradient text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t('admin.roadmaps.addRoadmap')}
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
          <p className="text-stone-400">{t('admin.roadmaps.loading')}</p>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <span className="material-symbols-outlined text-5xl text-stone-300">route</span>
          <p className="text-stone-400">{t('admin.roadmaps.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((r, index) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white rounded-4xl p-4 border border-stone-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
            >
              {/* Card Background Gradient */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-stone-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Thumbnail / Image Placeholder */}
                <div className="aspect-video w-full rounded-3xl bg-stone-100 overflow-hidden mb-6 relative group-hover:scale-[1.02] transition-transform duration-500">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-stone-50 to-stone-100">
                      <span className="material-symbols-outlined text-4xl text-stone-200">route</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <StatusBadge active={r.is_active} />
                  </div>
                </div>

                {/* Content */}
                <div className="px-2 grow">
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-stone-300 uppercase tracking-widest">{r.slug}</span>
                      <span className="text-[10px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                        {t('admin.roadmaps.card.topics', { count: r.topic_count || 0 })}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-secondary group-hover:text-primary transition-colors">{r.name}</h3>
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-2 min-h-10 mb-6">
                    {r.description || t('admin.roadmaps.card.noDesc')}
                  </p>
                </div>

                {/* Footer / Actions */}
                <div className="pt-4 px-2 border-t border-stone-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-300 uppercase font-medium">{t('admin.roadmaps.card.createdAt')}</span>
                    <span className="text-xs text-stone-400 font-mono">{r.created_at ? new Date(r.created_at).toLocaleDateString(t('common.dateLocale')) : '—'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/admin/roadmaps/${r.id}/setup`}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-sm"
                      title={t('admin.roadmaps.card.setup')}
                    >
                      <span className="material-symbols-outlined text-xl">settings</span>
                    </Link>
                    <button
                      onClick={() => { setEditData(r); setShowModal(true) }}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center bg-stone-50 text-stone-400 hover:bg-white hover:text-primary hover:shadow-md transition-all duration-300 cursor-pointer"
                      title={t('common.edit')}
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      onClick={() => checkAndDelete(r)}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 hover:shadow-md transition-all duration-300 cursor-pointer"
                      title={t('common.delete')}
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
        title={deleteTopicCount > 0 ? t('admin.roadmaps.delete.cannotDelete') : t('admin.roadmaps.delete.title')}
        message={
          deleteTopicCount > 0
            ? t('admin.roadmaps.delete.hasTopics', { name: deleteTarget?.name, count: deleteTopicCount })
            : t('admin.roadmaps.delete.confirm', { name: deleteTarget?.name })
        }
        confirmLabel={deleteTopicCount > 0 ? t('admin.roadmaps.delete.understood') : t('common.delete')}
        danger={deleteTopicCount === 0}
        onConfirm={deleteTopicCount === 0 ? handleDelete : () => setDeleteTarget(null)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
