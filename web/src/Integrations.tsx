import { useEffect, useState } from 'react'
import type { Integration } from '../../shared/types'
import { Icon, ago, money, post, providerIcon, useApi } from './lib'
import { Loading } from './App'

const KIND: Record<Integration['kind'], string> = { bank: 'Bank', card: 'Corporate card', revenue: 'Revenue', payroll: 'Payroll', cloud: 'Cloud bill', equity: 'Cap table' }

export default function Integrations({ onSynced }: { onSynced?: () => void }) {
  const { data, error, setData } = useApi<Integration[]>('/api/integrations')
  const [busy, setBusy] = useState<Set<string>>(new Set())
  const [flashed, setFlashed] = useState<Record<string, number>>({})
  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick(n => n + 1), 15000); return () => clearInterval(t) }, [])
  if (!data) return <Loading error={error} what="integrations" />

  const merge = (upd: Integration[]) => setData(cur => cur?.map(i => upd.find(u => u.id === i.id) ?? i) ?? upd)
  const mark = (ids: string[], on: boolean) => setBusy(b => { const n = new Set(b); ids.forEach(id => (on ? n.add(id) : n.delete(id))); return n })
  const done = (ids: string[]) => setFlashed(f => ({ ...f, ...Object.fromEntries(ids.map(id => [id, Date.now()])) }))

  async function syncOne(id: string) {
    mark([id], true)
    try { const r = await post<Integration>(`/api/integrations/${id}/sync`); merge([r]); done([id]); onSynced?.() }
    catch { merge([{ ...data!.find(i => i.id === id)!, status: 'error' }]) }
    finally { mark([id], false) }
  }
  async function syncAll() {
    const ids = data!.map(i => i.id)
    mark(ids, true)
    try { const r = await post<Integration[]>('/api/sync'); merge(r); done(ids); onSynced?.() }
    finally { mark(ids, false) }
  }

  const allBusy = data.every(i => busy.has(i.id))
  const live = data.filter(i => i.mode === 'live').length
  const records = data.reduce((a, i) => a + i.records, 0)
  const balance = data.reduce((a, i) => a + (i.balance ?? 0), 0)

  return (
    <div className="fade-in">
      <header className="page-head">
        <div>
          <h1>Integrations</h1>
          <p>Every account Countinghouse reads from. Sync pulls the latest records into the books.</p>
        </div>
        <button className={`btn primary sync-btn${allBusy ? ' ic-loop' : ''}`} style={{ width: 112 }} onClick={syncAll} disabled={busy.size > 0}>
          <Icon name="refresh" size={16} />{allBusy ? 'Syncing' : 'Sync all'}
        </button>
      </header>

      <div className="int-summary">
        <div><span className="sub">Connected</span><b>{data.filter(i => i.status !== 'error').length} of {data.length}</b></div>
        <div><span className="sub">Live API</span><b>{live} of {data.length}</b></div>
        <div><span className="sub">Records</span><b>{records.toLocaleString('en-US')}</b></div>
        <div><span className="sub">Balances held</span><b>{money(balance)}</b></div>
      </div>

      <div className="rows">
        <div className="row head int-row"><span /><span>Account</span><span>Mode</span><span>Status</span><span className="right">Records</span><span className="right">Balance</span><span /></div>
        {data.map(i => {
          const syncing = busy.has(i.id) || i.status === 'syncing'
          const status = syncing ? 'syncing' : i.status
          return (
            <div key={`${i.id}-${flashed[i.id] ?? 0}`} className={`row int-row ic-host${flashed[i.id] ? ' flash' : ''}`}>
              <span className="int-ic"><Icon name={providerIcon[i.id]} /></span>
              <span className="int-name"><b>{i.name}</b><span>{KIND[i.kind]}{i.accountMask ? ` · ${i.accountMask}` : ''}</span></span>
              <span>{i.mode === 'live' ? <span className="tag good"><Icon name="bolt" size={13} />Live API</span> : <span className="tag">Sample data</span>}</span>
              <span className={`status ${status}`}><span className="dot" />{status === 'syncing' ? 'Syncing…' : status === 'error' ? 'Error' : <span className="muted">Synced {ago(i.lastSync).toLowerCase()}</span>}</span>
              <span className="num right">{i.records.toLocaleString('en-US')}</span>
              <span className="num right">{i.balance != null ? money(i.balance) : <span className="muted">—</span>}</span>
              <button className={`btn sync-btn right${syncing ? ' ic-loop' : ''}`} onClick={() => syncOne(i.id)} disabled={syncing}>
                <Icon name="refresh" size={15} />{syncing ? 'Syncing' : 'Sync'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
