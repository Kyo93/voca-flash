import { useTranslation } from 'react-i18next'
import { TAG_META } from '../../../lib/tag-constants'
import { DESIGN_TOKENS } from '../../../lib/tokens'

const FALLBACK_TAG_COLOR = DESIGN_TOKENS.COLORS.PRIMARY
const FALLBACK_NEUTRAL_COLOR = '#9CA3AF'

interface Props {
  allTags: string[]
  activeTagFilter: string | null
  onActiveTagFilterChange: (tag: string | null) => void
}

export function TagFilterChips({ allTags, activeTagFilter, onActiveTagFilterChange }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 overflow-x-auto mb-3 pb-1 custom-scrollbar">
      <button
        onClick={() => onActiveTagFilterChange(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
          activeTagFilter === null
            ? 'bg-primary text-white shadow-sm'
            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
        }`}
      >
        {t('admin.wordPool.all')}
      </button>
      {allTags.map(tag => {
        const meta = TAG_META[tag]
        const isActive = activeTagFilter === tag
        return (
          <button
            key={tag}
            onClick={() => onActiveTagFilterChange(isActive ? null : tag)}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0"
            style={{
              backgroundColor: isActive
                ? (meta?.color ?? FALLBACK_TAG_COLOR)
                : ((meta?.color ?? FALLBACK_NEUTRAL_COLOR) + '20'),
              color: isActive
                ? 'white'
                : (meta?.color ?? FALLBACK_NEUTRAL_COLOR),
            }}
          >
            {meta?.label ?? tag}
          </button>
        )
      })}
    </div>
  )
}
