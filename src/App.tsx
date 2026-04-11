import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import StudyPage from './pages/StudyPage'
import LibraryPage from './pages/LibraryPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/progress" element={<div className="flex min-h-screen bg-surface"><p className="p-12 text-2xl font-bold">Progress — coming soon</p></div>} />
        <Route path="/settings" element={<div className="flex min-h-screen bg-surface"><p className="p-12 text-2xl font-bold">Settings — coming soon</p></div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App