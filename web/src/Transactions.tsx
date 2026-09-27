import { useEffect, useMemo, useRef, useState } from 'react'
import type { Category, Flag, Provider, Summary, Txn } from '../../shared/types'
import { CATEGORIES, Icon, PROVIDERS, cents, categoryIcon, dateLong, dateShort, money, monthLong, providerIcon, providerName, useApi } from './lib'
import { Loading } from './App'

const FLAGS: Record<Flag, { label: string; icon: string; tone: string }> = {
  missing_receipt: { label: 'Missing receipt', icon: 'receipt', tone: 'warn' },
  duplicate: { label: 'Duplicate', icon: 'copy', tone: 'bad' },
  unusual: { label: 'Unusual', icon: 'alert', tone: 'warn' },
  needs_review: { label: 'Needs review', icon: 'search', tone: 'info' },
  '1099': { label: '1099', icon: 'file', tone: 'info' },
}

const ROW_H = 56
const OVERSCAN = 8

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
  const { data, error, setData } = useApi<Txn[]>(`/api/transactions?${qs}`)
  const listRef = useRef<HTMLDivElement>(null)
  const [scroll, setScroll] = useState({ top: 0, h: 800 })
  const [reviewing, setReviewing] = useState(false)
  const [reviewErr, setReviewErr] = useState<string | null>(null)
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScroll(s => ({ ...s, h: el.clientHeight })))
    ro.observe(el)
    return () => ro.disconnect()
  }, [data != null])
  useEffect(() => { listRef.current?.scrollTo(0, 0) }, [qs, flags])
  useEffect(() => setReviewErr(null), [selId])
  const months = useApi<Summary>('/api/summary').data?.months.map(m => m.month).reverse() ?? []

  const rows = useMemo(() => (data ?? []).filter(t => flags.every(f => t.flags.includes(f))), [data, flags])
  const flagCount = (f: Flag) => (data ?? []).filter(t => t.flags.includes(f)).length
  const sel = rows.find(t => t.id === selId) ?? rows[0]
  const picked = selId != null && rows.some(t => t.id === selId)
  const first = Math.max(0, Math.floor(scroll.top / ROW_H) - OVERSCAN)
  const last = Math.min(rows.length, Math.ceil((scroll.top + scroll.h) / ROW_H) + OVERSCAN)
  const reviewable = sel?.flags.some(f => f === 'unusual' || f === 'needs_review')

  async function markReviewed(t: Txn) {
    setReviewing(true); setReviewErr(null)
    try {
      const r = await fetch(`/api/transactions/${encodeURIComponent(t.id)}/review`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) })
      if (!r.ok) throw new Error(r.status === 404 ? 'Countinghouse could not find this transaction.' : `Could not save (${r.status}). Try again.`)
      const body = await r.json().catch(() => null)
      const upd: Txn = body && body.id === t.id ? body : { ...t, flags: t.flags.filter(f => f !== 'unusual' && f !== 'needs_review') }
      setData(cur => cur?.map(x => (x.id === t.id ? upd : x)) ?? cur)
    } catch (e) { setReviewErr((e as Error).message) }
    finally { setReviewing(false) }
  }
  const real = rows.filter(t => t.category !== 'Transfers')
  const totalIn = real.reduce((a, t) => a + (t.amount > 0 ? t.amount : 0), 0)
  const totalOut = real.reduce((a, t) => a + (t.amount < 0 ? -t.amount : 0), 0)
  const toggle = (f: Flag) => setFlags(fs => (fs.includes(f) ? fs.filter(x => x !== f) : [...fs, f]))

  return (
    <div className="fade-in">
      <header className="page-head">
        <div>
          <h1>Transactions</h1>
          <p className="num">{data ? `${rows.length} shown · ${money(totalIn)} in · ${money(totalOut)} out, not counting transfers` : ' '}</p>
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
          <div className="rows tx-box">
            <div className="row head tx-row"><span>Date</span><span>Vendor</span><span className="tx-cat">Category</span><span className="tx-src">Source</span><span className="right">Amount</span></div>
            <div className="tx-list" ref={listRef} onScroll={e => setScroll({ top: e.currentTarget.scrollTop, h: e.currentTarget.clientHeight })}>
              {rows.length === 0 && <div className="empty">No transactions match these filters.</div>}
              <div style={{ height: rows.length * ROW_H, position: 'relative' }}>
                {rows.slice(first, last).map((t, k) => {
                  const i = first + k
                  return (
                    <button key={t.id} style={{ top: i * ROW_H, height: ROW_H }} className={`row tx-row vrow${i === 0 ? ' first' : ''}${sel?.id === t.id ? ' sel' : ''}`} onClick={() => setSelId(t.id)}>
                      <span className="muted num tx-date">{dateShort(t.date)}</span>
                      <span className="tx-v">
                        <b className="ellip">{t.vendor}
                          {t.flags.length > 0 && <span className="flags inline">{t.flags.map(f => <span key={f} className={`tag ${FLAGS[f].tone}`}><Icon name={FLAGS[f].icon} size={13} /><span className="tag-l">{FLAGS[f].label}</span></span>)}</span>}
                        </b>
                        <span className="ellip">{t.description}</span>
                      </span>
                      <span className="ellip tx-cat"><Icon name={categoryIcon[t.category] ?? 'tag'} size={15} />{t.category}</span>
                      <span className="muted tx-src">{providerName[t.source]}</span>
                      <span className={`amt${t.amount > 0 ? ' pos' : ''}`}>{t.amount > 0 ? '+' : '−'}{cents(Math.abs(t.amount))}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <aside className={`detail${picked ? ' picked' : ''}`}>
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
              {reviewable && (
                <div className="review">
                  <button className="btn primary" onClick={() => markReviewed(sel)} disabled={reviewing}>
                    <Icon name="check-circle" size={15} />{reviewing ? 'Saving' : 'Mark reviewed'}
                  </button>
                  <span className="sub">{reviewErr ?? 'Clears the review flag and tells the agent this charge is expected.'}</span>
                </div>
              )}
              <button className="btn detail-close" onClick={() => setSelId(null)}><Icon name="x" size={15} />Close</button>
            </> : <div className="muted">Select a transaction.</div>}
          </aside>
        </div>
      )}
    </div>
  )
}
