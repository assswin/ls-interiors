
import { useState } from 'react'
import Sidebar, {
  type Language,
  type PageKey,
} from './components/Sidebar'
import Measurements from './pages/Measurements'
import './App.css'

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [activePage, setActivePage] = useState<PageKey>('dashboard')

  const pageTitles: Record<PageKey, { en: string; ta: string }> = {
    dashboard: { en: 'Dashboard', ta: 'முகப்பு' },
    customers: { en: 'Customers', ta: 'வாடிக்கையாளர்கள்' },
    projects: { en: 'Projects', ta: 'திட்டங்கள்' },
    measurements: { en: 'Measurements', ta: 'அளவீடுகள்' },
    windowModels: { en: 'Window Models', ta: 'ஜன்னல் வகைகள்' },
    calculations: { en: 'Calculations', ta: 'கணக்கீடுகள்' },
    drawings: { en: 'Drawings & PDFs', ta: 'வரைபடங்கள் மற்றும் PDF' },
    workshop: { en: 'Workshop', ta: 'பட்டறை' },
  }

  const currentTitle = pageTitles[activePage]

  return (
    <div className="app-shell">
      <Sidebar
        language={language}
        onLanguageChange={setLanguage}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>
              {language === 'en' ? currentTitle.en : currentTitle.ta}
            </h1>

            <p>
              {language === 'en'
                ? 'Welcome to LS INTERIORS'
                : 'LS INTERIORS-க்கு வரவேற்கிறோம்'}
            </p>
          </div>
        </header>

        {activePage === 'dashboard' ? (
          <section className="dashboard-placeholder">
            <h2>
              {language === 'en' ? 'Your workspace' : 'உங்கள் பணியிடம்'}
            </h2>

            <p>
              {language === 'en'
                ? 'Your customers, projects and window measurements will appear here.'
                : 'உங்கள் வாடிக்கையாளர்கள், திட்டங்கள் மற்றும் ஜன்னல் அளவீடுகள் இங்கே தோன்றும்.'}
            </p>
          </section>
        ) : activePage === 'measurements' ? (
          <Measurements />
        ) : (
          <section className="dashboard-placeholder">
            <h2>
              {language === 'en'
                ? `${currentTitle.en} Workspace`
                : `${currentTitle.ta} பணியிடம்`}
            </h2>

            <p>
              {language === 'en'
                ? 'This workspace will be developed step by step.'
                : 'இந்தப் பகுதி படிப்படியாக உருவாக்கப்படும்.'}
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
