import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const MethodologyPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-high p-8 md:p-16 group">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-medium text-editorial-asymmetry leading-tight mb-6">
            {t('methodology.heroTitle')}
          </h1>
          <p className="text-xl text-on-surface-variant opacity-80 leading-relaxed">
            {t('methodology.heroSubtitle')}
          </p>
        </div>

        {/* Floating Decor - Massive Brain Icon (Balanced Size) */}
        <div className="absolute top-0 bottom-0 right-0 w-2/3 hidden lg:block pointer-events-none overflow-hidden select-none">
          <div className="relative h-full w-full flex items-center justify-end">
            <span
              className="material-symbols-outlined text-primary opacity-[0.06]"
              style={{
                fontSize: 'min(480px, 60vh)',
                lineHeight: '1',
                display: 'block',
                marginRight: '5%'
              }}
            >
              neurology
            </span>
            {/* Glow effect */}
            <div className="absolute right-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full" />
          </div>
        </div>
      </section>

      {/* Forgetting Curve Section */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium mb-4">{t('methodology.curveTitle')}</h2>
          <p className="text-on-surface-variant italic">{t('methodology.curveDesc')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Traditional Curve */}
          <div className="glass-panel p-8 rounded-2xl bg-surface-container-low/50 space-y-6">
            <h3 className="label-md text-slate-400">{t('methodology.traditional')}</h3>
            <div className="h-48 flex items-end gap-2 px-4 border-b border-outline/20 bg-surface/50 rounded-lg">
              <div className="flex-1 bg-on-surface/10 h-full rounded-t-sm" title={t('methodology.day', { count: 0 }) + ': 100%'} />
              <div className="flex-1 bg-on-surface/10 h-[50%] rounded-t-sm" title={t('methodology.day', { count: 1 }) + ': 50%'} />
              <div className="flex-1 bg-on-surface/10 h-[20%] rounded-t-sm" title={t('methodology.day', { count: 2 }) + ': 20%'} />
              <div className="flex-1 bg-on-surface/10 h-[10%] rounded-t-sm" title={t('methodology.day', { count: 3 }) + ': 10%'} />
              <div className="flex-1 bg-on-surface/10 h-[5%] rounded-t-sm" title={t('methodology.dayPlus', { count: 4 }) + ': 5%'} />
            </div>
            <p className="text-sm italic text-on-surface-variant">{t('methodology.traditionalDesc')}</p>
          </div>

          {/* VocaFlash Curve */}
          <div className="glass-panel p-8 rounded-2xl border-primary/20 space-y-6 relative overflow-hidden bg-primary/5">
            <h3 className="label-md text-primary">{t('methodology.vocaFlash')}</h3>
            <div className="h-48 flex items-end gap-2 px-4 border-b border-primary/20 bg-surface/50 rounded-lg">
              <div className="flex-1 bg-primary/40 h-full rounded-t-sm relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(211,84,0,0.5)]" />
              </div>
              <div className="flex-1 bg-primary/30 h-[90%] rounded-t-sm relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full" />
              </div>
              <div className="flex-1 bg-primary/50 h-full rounded-t-sm relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full" />
              </div>
              <div className="flex-1 bg-primary/40 h-[95%] rounded-t-sm relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full" />
              </div>
              <div className="flex-1 bg-primary/60 h-full rounded-t-sm relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full" />
              </div>
            </div>
            <p className="text-sm font-medium text-primary">{t('methodology.recallCaption')}</p>
          </div>
        </div>
      </section>

      {/* FSRS Mechanism */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium mb-4">{t('methodology.fsrsTitle')}</h2>
          <p className="text-on-surface-variant mb-6">{t('methodology.fsrsSubtitle')}</p>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        {/* Core Logic Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-surface-container border border-outline/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <h3 className="font-medium text-xl">{t('methodology.stability')}</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              {t('methodology.stabilityDesc')}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-surface-container border border-outline/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">psychology_alt</span>
            </div>
            <h3 className="font-medium text-xl">{t('methodology.difficulty')}</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              {t('methodology.difficultyDesc')}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-surface-container border border-outline/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">reorder</span>
            </div>
            <h3 className="font-medium text-xl">{t('methodology.retrievability')}</h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              {t('methodology.retrievabilityDesc')}
            </p>
          </div>
        </div>

        {/* Rating Impact Sub-section */}
        <div className="space-y-6">
          <h3 className="text-xl font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">touch_app</span>
            {t('methodology.repetitions')}
          </h3>
          <p className="text-on-surface-variant italic mb-8">{t('methodology.repetitionsDesc')}</p>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
              <h4 className="font-medium text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">sentiment_very_dissatisfied</span>
                {t('methodology.ratingAgain')}
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">{t('methodology.ratingAgainDesc')}</p>
            </div>
            <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
              <h4 className="font-medium text-amber-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">sentiment_neutral</span>
                {t('methodology.ratingHard')}
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">{t('methodology.ratingHardDesc')}</p>
            </div>
            <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
              <h4 className="font-medium text-blue-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">sentiment_satisfied</span>
                {t('methodology.ratingGood')}
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">{t('methodology.ratingGoodDesc')}</p>
            </div>
            <div className="p-6 rounded-xl border border-green-500/20 bg-green-500/5 space-y-3">
              <h4 className="font-medium text-green-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">sentiment_very_satisfied</span>
                {t('methodology.ratingEasy')}
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">{t('methodology.ratingEasyDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogical Pillars */}
      <section className="p-12 rounded-2xl bg-surface-container-low border border-outline/5 relative overflow-hidden">
        <h2 className="text-3xl font-medium mb-12">{t('methodology.title')}</h2>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">psychology</span>
              {t('methodology.activeRecall')}
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              {t('methodology.activeRecallDesc')}
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">layers</span>
              {t('methodology.multisensory')}
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              {t('methodology.multisensoryDesc')}
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">account_tree</span>
              {t('methodology.contextual')}
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              {t('methodology.contextualDesc')}
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">timer</span>
              {t('methodology.microlearning')}
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              {t('methodology.microlearningDesc')}
            </p>
          </div>
        </div>

        {/* Intensity Callout */}
        <div className="mt-16 p-6 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-4">
          <span className="material-symbols-outlined text-primary mt-1">info</span>
          <div>
            <h4 className="font-medium text-primary mb-1">{t('methodology.intensityTitle')}</h4>
            <p className="text-sm text-on-surface-variant">{t('methodology.intensityDesc')}</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium mb-4">{t('methodology.faqTitle')}</h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {/* Q1 */}
          <div className="p-8 rounded-3xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">Q</span>
              {t('methodology.faqQ1')}
            </h3>
            <div className="text-on-surface-variant leading-relaxed pl-11 space-y-2">
              {t('methodology.faqA1').split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          {/* Q2 */}
          <div className="p-8 rounded-3xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">Q</span>
              {t('methodology.faqQ2')}
            </h3>
            <div className="text-on-surface-variant leading-relaxed pl-11 space-y-2">
              {t('methodology.faqA2').split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          {/* Q3 */}
          <div className="p-8 rounded-3xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all">
            <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">Q</span>
              {t('methodology.faqQ3')}
            </h3>
            <div className="text-on-surface-variant leading-relaxed pl-11 space-y-2">
              {t('methodology.faqA3').split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-12">
        <h2 className="text-2xl font-medium mb-6">{t('methodology.readyToConquer')}</h2>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-12 py-4 rounded-full bg-primary text-white font-medium text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          {t('methodology.learnNow')}
          <span className="material-symbols-outlined ml-2">trending_flat</span>
        </Link>
      </section>
    </div>
  )
}

export default MethodologyPage
