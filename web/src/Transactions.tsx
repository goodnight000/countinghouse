import { useEffect, useMemo, useState } from 'react'
import type { Category, Flag, Provider, Summary, Txn } from '../../shared/types'
import { CATEGORIES, Icon, PROVIDERS, cents, categoryIcon, dateLong, dateShort, money, monthLong, providerIcon, providerName, useApi } from './lib'
import { Loading } from './App'

export const FLAGS: Record<Flag, { label: string; icon: string; tone: string }> = {
  missing_receipt: { label: 'Missing receipt', icon: 'receipt', tone: 'warn' },
  duplicate: { label: 'Duplicate', icon: 'copy', tone: 'bad' },
  unusual: { label: 'Unusual', icon: 'alert', tone: 'warn' },
  needs_review: { label: 'Needs review', icon: 'search', tone: 'info' },
  '1099': { label: '1099', icon: 'file', tone: 'info' },
}

const params = () => new URLSearchParams(location.hash.split('?')[1] ?? '')

export default function Transactions() {
  const init = params()
  const [month, setMonth] = useState(init.get('month') ?? '')
  const [category, setCategory] = useState<Category | ''>((init.get('category') as Category) ?? '')
  const [source, setSource] = useState<Provider | ''>((init.get('source') as Provider) ?? '')
  const [q, setQ] = useState(init.get('q') ?? '')
  const [dq, setDq] = useState(q)
  const [flags, setFlags] = useState<Flag[]>(init.get('flag') ? [init.get('flag') as Flag] : [])
  const [selId, setSelId] = useState<string | null>(null)
  useEffect(() => { const t = setTimeout(() => setDq(q), 180); return () => clearTimeout(t) }, [q])

  const qs = new URLSearchParams({ month, category, source, q: dq }).toString()
  const { data, error } = useApi<Txn[]>(`/api/transactions?${qs}`)
  const months = useApi<Summary>('/api/summary').data?.months.map(m => m.month).reverse() ?? []

  const rows = useMemo(() => (data ?? []).filter(t => flags.every(f => t.flags.includes(f))), [data, flags])
  const flagCount = (f: Flag) => (data ?? []).filter(t => t.flags.includes(f)).length
  const sel = rows.find(t => t.id === selId) ?? rows[0]
  const totalIn = rows.reduce((a, t) => a + (t.amount > 0 ? t.amount : 0), 0)
  const totalOut = rows.reduce((a, t) => a + (t.amount < 0 ? -t.amount : 0), 0)
  const toggle = (f: Flag) => setFlags(fs => (fs.includes(f) ? fs.filter(x => x !== f) : [...fs, f]))

  return (
    <div className="fade-in">
      <header className="page-head">
        <div>
          <h1>Transactions</h1>
          <p className="num">{data ? `${rows.length} shown · ${money(totalIn)} in · ${money(totalOut)} out` : ' '}</p>
        </div>
      </header>

      <div className="filters">
        <label className="search">
          <Icon name="search" size={16} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search vendor or descriptor" aria-label="Search transactions" />
        </label>
        <select className="sel-ctl" value={month} onChange={e => setMonth(e.target.value)} aria-label="Month">
          <option value="">All months</option>
          {months.map(m => <option key={m} value={m}>{monthLong(m)}</option>)}
        </select>
        <select className="sel-ctl" value={category} onChange={e => setCategory(e.target.value as Category)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="sel-ctl" value={source} onChange={e => setSource(e.target.value as Provider)} aria-label="Source">
          <option value="">All sources</option>
          {PROVIDERS.map(p => <option key={p} value={p}>{providerName[p]}</option>)}
        </select>
      </div>
      <div className="filters">
        {(Object.keys(FLAGS) as Flag[]).map(f => (
          <button key={f} className="chip" aria-pressed={flags.includes(f)} onClick={() => toggle(f)}>
            <Icon name={FLAGS[f].icon} size={14} />{FLAGS[f].label}<span className="n">{data ? flagCount(f) : ''}</span>
          </button>
        ))}
      </div>

      {!data ? <Loading error={error} what="transactions" /> : (
        <div className="tx-wrap">
          <div className="rows tx-list">
            <div className="row head tx-row"><span>Date</span><span>Vendor</span><span>Category</span><span>Source</span><span className="right">Amount</span></div>
            {rows.length === 0 && <div className="empty">No transactions match these filters.</div>}
            {rows.slice(0, 400).map(t => (
              <button key={t.id} className={`row tx-row${sel?.id === t.id ? ' sel' : ''}`} onClick={() => setSelId(t.id)}>
                <span className="muted num">{dateShort(t.date)}</span>
                <span className="tx-v ellip">
                  <b className="ellip">{t.vendor}
                    {t.flags.length > 0 && <span className="flags" style={{ display: 'inline-flex', marginLeft: 8, verticalAlign: 'middle' }}>{t.flags.map(f => <span key={f} className={`tag ${FLAGS[f].tone}`}><Icon name={FLAGS[f].icon} size={13} />{FLAGS[f].label}</span>)}</span>}
                  </b>
                  <span className="ellip">{t.description}</span>
                </span>
                <span className="ellip" style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--ink-2)' }}><Icon name={categoryIcon[t.category] ?? 'tag'} size={15} />{t.category}</span>
                <span className="muted">{providerName[t.source]}</span>
                <span className={`amt${t.amount > 0 ? ' pos' : ''}`}>{t.amount > 0 ? '+' : '−'}{cents(Math.abs(t.amount))}</span>
              </button>
            ))}
          </div>

          <aside className="detail">
            {sel ? <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="int-ic"><Icon name={providerIcon[sel.source]} /></span>
                <div><b style={{ fontWeight: 600 }}>{sel.vendor}</b><div className="sub">{dateLong(sel.date)}</div></div>
              </div>
              <div className={`big${sel.amount > 0 ? ' pos' : ''}`}>{sel.amount > 0 ? '+' : '−'}{cents(Math.abs(sel.amount))}</div>
              {sel.flags.length > 0 && <div className="flags">{sel.flags.map(f => <span key={f} className={`tag ${FLAGS[f].tone}`}><Icon name={FLAGS[f].icon} size={13} />{FLAGS[f].label}</span>)}</div>}
              <dl className="kv">
                <dt>Category</dt><dd>{sel.category}</dd>
                <dt>Account</dt><dd>{sel.account}</dd>
                <dt>Descriptor</dt><dd>{sel.description}</dd>
                <dt>Receipt</dt><dd>{sel.receipt ? 'Attached' : <span style={{ color: 'var(--warn)' }}>Missing</span>}</dd>
              </dl>
              {sel.note && <div className="note">{sel.note}</div>}
            </> : <div className="muted">Select a transaction.</div>}
          </aside>
        </div>
      )}
    </div>
  )
}
