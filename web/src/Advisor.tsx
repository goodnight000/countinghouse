import { useEffect, useState } from 'react'
import type { Advice, AdviceStatus, Recommendation } from '../../shared/types'
import { Icon, Num, ago, compact, firstPlay, money, monthLong, post, useApi } from './lib'

const KIND_ICON: Record<string, string> = { cut: 'scissors', renegotiate: 'repeat', build: 'code', timing: 'hourglass', revenue: 'trending-up', compliance: 'shield' }
const LEVEL = (l: string) => l[0].toUpperCase() + l.slice(1)

// Advice with a 5s visible-tab poll (3s while an AI run is in flight) and optimistic decisions.
export function useAdvice() {
  const api = useApi<Advice>('/api/advice')
  const { data, reload, setData } = api
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') reload() }, data?.refreshing ? 3000 : 5000)
    return () => clearInterval(t)
  }, [data?.refreshing, reload])
  const decide = async (id: string, status: AdviceStatus) => {
    const before = data
    if (!before) return
    setData({ ...before, recommendations: before.recommendations.map(r => (r.id === id ? { ...r, status } : r)) })
    try { setData(await post<Advice>(`/api/advice/${encodeURIComponent(id)}/decision`, { status })) }
    catch { setData(before) }
  }
  return { ...api, decide }
}

export function AdviceRow({ rec, onDecide, onSelect, selected, onHover }: {
  rec: Recommendation; onDecide: (id: string, s: AdviceStatus) => void; onSelect?: (id: string) => void; selected?: boolean; onHover?: (id: string | null) => void
}) {
  const acc = rec.status === 'accepted', dis = rec.status === 'dismissed'
  return (
    <div className={`row adv-row${selected ? ' sel' : ''}${dis ? ' dis' : ''}${onSelect ? ' click' : ''}`} onClick={() => onSelect?.(rec.id)}
      onMouseEnter={() => onHover?.(rec.id)} onMouseLeave={() => onHover?.(null)}>
      <span className="ins-ic"><Icon name={KIND_ICON[rec.kind] ?? 'bulb'} size={16} /></span>
      <div className="adv-txt">
        <b className="ellip">{rec.title}</b>
        <span className="adv-why">{rec.rationale}</span>
        <span className="adv-meta">{LEVEL(rec.confidence)} confidence · {LEVEL(rec.effort)} effort</span>
      </div>
      <div className="adv-amt right num">
        {rec.monthlySavings > 0 ? <><b>{money(rec.monthlySavings)}/mo</b><span>{compact(rec.annualSavings)}/yr</span></>
          : rec.oneTimeCash > 0 ? <b>+{money(rec.oneTimeCash)} once</b> : <b>—</b>}
      </div>
      <div className="adv-act" onClick={e => e.stopPropagation()}>
        <button className={`btn${acc ? ' on' : ''}`} aria-label={`Accept ${rec.title}`} onClick={() => onDecide(rec.id, acc ? 'open' : 'accepted')}>
          <Icon name="check" size={15} /><span className="lbl">{acc ? 'Accepted' : 'Accept'}</span>
        </button>
        <button className="btn" aria-label={`Dismiss ${rec.title}`} onClick={() => onDecide(rec.id, dis ? 'open' : 'dismissed')}>
          <Icon name="x" size={15} /><span className="lbl">{dis ? 'Undo' : 'Dismiss'}</span>
        </button>
      </div>
    </div>
  )
}

export function SkeletonRows({ n }: { n: number }) {
  return <>{Array.from({ length: n }, (_, i) => <div className="row adv-row skel" key={i}><span /><i /></div>)}</>
}

