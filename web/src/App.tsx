import { useEffect, useState } from 'react'
import { Icon, useApi } from './lib'
import type { Summary } from '../../shared/types'
import Overview from './Overview'
import Transactions from './Transactions'
import Taxes from './Taxes'
import Integrations from './Integrations'
import Memory from './Memory'

const SCREENS = [
  { id: 'overview', label: 'Overview', short: 'Overview', icon: 'chart' },
  { id: 'transactions', label: 'Transactions', short: 'Activity', icon: 'receipt' },
  { id: 'taxes', label: 'Taxes & deadlines', short: 'Taxes', icon: 'calendar' },
  { id: 'integrations', label: 'Integrations', short: 'Accounts', icon: 'plug' },
  { id: 'memory', label: 'Memory', short: 'Memory', icon: 'book' },
] as const
type ScreenId = (typeof SCREENS)[number]['id']

const fromHash = (): ScreenId => {
  const h = location.hash.replace('#/', '').split('?')[0] as ScreenId
  return SCREENS.some(s => s.id === h) ? h : 'overview'
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(fromHash)
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => { setScreen(fromHash()); setHash(location.hash); window.scrollTo(0, 0) }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const summary = useApi<Summary>('/api/summary')
  const co = summary.data?.company
  const [theme, toggleTheme] = useTheme()
  const asOf = summary.data ? `As of ${new Date(summary.data.asOf + (summary.data.asOf.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : summary.error ? 'Waiting for the API…' : ' '
  const brand = (
    <div className="brand">
      <span className="brand-mark"><Icon name="calculator" size={16} /></span>
      <div>
        <b>Countinghouse</b>
        <small>{co ? `${co.name} · ${co.stage}` : 'Connecting…'}</small>
      </div>
    </div>
  )
  const themeBtn = (
    <button className="theme-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} /><span className="lbl">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )

  return (
    <div className="shell">
      <aside className="rail">
        {brand}
        <nav className="nav">
          {SCREENS.map(s => (
            <a key={s.id} href={`#/${s.id}`} aria-current={screen === s.id ? 'page' : undefined} title={s.label}>
              <Icon name={s.icon} />
              <span className="lbl">{s.label}</span>
            </a>
          ))}
        </nav>
        <div className="rail-foot">
          <a className="ask" href={ASK_URL} target="_blank" rel="noreferrer" title="Ask Countinghouse">
            <Icon name="chat" />
            <span className="lbl">Ask Countinghouse</span>
            <span className="ext"><Icon name="external" size={14} /></span>
          </a>
          <div className="foot-row">
            <span className="asof">{asOf}</span>
            {themeBtn}
          </div>
        </div>
      </aside>
      <header className="topbar">
        {brand}
        <div className="actions">
          {themeBtn}
          <a className="ask" href={ASK_URL} target="_blank" rel="noreferrer"><Icon name="chat" size={16} />Ask</a>
        </div>
      </header>
      <main className="main">
        <div className="doc" key={hash.split('?')[1] ? hash : screen}>
          {screen === 'overview' && <Overview s={summary.data} error={summary.error} />}
          {screen === 'transactions' && <Transactions />}
          {screen === 'taxes' && <Taxes />}
          {screen === 'integrations' && <Integrations onSynced={summary.reload} />}
          {screen === 'memory' && <Memory />}
        </div>
      </main>
      <nav className="tabbar" aria-label="Sections">
        {SCREENS.map(s => (
          <a key={s.id} href={`#/${s.id}`} aria-current={screen === s.id ? 'page' : undefined}>
            <Icon name={s.icon} size={20} />
            {s.short}
          </a>
        ))}
      </nav>
    </div>
  )
}

const ASK_URL = 'http://localhost:8081'

// Explicit choice persists in localStorage; otherwise follow the OS setting live.
const mq = matchMedia('(prefers-color-scheme: dark)')
function useTheme() {
  const [choice, setChoice] = useState<string | null>(() => localStorage.getItem('theme'))
  const [system, setSystem] = useState(mq.matches ? 'dark' : 'light')
  useEffect(() => {
    const on = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const theme = choice ?? system
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    setChoice(next)
  }
  return [theme, toggle] as const
}

export function Loading({ error, what }: { error: string | null; what: string }) {
  return (
    <div className="loading">
      <Icon name="loader" className="ic-play" />
      {error ? `Waiting for ${what} — the API isn't answering yet (${error}). Retrying.` : `Loading ${what}…`}
    </div>
  )
}
