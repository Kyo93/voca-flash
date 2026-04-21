import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface ImportDropZoneProps {
  onFileSelected: (file: File) => void
  sheetsUrl: string
  setSheetsUrl: (url: string) => void
  urlError: string
  onSheetsUrlSubmit: () => void
}

export function ImportDropZone({
  onFileSelected,
  sheetsUrl,
  setSheetsUrl,
  urlError,
  onSheetsUrlSubmit
}: ImportDropZoneProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-orange-200 rounded-2xl p-12 text-center hover:border-primary hover:bg-orange-50/30 transition-all cursor-pointer"
        onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
        onDrop={e => {
          e.preventDefault()
          e.stopPropagation()
          const file = e.dataTransfer.files[0]
          if (file) onFileSelected(file)
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="material-symbols-outlined text-5xl text-orange-300 mb-3 block">upload_file</span>
        <p className="font-bold text-secondary text-lg">{t('admin.import.dragDrop')}</p>
        <p className="text-sm text-on-surface-variant mt-1">{t('admin.import.orClick')}</p>
        <p className="text-xs text-stone-400 mt-2">{t('admin.import.supported')}</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onFileSelected(file)
        }}
      />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-orange-100" />
        <span className="text-xs font-bold text-stone-400 uppercase">{t('admin.import.or')}</span>
        <div className="flex-1 border-t border-orange-100" />
      </div>

      {/* Google Sheets URL */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-secondary">
          {t('admin.import.pasteUrl')}
        </label>
        <input
          type="url"
          value={sheetsUrl}
          onChange={e => setSheetsUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 text-secondary font-medium outline-none focus:border-primary focus:bg-white transition-all"
        />
        {urlError && (
          <p className="text-sm text-red-500 font-medium">{urlError}</p>
        )}
        <button
          onClick={onSheetsUrlSubmit}
          disabled={!sheetsUrl.trim()}
          className="px-6 py-3 primary-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('admin.import.preview')}
        </button>
      </div>

      {/* Template download */}
      <button
        type="button"
        onClick={() => {
          const bom = '\uFEFF'
          const csv = 'word,phonetic,pos,difficulty,definition,example,example_vi,image_url,topics,wrong1,wrong2,wrong3\nhello,/həˈloʊ/,noun,2,Xin chào,Hello world!,Xin chào thế giới!,,Travel;Greetings,hola,greetings,hi\napple,/ˈæpəl/,noun,1,Quả táo,An apple a day,Ăn táo mỗi ngày,,Food,pear,orange,fruit'
          const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'vocab-import-template.csv'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }}
        className="flex items-center gap-2 text-sm font-bold text-primary hover:text-orange-600 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">download</span>
        {t('admin.import.downloadTemplate')}
      </button>
    </div>
  )
}
