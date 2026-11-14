
import './Sidebar.css'

export type Language = 'en' | 'ta'

export type PageKey =
  | 'dashboard'
  | 'customers'
  | 'projects'
  | 'measurements'
  | 'windowModels'
  | 'calculations'
  | 'drawings'
  | 'workshop'

interface SidebarProps {
  language: Language
  onLanguageChange: (language: Language) => void
  activePage: PageKey
  onNavigate: (page: PageKey) => void
}

function Sidebar({
  language,
  onLanguageChange,
  activePage,
  onNavigate,
}: SidebarProps) {
  const menuItems: {
    key: PageKey
    en: string
    ta: string
    icon: string
  }[] = [
    { key: 'dashboard', en: 'Dashboard', ta: 'முகப்பு', icon: '▦' },
    { key: 'customers', en: 'Customers', ta: 'வாடிக்கையாளர்கள்', icon: '♙' },
    { key: 'projects', en: 'Projects', ta: 'திட்டங்கள்', icon: '▣' },
    { key: 'measurements', en: 'Measurements', ta: 'அளவீடுகள்', icon: '⌗' },
    { key: 'windowModels', en: 'Window Models', ta: 'ஜன்னல் வகைகள்', icon: '▤' },
    { key: 'calculations', en: 'Calculations', ta: 'கணக்கீடுகள்', icon: '∑' },
    { key: 'drawings', en: 'Drawings & PDFs', ta: 'வரைபடங்கள் மற்றும் PDF', icon: '▧' },
    { key: 'workshop', en: 'Workshop', ta: 'பட்டறை', icon: '⚙' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">LS</div>

        <div>
          <h2>LS INTERIORS</h2>
          <p>Window Management</p>
        </div>
      </div>

      <div className="sidebar-section-title">
        {language === 'en' ? 'WORKSPACE' : 'பணியிடம்'}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            type="button"
            className={`sidebar-link ${
              activePage === item.key ? 'active' : ''
            }`}
            key={item.key}
            onClick={() => onNavigate(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{language === 'en' ? item.en : item.ta}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="language-label">
          {language === 'en' ? 'LANGUAGE' : 'மொழி'}
        </div>

        <div className="language-switch">
          <button
            className={language === 'en' ? 'selected' : ''}
            onClick={() => onLanguageChange('en')}
            type="button"
          >
            English
          </button>

          <button
            className={language === 'ta' ? 'selected' : ''}
            onClick={() => onLanguageChange('ta')}
            type="button"
          >
            தமிழ்
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
