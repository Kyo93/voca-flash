import { useTranslation } from 'react-i18next'
import { Topic } from '../../../lib/types'

interface WordsToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  topicFilter: string;
  setTopicFilter: (val: string) => void;
  sort: 'newest' | 'az' | 'difficulty';
  setSort: (val: 'newest' | 'az' | 'difficulty') => void;
  topics: Topic[];
}

export default function WordsToolbar({
  search, setSearch,
  topicFilter, setTopicFilter,
  sort, setSort,
  topics
}: WordsToolbarProps) {
  const { t } = useTranslation()
  return (
    <div className="admin-toolbar sticky top-24 z-30 transition-all duration-300">
      <div className="flex-1 relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-300 group-focus-within:text-primary transition-colors">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.words.searchPlaceholder')}
          className="w-full pl-12 pr-4 py-3 bg-stone-50/50 border-none rounded-2xl text-sm font-medium placeholder:text-stone-300 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-8 w-px bg-stone-100 mx-2" />

        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="appearance-none bg-stone-50 border border-stone-200 text-stone-600 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer min-w-[140px]"
        >
          <option value="">{t('admin.words.allTopics')}</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>{topic.name}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'newest' | 'az' | 'difficulty')}
          className="appearance-none bg-stone-50 border border-stone-200 text-stone-600 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer min-w-[130px]"
        >
          <option value="newest">{t('admin.words.newest')}</option>
          <option value="az">{t('admin.words.az')}</option>
          <option value="difficulty">{t('admin.words.difficulty')}</option>
        </select>
      </div>
    </div>
  )
}
