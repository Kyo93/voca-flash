import { useTranslation } from 'react-i18next'
import { COLOR_PALETTE } from '../../lib/topic-suggestions'

interface TopicIconPickerProps {
  color: string
  setColor: (color: string) => void
  icon: string
  setIcon: (icon: string) => void
  iconPickerOpen: boolean
  setIconPickerOpen: (open: boolean) => void
  iconSearch: string
  setIconSearch: (search: string) => void
  filteredIcons: string[]
}

export function TopicIconPicker({
  color,
  setColor,
  icon,
  setIcon,
  iconPickerOpen,
  setIconPickerOpen,
  iconSearch,
  setIconSearch,
  filteredIcons
}: TopicIconPickerProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Icon Representation */}
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
          {t('admin.topicForm.iconLabel')}
        </label>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm"
            style={{ border: `2px solid ${color}50` }}
          >
            <span className="material-symbols-outlined text-xl" style={{ color }}>
              {icon}
            </span>
          </div>

          {iconPickerOpen ? (
            <div className="flex-1 border border-stone-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="p-2 border-b border-stone-100">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xs text-stone-400">search</span>
                  <input
                    type="text"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder={t('admin.topicForm.iconSearchPlaceholder')}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-stone-100 bg-stone-50 outline-none focus:border-orange-300"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-2 max-h-36 overflow-y-auto">
                {filteredIcons.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-3">{t('admin.topicForm.iconNotFound')}</p>
                ) : (
                  <div className="grid grid-cols-8 gap-1">
                    {filteredIcons.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => { setIcon(iconName); setIconPickerOpen(false); setIconSearch('') }}
                        title={iconName}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer hover:bg-stone-50"
                        style={icon === iconName ? { backgroundColor: color + '20', color } : { color: 'var(--color-on-surface-variant)' }}
                      >
                        <span className="material-symbols-outlined text-base">{iconName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIconPickerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-500 text-sm font-medium hover:bg-stone-50 hover:border-stone-300 transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-base text-stone-400">grid_view</span>
              {t('admin.topicForm.changeIcon')}
            </button>
          )}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
          {t('admin.topicForm.colorLabel')}
        </label>
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{t('admin.topicForm.colorPalette')}</span>
            <span className="text-xs font-mono font-medium" style={{ color }}>{color}</span>
          </div>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {COLOR_PALETTE.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                title={c}
                className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer mx-auto flex items-center justify-center"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? 'white' : 'transparent',
                  outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                  boxShadow: color === c ? `0 0 0 1px ${c}80` : 'none',
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_PALETTE.slice(5, 10).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                title={c}
                className="w-8 h-8 rounded-full border-2 border-transparent transition-all cursor-pointer mx-auto flex items-center justify-center hover:scale-110"
                style={{ backgroundColor: c }}
              />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-300 mx-auto flex items-center justify-center bg-stone-100 cursor-pointer">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch-wrapper]:rounded-full"
                title={t('admin.topicForm.customColor')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
