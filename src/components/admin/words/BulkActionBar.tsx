import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Topic } from '../../../lib/types'

interface BulkActionBarProps {
  selectedIds: Set<string>;
  setSelectedIds: (val: Set<string>) => void;
  // Delete
  bulkDeleteConfirm: boolean;
  setBulkDeleteConfirm: (val: boolean) => void;
  handleBulkDelete: () => void;
  // Assign
  showAssignModal: boolean;
  setShowAssignModal: (val: boolean) => void;
  assignTopicId: string;
  setAssignTopicId: (val: string) => void;
  handleBulkAssign: () => void;
  topics: Topic[];
  bulkLoading: boolean;
}

export default function BulkActionBar({
  selectedIds, setSelectedIds,
  bulkDeleteConfirm, setBulkDeleteConfirm, handleBulkDelete,
  showAssignModal, setShowAssignModal, assignTopicId, setAssignTopicId, handleBulkAssign, topics, bulkLoading
}: BulkActionBarProps) {
  const { t } = useTranslation()
  
  if (selectedIds.size === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-secondary text-white px-6 py-4 rounded-2xl shadow-2xl border border-stone-700/50 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 pr-4 border-r border-stone-700">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            {selectedIds.size}
          </div>
          <span className="font-medium text-sm">{t('admin.bulkAction.selected')}</span>
        </div>

        <div className="flex items-center gap-2">
          {bulkDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-400 mr-2">{t('admin.bulkAction.confirmDelete')}</span>
              <button 
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {bulkLoading ? t('admin.bulkAction.deleting') : t('admin.bulkAction.deleteNow')}
              </button>
              <button 
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-stone-700 text-white text-sm font-bold rounded-xl hover:bg-stone-600 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : showAssignModal ? (
            <div className="flex items-center gap-2">
              <select
                value={assignTopicId}
                onChange={(e) => setAssignTopicId(e.target.value)}
                className="px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-sm outline-none focus:border-primary text-white"
              >
                <option value="">{t('admin.bulkAction.chooseTopic')}</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button 
                onClick={handleBulkAssign}
                disabled={bulkLoading || !assignTopicId}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {bulkLoading ? t('admin.bulkAction.saving') : t('common.save')}
              </button>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-stone-700 text-white text-sm font-bold rounded-xl hover:bg-stone-600 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 text-sm font-bold rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-sm">folder</span>
                {t('admin.bulkAction.changeTopic')}
              </button>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-sm font-bold rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                {t('admin.bulkAction.delete')}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setSelectedIds(new Set())}
          className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
