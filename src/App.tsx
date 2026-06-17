import { useState } from 'react'
import './App.css'
import AthletesView from './components/AthletesView'
import YearView from './components/YearView'
import VisualizationsView from './components/VisualizationsView'
import { WrestlingDataProvider, useWrestlingData } from './data/WrestlingDataContext'

interface Tab {
  id: 'athletes' | 'years' | 'viz'
  label: string
}

const TABS: Tab[] = [
  { id: 'athletes', label: 'All Athletes' },
  { id: 'years',    label: 'Results by Year' },
  { id: 'viz',      label: 'Visualizations' },
]

const NavBrand = () => (
  <div className="nav-brand">
    <span className="brand-icon">🤼</span>
    <span className="brand-title">Mat Metrics</span>
  </div>
)

function AppContent() {
  const [tab, setTab] = useState<Tab['id']>('athletes')
  const { loading, error } = useWrestlingData()

  if (loading) {
    return (
      <div className="app">
        <nav className="nav"><NavBrand /></nav>
        <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 16 }}>Loading championship data…</div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <nav className="nav"><NavBrand /></nav>
        <main className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, color: '#e05c5c' }}>Failed to load data</div>
            <div style={{ fontSize: 12, marginTop: 8, color: 'var(--muted)' }}>{error}</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="nav">
        <NavBrand />
        <div className="nav-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`nav-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="page">
        {tab === 'athletes' && <AthletesView />}
        {tab === 'years'    && <YearView />}
        {tab === 'viz'      && <VisualizationsView />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <WrestlingDataProvider>
      <AppContent />
    </WrestlingDataProvider>
  )
}
