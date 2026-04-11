import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Home from './pages/Home'

function App() {
  const { t } = useTranslation()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="flex items-center h-16 gap-8">
              <span className="text-xl font-bold text-primary">{t('app.name')}</span>
              <div className="hidden md:flex items-center gap-6">
                <a href="/" className="text-sm font-medium hover:text-primary">{t('nav.home')}</a>
                <a href="/learn" className="text-sm font-medium hover:text-primary">{t('nav.learn')}</a>
                <a href="/review" className="text-sm font-medium hover:text-primary">{t('nav.review')}</a>
                <a href="/progress" className="text-sm font-medium hover:text-primary">{t('nav.progress')}</a>
              </div>
            </div>
          </div>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<div className="p-8"><h1 className="text-2xl font-bold">{t('nav.learn')}</h1></div>} />
            <Route path="/review" element={<div className="p-8"><h1 className="text-2xl font-bold">{t('nav.review')}</h1></div>} />
            <Route path="/progress" element={<div className="p-8"><h1 className="text-2xl font-bold">{t('progress.title')}</h1></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App