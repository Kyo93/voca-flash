import { useTranslation } from 'react-i18next'

const WRONG_CHOICE_CLASS =
  'px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50 text-secondary font-medium outline-none focus:border-orange-300 focus:bg-white transition-all'

interface Props {
  wrong1: string
  setWrong1: (v: string) => void
  wrong2: string
  setWrong2: (v: string) => void
  wrong3: string
  setWrong3: (v: string) => void
}

export function WrongChoicesInput({ wrong1, setWrong1, wrong2, setWrong2, wrong3, setWrong3 }: Props) {
  const { t } = useTranslation()

  const fields = [
    [wrong1, setWrong1, 'admin.wordForm.wrong1Placeholder'],
    [wrong2, setWrong2, 'admin.wordForm.wrong2Placeholder'],
    [wrong3, setWrong3, 'admin.wordForm.wrong3Placeholder'],
  ] as const

  return (
    <div>
      <label className="block text-sm font-bold text-secondary mb-2">
        {t('admin.wordForm.wrongChoices')}
      </label>
      <div className="grid grid-cols-3 gap-3">
        {fields.map(([value, setValue, placeholderKey], idx) => (
          <input
            key={placeholderKey}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t(placeholderKey)}
            className={WRONG_CHOICE_CLASS}
            data-testid={`wrong-choice-${idx + 1}`}
          />
        ))}
      </div>
      <p className="text-xs text-stone-400 mt-1">{t('admin.wordForm.wrongChoicesDesc')}</p>
    </div>
  )
}
