import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('home.welcome')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('home.subtitle')}</p>
        <div className="flex gap-4 justify-center mt-8">
          <a href="/learn" className="btn-primary">{t('home.startLearning')}</a>
          <a href="/review" className="btn-secondary">{t('home.continueReview')}</a>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">0</div>
          <div className="text-sm text-muted-foreground mt-2">{t('home.cardsLearned')}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-warning">0</div>
          <div className="text-sm text-muted-foreground mt-2">{t('home.cardsToReview')}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-success">0</div>
          <div className="text-sm text-muted-foreground mt-2">{t('home.streak')}</div>
        </div>
      </section>

      {/* Topics */}
      <section>
        <h2 className="text-2xl font-bold mb-6">{t('topics.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {['daily', 'travel', 'business', 'technology', 'food'].map((topic) => (
            <a
              key={topic}
              href={`/learn?topic=${topic}`}
              className="card hover:border-primary transition-colors cursor-pointer"
            >
              <h3 className="font-semibold text-lg">{t(`topics.${topic}`)}</h3>
              <p className="text-sm text-muted-foreground mt-2">{t('topics.wordsCount', { count: 0 })}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}