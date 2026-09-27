import { useEffect, useState } from 'react'
import { Icon, useApi } from './lib'
import type { Summary } from '../../shared/types'
import Overview from './Overview'
import Transactions from './Transactions'
import Taxes from './Taxes'
import Integrations from './Integrations'
import Memory from './Memory'

const SCREENS = [
  { id: 'overview', label: 'Overview', icon: 'chart' },
  { id: 'transactions', label: 'Transactions', icon: 'receipt' },
  { id: 'taxes', label: 'Taxes & deadlines', icon: 'calendar' },
  { id: 'integrations', label: 'Integrations', icon: 'plug' },
  { id: 'memory', label: 'Memory', icon: 'book' },
] as const
type ScreenId = (typeof SCREENS)[number]['id']

const fromHash = (): ScreenId => {
  const h = location.hash.replace('#/', '').split('?')[0] as ScreenId
  return SCREENS.some(s => s.id === h) ? h : 'overview'
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(fromHash)
  useEffect(() => {
    const on = () => { setScreen(fromHash()); document.querySelector('.main')?.scrollTo(0, 0) }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const summary = useApi<Summary>('/api/summary')
  const co = summary.data?.company

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">
          <span className="brand-mark"><Icon name="calculator" size={16} /></span>
          <div>
            <b>Countinghouse</b>
            <small>{co ? `${co.name} · ${co.stage}` : 'Connecting…'}</small>
          </div>
        </div>
        <nav className="nav">
          {SCREENS.map(s => (
            <a key={s.id} href={`#/${s.id}`} aria-current={screen === s.id ? 'page' : undefined}>
              <Icon name={s.icon} />
              {s.label}
            </a>
          ))}
        </nav>
        <div className="rail-foot">
          <a className="ask" href="http://localhost:8081" target="_blank" rel="noreferrer">
            <Icon name="chat" />
            Ask Countinghouse
            <span className="ext"><Icon name="external" size={14} /></span>
          </a>
          <div className="asof">{summary.data ? `Books as of ${new Date(summary.data.asOf + (summary.data.asOf.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : summary.error ? 'Waiting for API on :4001…' : ' '}</div>
        </div>
      </aside>
      <main className="main">
        <div className="doc" key={screen}>
          {screen === 'overview' && <Overview s={summary.data} error={summary.error} />}
          {screen === 'transactions' && <Transactions />}
          {screen === 'taxes' && <Taxes />}
          {screen === 'integrations' && <Integrations onSynced={summary.reload} />}
          {screen === 'memory' && <Memory />}
        </div>
      </main>
    </div>
  )
}

export function Loading({ error, what }: { error: string | null; what: string }) {
  return (
    <div className="loading">
      <Icon name="loader" className="ic-play" />
      {error ? `Waiting for ${what} — the API isn't answering yet (${error}). Retrying.` : `Loading ${what}…`}
    </div>
  )
}
