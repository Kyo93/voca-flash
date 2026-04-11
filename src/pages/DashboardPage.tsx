import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getStreakDisplay } from '../lib/streak'
import { getCardStats } from '../lib/storage'
import { loadCards, loadProgress } from '../lib/storage'

export default function DashboardPage() {
  const { t } = useTranslation()
  const streak = getStreakDisplay()
  const cards = loadCards()
  const progressMap = loadProgress()
  const stats = getCardStats(cards, progressMap)
  const totalMastered = [...progressMap.values()].filter(p => p.repetitions >= 5).length

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-20 flex items-center justify-between px-10 bg-surface/80 backdrop-blur-md sticky top-0 z-40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-xl font-black text-on-surface">{t('nav.dashboard')}</h2>
          <div className="flex items-center gap-8">
            <div className="relative w-80">
              <input
                className="w-full pl-12 pr-4 py-2.5 bg-white border-none rounded-2xl text-sm shadow-sm placeholder:text-stone-300 focus:ring-2 focus:ring-secondary transition-all"
                placeholder={t('nav.searchPlaceholder')}
                type="text"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-300">search</span>
            </div>
            <div className="flex items-center gap-5 text-stone-400">
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-all">notifications</span>
              <div className="flex items-center gap-2 text-primary font-black px-3 py-1.5 bg-white rounded-xl shadow-sm border border-stone-100">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="text-sm">{streak.currentStreak}</span>
              </div>
              <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-all">event_repeat</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-8 space-y-8 scroll-smooth">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-container to-primary p-12 text-white sun-drenched-shadow-lg min-h-[280px] flex flex-col justify-center">
            <div className="relative z-10 max-w-lg">
              <h3 className="text-5xl font-black mb-3 tracking-tight">{t('home.welcome')}</h3>
              <p className="text-lg opacity-90 font-medium max-w-sm">
                Bạn đã học {stats.mastered} từ mới tuần này. Hãy tiếp tục nhé!
              </p>
              <Link
                to="/study"
                className="mt-8 px-8 py-3.5 bg-white text-primary font-black rounded-2xl hover:bg-stone-50 transition-all shadow-xl shadow-black/10"
              >
                {t('home.continueChallenge')}
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/3 flex items-center justify-center opacity-10 rotate-12 translate-x-12">
              <span className="material-symbols-outlined text-[320px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            </div>
          </section>

          {/* Stats Row */}
          <section className="grid grid-cols-12 gap-6">
            {/* Daily Goal */}
            <div className="col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-10">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3 block">{t('home.currentGoal')}</span>
                <h4 className="text-3xl font-black text-on-surface mb-6">
                  {stats.new} <span className="text-stone-300 font-medium">/ 10 {t('home.newWords')}</span>
                </h4>
                <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (stats.new / 10) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-[6px] border-secondary/10 bg-secondary/5">
                <span className="text-3xl font-black text-secondary">{Math.round((stats.new / 10) * 100)}%</span>
                <span className="text-[9px] font-bold text-secondary/60 uppercase tracking-tighter">Hoàn thành</span>
              </div>
            </div>

            {/* Rank Card */}
            <div className="col-span-4 bg-secondary-container p-8 rounded-3xl flex flex-col justify-center items-center text-on-secondary-container shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
              <p className="font-black text-xl">Newcomer Rank</p>
              <p className="text-xs font-medium opacity-70 mt-1">{10 - totalMastered} XP đến cấp tiếp theo</p>
            </div>
          </section>

          {/* Continue Learning */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h4 className="text-2xl font-black tracking-tight">{t('home.continueLearning')}</h4>
                <p className="text-stone-400 font-medium text-sm">Tiếp tục học từ bộ thẻ đã chọn.</p>
              </div>
              <Link className="text-primary font-bold text-sm hover:underline decoration-2 underline-offset-8 transition-all" to="/library">{t('home.viewLibrary')}</Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {/* Deck Card 1 */}
              <div className="group bg-white p-3 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl transition-all duration-300">
                <div className="relative h-44 rounded-2xl overflow-hidden mb-5">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="Daily conversation"
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 px-3 py-1 bg-primary text-white text-[9px] font-black rounded-lg uppercase tracking-widest">Giao tiếp</span>
                </div>
                <div className="px-3 pb-4">
                  <h5 className="text-xl font-black mb-2">{t('topics.daily')}</h5>
                  <p className="text-sm text-stone-400 mb-6 line-clamp-2 leading-relaxed">
                    Từ vựng giao tiếp hàng ngày cơ bản.
                  </p>
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
                    <span className="text-stone-300">
                      {[...progressMap.values()].filter(p => p.repetitions >= 5 && cards.find(c => c.id === p.cardId && c.topic === 'daily')).length}/4 Mastered
                    </span>
                    <Link to="/study?topic=daily" className="text-secondary flex items-center gap-1">
                      {t('home.resume')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Deck Card 2 */}
              <div className="group bg-white p-3 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl transition-all duration-300">
                <div className="relative h-44 rounded-2xl overflow-hidden mb-5">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="Travel"
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 px-3 py-1 bg-secondary text-white text-[9px] font-black rounded-lg uppercase tracking-widest">Du lịch</span>
                </div>
                <div className="px-3 pb-4">
                  <h5 className="text-xl font-black mb-2">{t('topics.travel')}</h5>
                  <p className="text-sm text-stone-400 mb-6 line-clamp-2 leading-relaxed">
                    Từ vựng du lịch và đi lại.
                  </p>
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
                    <span className="text-stone-300">
                      {[...progressMap.values()].filter(p => p.repetitions >= 5 && cards.find(c => c.id === p.cardId && c.topic === 'travel')).length}/3 Mastered
                    </span>
                    <Link to="/study?topic=travel" className="text-secondary flex items-center gap-1">
                      {t('home.resume')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-[24%] p-8 border-l border-stone-100 bg-white space-y-8 overflow-y-auto">
        {/* Streak Widget */}
        <div className="bg-surface-container-high p-8 rounded-[32px] text-center sun-drenched-shadow">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary/5">
              <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-black w-7 h-7 flex items-center justify-center rounded-full border-4 border-surface-container-high">
              {streak.currentStreak}
            </div>
          </div>
          <h5 className="text-2xl font-black text-on-surface">{streak.currentStreak} {t('progress.streak')}</h5>
          <p className="text-sm text-stone-400 mt-2 font-medium">{t('progress.topStreak')}</p>

          {/* Weekly streak bars */}
          <div className="flex justify-between mt-8">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const heights = [40, 70, 50, 60, 80, 0, 0]
              const heights2 = [10, 20, 30, 40, 50, 0, 0]
              const isToday = i === 4
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-[9px] font-black text-stone-300">{day}</span>
                  <div
                    className={`w-2.5 rounded-full transition-all ${isToday ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-secondary'}`}
                    style={{ height: `${isToday ? heights2[i] : heights[i]}%`, minHeight: '4px' }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Updates Feed */}
        <div className="space-y-5">
          <div className="flex justify-between items-center px-1">
            <h6 className="font-black text-[11px] uppercase tracking-widest text-stone-400">Cập nhật</h6>
          </div>
          <div className="space-y-3">
            <div className="flex gap-4 p-4 bg-white rounded-2xl border border-stone-100 hover:border-secondary/20 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              </div>
              <div>
                <p className="text-xs font-black">Học tập tốt!</p>
                <p className="text-[11px] text-stone-400 font-medium leading-relaxed">Bạn đã hoàn thành bài ôn hôm nay.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white rounded-2xl border border-stone-100 hover:border-primary/20 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <div>
                <p className="text-xs font-black">Ôn tập sẵn sàng</p>
                <p className="text-[11px] text-stone-400 font-medium leading-relaxed">{stats.dueCards.length} từ cần ôn tập.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Card */}
        <div className="bg-tertiary-container/10 p-6 rounded-3xl border border-tertiary-container/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
            <span className="material-symbols-outlined text-7xl">psychology</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-tertiary">tips_and_updates</span>
            <h6 className="font-black text-tertiary text-sm">Mẹo học tập</h6>
          </div>
          <p className="text-[12px] leading-relaxed text-on-tertiary-container/70 italic font-medium">
            "Lặp lại ngắt quãng hiệu quả nhất khi bạn sắp quên. Thử ôn tập 5 phút ngay!"
          </p>
          <Link to="/study" className="w-full mt-6 py-3 border-2 border-tertiary/30 text-tertiary text-[11px] font-black rounded-xl hover:bg-tertiary hover:text-white hover:border-tertiary transition-all flex items-center justify-center">
            Bắt đầu Flashcards
          </Link>
        </div>
      </aside>
    </div>
  )
}
