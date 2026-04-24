import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Topic } from '../../../lib/types'

interface Props {
  selectedCount: number
  topics: Topic[]
  activeTopicId: string | null
  onBulkAssign: (topicId: string) => void
  onBulkUnassign: () => void
}

export function BulkAssignBar({ selectedCount, topics, activeTopicId, onBulkAssign, onBulkUnassign }: Props) {
  const { t } = useTranslation()
  const [bulkTopicId, setBulkTopicId] = useState('')

  return (
    <div className="flex items-center gap-2 mb-3 p-2 bg-orange-50 rounded-xl border border-orange-100">
      <span className="text-xs font-bold text-primary shrink-0">
        {t('admin.wordPool.selectedCount', { count: selectedCount })}
      </span>
      <select
        value={bulkTopicId}
        onChange={(e) => setBulkTopicId(e.target.value)}
        className="flex-1 px-2 py-1 rounded-lg border border-stone-200 bg-white text-xs outline-none cursor-pointer"
      >
        <option value="">{t('admin.wordPool.assignToTopic')}</option>
        {topics.map(topic => (
          <option key={topic.id} value={topic.id}>{topic.name}</option>
        ))}
      </select>
      {bulkTopicId && (
        <button
          onClick={() => { onBulkAssign(bulkTopicId); setBulkTopicId('') }}
          className="px-2 py-1 rounded-lg bg-primary text-white text-xs font-bold shrink-0"
        >
          {t('admin.wordPool.assign')}
        </button>
      )}
      {activeTopicId && (
        <button
          onClick={onBulkUnassign}
          className="px-2 py-1 rounded-lg bg-primary text-white text-xs font-bold shrink-0"
        >
          {t('admin.wordPool.unassign')}
        </button>
      )}
    </div>
  )
}