export default function Advisor() {
  const { data: a, decide, setData } = useAdvice()
  const [hover, setHover] = useState<string | null>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [mode, setMode] = useState<'potential' | 'accepted'>('potential')
  const [stagger] = useState(() => firstPlay('list-advisor'))
  const recs = a?.recommendations ?? []
  const cur = recs.find(r => r.id === sel) ?? recs[0]
  const w = a ? a[mode] : null
  const pot = a?.potential.monthlySavings ?? 0
  const segs = recs.filter(r => r.status !== 'dismissed' && r.monthlySavings > 0)
  const refresh = async () => {
    if (!a) return
    setData({ ...a, refreshing: true })
    try { setData(await post<Advice>('/api/advice/refresh')) } catch { /* poll recovers */ }
  }
  const source = !a ? ' ' : (a.source === 'ai' ? `Written by ${a.model} · ${ago(a.generatedAt)}` : 'Rule-based estimate · add OPENAI_API_KEY for AI advice') + (a.stale ? ' · Ledger changed since' : '')

  return (
    <div className="fade-in">
      <header className="page-head">
        <div>
          <h1>Advisor</h1>
          <p className="adv-headline">{a?.headline ?? ' '}</p>
          <p className="sub">{source}</p>
          {a && a.source === 'rules' && a.error && !/OPENAI_API_KEY|api key/i.test(a.error) && <p className="adv-err">{a.error}</p>}
        </div>
        <button className="btn refresh-btn" onClick={refresh} disabled={!a || a.refreshing}>
          <Icon name={a?.refreshing ? 'loader' : 'refresh'} size={15} className={a?.refreshing ? 'ic-play' : undefined} />
          {a?.refreshing ? 'Thinking…' : 'Refresh'}
        </button>
      </header>

      <div className="ov adv">
        <div className="ov-main">
          <section className="meter">
            <div className="meter-top">
              <span className="kpi-value meter-v">{a ? <><Num value={pot} k="adv-pot" /><small>/mo</small></> : '—'}</span>
              <span className="kpi-note">{a ? `${compact(a.potential.monthlySavings * 12)}/yr · ${Math.round((pot / (a.baseline.burn || 1)) * 100)}% of ${money(a.baseline.burn)} burn` : ' '}</span>
            </div>
            <div className="meter-bar">
              {segs.map(r => (
                <i key={r.id} style={{ flexBasis: `${(r.monthlySavings / (pot || 1)) * 100}%`, background: hover === r.id ? 'var(--accent)' : r.status === 'accepted' ? 'var(--in)' : 'color-mix(in srgb, var(--accent) 26%, var(--surface))' }} />
              ))}
            </div>
          </section>

          <div className={`rows${stagger ? ' stagger' : ''}`}>
            {a ? recs.map((r, i) => (
              <div key={r.id} style={{ '--i': i } as React.CSSProperties} className="stg">
                <AdviceRow rec={r} onDecide={decide} onSelect={setSel} selected={cur?.id === r.id} onHover={setHover} />
              </div>
            )) : <SkeletonRows n={5} />}
          </div>
        </div>

        <aside className="side-rail">
          <section className="whatif">
            <h2 className="h2">Runway</h2>
            <div className="wi-big num">{a && w ? <>{a.baseline.runwayMonths} → <Num value={w.runwayMonths} fmt={n => n.toFixed(1)} k="adv-rw" /> months</> : '—'}</div>
            <p className="sub">{a && w ? `Zero cash moves from ${monthLong(a.baseline.zeroCashDate)} to ${monthLong(w.zeroCashDate)} · +${w.runwayGained.toFixed(1)} mo` : ' '}</p>
            <div className="wi-toggle">
              <button className="chip" aria-pressed={mode === 'potential'} onClick={() => setMode('potential')}>All open</button>
              <button className="chip" aria-pressed={mode === 'accepted'} onClick={() => setMode('accepted')}>Accepted only</button>
            </div>
          </section>
          <section className="adv-detail">
            {cur && (
              <div key={cur.id} className="adv-detail-body">
                <h3>{cur.title}</h3>
                <p>{cur.rationale}</p>
                <p><b>Action</b> {cur.action}</p>
                {(cur.evidence.vendors.length > 0 || cur.evidence.txnIds.length > 0) && (
                  <div className="evid">
                    {cur.evidence.vendors.map(v => <a key={v} href={`#/transactions?q=${encodeURIComponent(v)}`}>{v}</a>)}
                    {cur.evidence.txnIds.slice(0, 6).map(t => <a key={t} className="num" href={`#/transactions?q=${encodeURIComponent(t)}`}>{t}</a>)}
                  </div>
                )}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
