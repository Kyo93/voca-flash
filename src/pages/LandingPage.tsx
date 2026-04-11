import { useTranslation } from 'react-i18next'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-surface">
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
            VocabMaster
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-primary font-bold relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-primary after:rounded-full" href="#">{t('nav.dashboard')}</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors" href="#">{t('nav.library')}</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors" href="#">Cộng đồng</a>
          </div>
          <div className="flex items-center gap-6">
            <button className="px-8 py-2.5 rounded-full font-bold text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300">{t('landing.register')}</button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden z-10 relative">
        <div className="flex-grow flex items-stretch overflow-hidden max-w-[1440px] mx-auto w-full">
          {/* Left Column */}
          <section className="w-[45%] flex flex-col p-12 md:p-16 overflow-y-auto">
            <div className="mb-auto">
              <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-xs font-bold tracking-widest uppercase bg-orange-100 text-primary rounded-full shadow-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Kỹ thuật học hiện đại
              </span>
              <h1 className="text-5xl lg:text-6xl font-headline font-black leading-[1.1] tracking-tight text-secondary mb-8">
                {t('landing.heroTitle')}{' '}
                <span className="text-primary italic">{t('landing.heroTitleAccent')}</span>{' '}
                với Spaced Repetition
              </h1>
              <p className="text-xl text-on-surface-variant leading-relaxed mb-10 max-w-lg">
                {t('landing.heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-5 mb-16">
                <a href="/dashboard" className="group px-10 py-4 hero-gradient text-white font-bold rounded-2xl shadow-[0_10px_30px_rgba(211,84,0,0.3)] hover:shadow-[0_15px_40px_rgba(211,84,0,0.5)] hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3">
                  {t('landing.startTrial')}
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
                <button className="px-10 py-4 bg-white text-secondary font-bold rounded-2xl border-2 border-secondary/10 hover:border-primary/30 hover:bg-orange-50 active:scale-95 transition-all">
                  {t('landing.login')}
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-6 mt-auto">
              <div className="group bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-orange-50 hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">update</span>
                </div>
                <h3 className="text-lg font-black text-secondary mb-2">{t('landing.feature1Title')}</h3>
                <p className="text-sm text-on-surface-variant leading-snug">{t('landing.feature1Desc')}</p>
              </div>
              <div className="group bg-white p-6 rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-orange-50 hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:-rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-blue-600 text-3xl">library_books</span>
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
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
                  <img
                    alt="3D Language Learning"
                    className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-1000"
                    src="https://images.unsplash.com/photo-1546410531-bb4caa6b724d?w=800&q=80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-10 left-10 animate-float">
                    <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <span className="material-symbols-outlined-filled text-sm">check_circle</span>
                      </div>
                      <div className="text-xs">
                        <div className="font-bold">Mastered!</div>
                        <div className="opacity-70">"Perspective"</div>
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
                  <div className="group flex items-start gap-6 p-6 bg-white/60 rounded-3xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-transparent hover:border-orange-100">
                    <span className="text-5xl font-black text-orange-200 group-hover:text-primary/20 transition-colors leading-none">01</span>
                    <div>
                      <h4 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">{t('landing.forAllAges')}</h4>
                      <p className="text-on-surface-variant">{t('landing.forAllAgesDesc')}</p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-6 p-6 bg-white/60 rounded-3xl hover:bg-white transition-all shadow-sm hover:shadow-md border border-transparent hover:border-orange-100">
                    <span className="text-5xl font-black text-orange-200 group-hover:text-primary/20 transition-colors leading-none">02</span>
                    <div>
                      <h4 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">Chế độ phụ huynh</h4>
                      <p className="text-on-surface-variant">Hệ thống báo cáo trực quan giúp theo dõi tiến độ học tập của con dễ dàng.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-auto relative group">
                <div className="absolute inset-0 hero-gradient rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative hero-gradient rounded-[2.5rem] p-8 md:p-10 overflow-hidden flex flex-col lg:flex-row items-center justify-between shadow-2xl gap-8">
                  <div className="relative z-10 lg:max-w-[60%] text-center lg:text-left">
                    <h2 className="text-3xl font-black text-white mb-3">{t('landing.ready')}</h2>
                    <p className="text-white/90 text-lg">{t('landing.ctaText')}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10 shrink-0">
                    <a href="/dashboard" className="px-8 py-3 bg-white text-primary text-base font-black rounded-xl hover:scale-105 hover:bg-orange-50 transition-all shadow-lg">
                      Học ngay
                    </a>
                    <button className="px-8 py-3 border-2 border-white/40 text-white text-base font-bold rounded-xl hover:bg-white/10 transition-all">
                      Bảng giá
                    </button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 pointer-events-none">
                    <span className="material-symbols-outlined text-[15rem]">language</span>
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
            <span className="font-black text-primary text-xl">VocabMaster</span>
            <span className="text-sm text-on-surface-variant/70">© 2024 VocabMaster. The Tactile Scholar's Choice.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-bold text-secondary">
            <a className="hover:text-primary transition-colors" href="#">Bài học</a>
            <a className="hover:text-primary transition-colors" href="#">Thư viện</a>
            <a className="hover:text-primary transition-colors" href="#">Về chúng tôi</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
