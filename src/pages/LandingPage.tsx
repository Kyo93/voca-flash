import { useTranslation } from 'react-i18next'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <>
    <div data-mobile-landing className="min-h-dvh overflow-x-hidden bg-surface text-secondary md:hidden">
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/85 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-xl">
        <nav className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">V</span>
            <span className="truncate text-xl font-bold text-primary">VocaFlash</span>
          </div>
          <a
            href="/login"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-primary/30 px-5 text-sm font-bold text-primary"
          >
            {t('landing.login')}
          </a>
        </nav>
      </header>

      <main className="space-y-5 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-5">
        <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white/80 p-5 shadow-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-[0.7rem] font-bold uppercase text-primary">
            <span className="size-2 rounded-full bg-primary" />
            {t('landing.modernTechnique')}
          </span>
          <h1 className="mt-5 text-[2.25rem] font-bold leading-[1.08] text-secondary">
            {t('landing.heroTitle')}{' '}
            <span className="text-primary italic">{t('landing.heroTitleAccent')}</span>{' '}
            {t('landing.withSrs')}
          </h1>
          <p className="mt-4 text-base leading-7 text-on-surface-variant">
            {t('landing.heroSubtitle')}
          </p>

          <div data-mobile-hero-actions className="mt-5 flex flex-col gap-3">
            <a
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-white shadow-md"
            >
              {t('landing.startTrial')}
              <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
            </a>
            <a
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-secondary/10 bg-white px-4 text-sm font-bold text-secondary"
            >
              {t('landing.register')}
            </a>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
          <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
            <img
              alt={t('landing.heroImageAlt')}
              className="size-full object-cover"
              loading="eager"
              src="/images/hero-3d.png"
            />
            <div className="absolute left-4 top-4 max-w-[70%] rounded-2xl bg-white/90 p-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-white">
                  <span className="material-symbols-outlined text-base" aria-hidden="true">check</span>
                </span>
                <span>{t('landing.floatingCard.mastered')}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <div className="rounded-2xl bg-orange-50 p-4">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">update</span>
              <h2 className="mt-3 text-base font-bold text-secondary">{t('landing.feature1Title')}</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{t('landing.feature1Desc')}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">library_books</span>
              <h2 className="mt-3 text-base font-bold text-secondary">{t('landing.feature2Title')}</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{t('landing.feature2Desc')}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-secondary p-5 text-white shadow-sm">
          <h2 className="text-xl font-bold">{t('landing.ready')}</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">{t('landing.ctaText')}</p>
          <div className="mt-5 flex flex-col gap-3">
            <a
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-4 text-sm font-bold text-primary"
            >
              {t('landing.studyNow')}
            </a>
            <a
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/30 px-4 text-sm font-bold text-white"
            >
              {t('landing.login')}
            </a>
          </div>
        </section>
      </main>
    </div>

    <div data-desktop-landing className="relative hidden min-h-screen flex-col overflow-hidden bg-surface md:flex">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-orange-200/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-blob [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="w-full flex-none bg-white/60 backdrop-blur-xl border-b border-orange-100 z-50 relative">
        <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-[1440px] mx-auto">
          <div className="text-3xl font-black tracking-tighter text-primary flex items-center gap-2">
            <span className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl rotate-3">V</span>
            VocaFlash
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-primary font-bold relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-primary after:rounded-full" href="#">{t('landing.articles')}</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors" href="#">{t('landing.quizzes')}</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors" href="#">{t('nav.library')}</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors" href="#">{t('landing.community')}</a>
          </div>
          <div className="flex items-center gap-6">
            <a href="/login" className="px-8 py-2.5 rounded-full font-bold text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300">{t('landing.register')}</a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="grow flex flex-col overflow-hidden z-10 relative">
        <div className="grow flex items-stretch overflow-hidden max-w-[1440px] mx-auto w-full">
          {/* Left Column */}
          <section className="w-[45%] flex flex-col p-12 md:p-16 overflow-y-auto">
            <div className="mb-auto">
              <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-xs font-bold tracking-widest uppercase bg-orange-100 text-primary rounded-full shadow-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {t('landing.modernTechnique')}
              </span>
              <h1 className="text-5xl lg:text-6xl font-headline font-black leading-[1.1] tracking-tight text-secondary mb-8">
                {t('landing.heroTitle')}{' '}
                <span className="text-primary italic">{t('landing.heroTitleAccent')}</span>{' '}
                {t('landing.withSrs')}
              </h1>
              <p className="text-xl text-on-surface-variant leading-relaxed mb-10 max-w-lg">
                {t('landing.heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-5 mb-16">
                <a href="/dashboard" className="group px-10 py-4 hero-gradient text-white font-bold rounded-2xl shadow-[0_10px_30px_rgba(211,84,0,0.3)] hover:shadow-[0_15px_40px_rgba(211,84,0,0.5)] hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3">
                  {t('landing.startTrial')}
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
                <a href="/login" className="px-10 py-4 bg-white text-secondary font-bold rounded-2xl border-2 border-secondary/10 hover:border-primary/30 hover:bg-orange-50 active:scale-95 transition-all">
                  {t('landing.login')}
                </a>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-6 mt-auto">
              <div className="group bg-white p-6 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-orange-50 hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>update</span>
                </div>
                <h3 className="text-lg font-black text-secondary mb-2">{t('landing.feature1Title')}</h3>
                <p className="text-sm text-on-surface-variant leading-snug">{t('landing.feature1Desc')}</p>
              </div>
              <div className="group bg-white p-6 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-orange-50 hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:-rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-blue-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>library_books</span>
                </div>
                <h3 className="text-lg font-black text-secondary mb-2">{t('landing.feature2Title')}</h3>
                <p className="text-sm text-on-surface-variant leading-snug">{t('landing.feature2Desc')}</p>
              </div>
            </div>
          </section>

          {/* Right Column */}
          <section className="w-[55%] flex flex-col p-12 md:p-16 overflow-y-auto relative">
            <div className="grid grid-rows-[auto_1fr_auto] gap-12 h-full relative z-10">
              {/* Visual Showcase */}
              <div className="relative">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="relative rounded-4xl overflow-hidden shadow-2xl border-8 border-white group">
                  <img
                    alt={t('landing.heroImageAlt')}
                    loading="lazy"
                    className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-1000"
                    src="/images/hero-3d.png"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                  <div className="absolute top-10 left-10 animate-float">
                    <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                      <div className="text-xs">
                        <div className="font-bold">{t('landing.floatingCard.mastered')}</div>
                        <div className="opacity-70">"{t('landing.floatingCard.word')}"</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Props */}
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <span className="h-1.5 w-16 bg-primary rounded-full" />
                  <h2 className="text-3xl font-black text-secondary">{t('landing.solutionTitle')}</h2>
                </div>
                <div className="space-y-6">
                  <div className="group flex items-start gap-6 p-6 bg-white/60 rounded-2xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-transparent hover:border-orange-100">
                    <span className="text-5xl font-black text-orange-200 group-hover:text-primary/20 transition-colors leading-none">01</span>
                    <div>
                      <h4 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">{t('landing.forAllAges')}</h4>
                      <p className="text-on-surface-variant">{t('landing.forAllAgesDesc')}</p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-6 p-6 bg-white/60 rounded-2xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-transparent hover:border-orange-100">
                    <span className="text-5xl font-black text-orange-200 group-hover:text-primary/20 transition-colors leading-none">02</span>
                    <div>
                      <h4 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">{t('landing.parentMode')}</h4>
                      <p className="text-on-surface-variant">{t('landing.parentModeDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-auto relative group">
                <div className="absolute inset-0 hero-gradient rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative hero-gradient rounded-4xl p-8 md:p-10 overflow-hidden flex flex-col lg:flex-row items-center justify-between shadow-2xl gap-8">
                  <div className="relative z-10 lg:max-w-[60%] text-center lg:text-left">
                    <h2 className="text-3xl font-black text-white mb-3">{t('landing.ready')}</h2>
                    <p className="text-white/90 text-lg">{t('landing.ctaText')}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10 shrink-0">
                    <a href="/dashboard" className="px-8 py-3 bg-white text-primary text-base font-black rounded-xl hover:scale-105 hover:bg-orange-50 transition-all shadow-lg">
                      {t('landing.studyNow')}
                    </a>
                    <button className="px-8 py-3 border-2 border-white/40 text-white text-base font-bold rounded-xl hover:bg-white/10 transition-all">
                      {t('landing.pricing')}
                    </button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 pointer-events-none">
                    <span className="material-symbols-outlined text-[15rem]" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex-none bg-white border-t border-orange-50 relative z-20">
        <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-8 max-w-[1440px] mx-auto gap-6 md:gap-0">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10 text-center md:text-left">
            <span className="font-black text-primary text-xl">VocaFlash</span>
            <span className="text-sm text-on-surface-variant/70">{t('landing.footer.copyright')}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-bold text-secondary">
            <a className="hover:text-primary transition-colors" href="#">{t('landing.articles')}</a>
            <a className="hover:text-primary transition-colors" href="#">{t('nav.library')}</a>
            <a className="hover:text-primary transition-colors" href="#">{t('landing.aboutUs')}</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
