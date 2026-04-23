import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAdminStats, getRecentWords } from '../../lib/queries/stats-queries'
import type { Word } from '../../lib/types'
import { topicColorStyle } from '../../lib/utils'

interface Stats {
  totalWords: number
  totalTopics: number
  totalUsers: number
  avgMastered: number
}

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({ totalWords: 0, totalTopics: 0, totalUsers: 0, avgMastered: 0 })
  const [recentWords, setRecentWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminStats(), getRecentWords(5)]).then(([statsRes, wordsRes]) => {
      setStats(statsRes)
      setRecentWords((wordsRes.data as Word[]) ?? [])
      setLoading(false)
    })
  }, [])

  const statCards = [
    {
      label: t('admin.dashboard.stats.words'),
      value: stats.totalWords,
      icon: 'spellcheck',
      color: 'from-orange-400 to-orange-600',
      bg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      label: t('admin.dashboard.stats.topics'),
      value: stats.totalTopics,
      icon: 'folder',
      color: 'from-green-400 to-green-600',
      bg: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      label: t('admin.dashboard.stats.users'),
      value: stats.totalUsers,
      icon: 'group',
      color: 'from-blue-400 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: t('admin.dashboard.stats.mastered'),
      value: `${stats.avgMastered}%`,
      icon: 'school',
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-secondary">{t('admin.dashboard.title')}</h1>
        <p className="text-sm text-on-surface-variant mt-1">{t('admin.dashboard.subtitle')}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${card.iconColor}`}>{card.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-black text-secondary mb-1">
              {loading ? (
                <span className="inline-block w-12 h-7 bg-stone-100 rounded animate-pulse" />
              ) : (
                card.value
              )}
            </p>
            <p className="text-sm text-stone-500 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent words */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">history</span>
          <h2 className="font-black text-secondary">{t('admin.dashboard.recent.title')}</h2>
        </div>
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <span className="material-symbols-outlined text-4xl text-stone-300 animate-spin">progress_activity</span>
            <p className="text-stone-400">{t('admin.dashboard.recent.loading')}</p>
          </div>
        ) : recentWords.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <span className="material-symbols-outlined text-4xl text-stone-300">inventory_2</span>
            <p className="text-stone-400">{t('admin.dashboard.recent.empty')}</p>
            <a href="/admin/words" className="mt-2 px-4 py-2 primary-gradient text-white text-sm font-bold rounded-xl">
              {t('admin.dashboard.recent.manage')}
            </a>
          </div>
        ) : (
          <table className="w-full">
            <tbody>
              {recentWords.map((w, i) => (
                <tr
                  key={w.id}
                  className={`border-b border-stone-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'} hover:bg-orange-50/30 transition-colors`}
                >
                  <td className="px-6 py-3">
                    <p className="font-black text-secondary">{w.word}</p>
                    {w.phonetic && <p className="text-xs text-stone-400">{w.phonetic}</p>}
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-sm text-on-surface-variant truncate max-w-xs">{w.definition}</p>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {w.topics && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={topicColorStyle(w.topics.color)}
                      >
                        {w.topics.name}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
