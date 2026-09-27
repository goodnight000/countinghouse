import { useEffect, useRef, useState } from 'react'
import type { TaxEvent, TaxOverview } from '../../shared/types'
import { Icon, Num, dateLong, money, reducedMotion, toDate, useApi } from './lib'
import { Loading } from './App'

const STATUS: Record<TaxEvent['status'], { label: string; tone: string; icon: string }> = {
  done: { label: 'Done', tone: 'good', icon: 'check-circle' },
  upcoming: { label: 'Upcoming', tone: '', icon: 'calendar' },
  due_soon: { label: 'Due soon', tone: 'warn', icon: 'timer' },
  overdue: { label: 'Overdue', tone: 'bad', icon: 'alert' },
}
const AUTH_ICON: Record<TaxEvent['authority'], string> = { IRS: 'building', Delaware: 'building', California: 'sun', Payroll: 'people', Other: 'file' }
const fmtN = (n: number) => n.toLocaleString('en-US')

type Hov = (key: string | null, el?: HTMLElement) => void
function Month({ y, m, byDay, sel, onPick, onHover, hl, popOpen }: { y: number; m: number; byDay: Map<string, TaxEvent[]>; sel?: string; onPick: (e: TaxEvent) => void; onHover: Hov; hl: string | null; popOpen: string | null }) {
  const first = new Date(y, m, 1)
  const days = new Date(y, m + 1, 0).getDate()
  const t = new Date(), todayKey = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  const cells: (number | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`
  let open = 0
  for (const [k, evs] of byDay) if (k.startsWith(prefix)) open += evs.filter(e => e.status !== 'done').length
  return (
    <div className="mon">
      <h4 className={open ? '' : 'none'}>{first.toLocaleDateString('en-US', { month: 'long' })} <span>{y}</span>{open > 0 && <span className="num cnt">{open}</span>}</h4>
      <div className="days">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="dow">{d}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const evs = byDay.get(key)
          const past = key < todayKey ? ' past' : ''
          if (!evs) return <span key={i} className={`day${key === todayKey ? ' today' : past}`}>{d}</span>
          const worst = evs.find(e => e.status === 'overdue') ?? evs.find(e => e.status === 'due_soon') ?? evs.find(e => e.status !== 'done') ?? evs[0]
          return (
            <button key={i} data-date={key} className={`day ev ${worst.status}${key === todayKey ? ' today' : ''}${evs.some(e => e.id === sel) ? ' on' : ''}${hl === key ? ' hl' : ''}`}
              aria-describedby={popOpen === key ? 'cal-pop' : undefined}
              onMouseEnter={e => onHover(key, e.currentTarget)} onFocus={e => onHover(key, e.currentTarget)} onMouseLeave={() => onHover(null)} onBlur={() => onHover(null)}
              onClick={() => onPick(evs[0])}>{d}{evs.length > 1 && <span className="dots">{evs.slice(0, 3).map(e => <i key={e.id} />)}</span>}</button>
          )
        })}
      </div>
    </div>
  )
}

function relLabel(evs: TaxEvent[], date: string) {
  if (evs.every(e => e.status === 'done')) return { t: 'Filed', c: 'var(--ink-3)' }
  const t = new Date(); const d = Math.floor((toDate(date).getTime() - new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()) / 864e5)
  const c = evs.some(e => e.status === 'due_soon') ? 'var(--warn)' : 'var(--ink-3)'
  if (d < 0) return { t: `${-d} days overdue`, c: 'var(--bad)' }
  return { t: d === 0 ? 'Due today' : d === 1 ? 'Tomorrow' : `in ${d} days`, c }
}
const amtCell = (e: TaxEvent) => {
  if (/941|DE 9/.test(e.form ?? '') || /941|DE 9/.test(e.title)) return <span className="muted">Deposited</span>
  if (e.amount == null) return null
  if (e.amount < 0) return <span style={{ color: 'var(--good)' }}>Credit {money(-e.amount)}</span>
  if (e.amount === 0) return <span className="muted">$0 due</span>
  return money(e.amount)
}

// Hover popover: one element, positioned by transform only; opens after 120ms, then glides between days.
function useCalPop(calRef: React.RefObject<HTMLDivElement | null>, popRef: React.RefObject<HTMLDivElement | null>) {
  const [pop, setPop] = useState<{ key: string; x: number; y: number; ox: number; side: 'top' | 'bottom'; state: 'open' | 'closed'; instant: boolean } | null>(null)
  const timer = useRef(0), lastClose = useRef(0), isOpen = useRef(false)
  const place = (key: string, el: HTMLElement, instant: boolean) => {
    const cal = calRef.current, p = popRef.current
    if (!cal || !p) return
    const c = cal.getBoundingClientRect(), r = el.getBoundingClientRect()
    const w = p.offsetWidth, h = p.offsetHeight
    const cx = r.left - c.left + r.width / 2
    let y = r.top - c.top - h - 8, side: 'top' | 'bottom' = 'top'
    if (r.top - h - 8 < 0) { y = r.bottom - c.top + 8; side = 'bottom' }
    const x = Math.min(Math.max(8, cx - w / 2), c.width - w - 8)
    setPop({ key, x, y, ox: cx - x, side, state: instant ? 'open' : 'closed', instant })
    if (!instant) requestAnimationFrame(() => requestAnimationFrame(() => setPop(q => (q && q.key === key ? { ...q, state: 'open' } : q))))
    isOpen.current = true
  }
  const onHover: Hov = (key, el) => {
    clearTimeout(timer.current)
    if (matchMedia('(hover: none)').matches) return
    if (key && el) {
      const warm = isOpen.current || Date.now() - lastClose.current < 400
      if (warm) { setPop(q => (q ? { ...q, key } : { key, x: 0, y: 0, ox: 0, side: 'top', state: 'closed', instant: true })); requestAnimationFrame(() => place(key, el, true)) }
      else timer.current = window.setTimeout(() => { setPop(q => (q ? { ...q, key } : { key, x: 0, y: 0, ox: 0, side: 'top', state: 'closed', instant: false })); requestAnimationFrame(() => place(key, el, false)) }, 120)
    } else {
      timer.current = window.setTimeout(() => { isOpen.current = false; lastClose.current = Date.now(); setPop(q => (q ? { ...q, state: 'closed', instant: false } : q)) }, 80)
    }
  }
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onHover(null) }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])
  return { pop, onHover }
}

export default function Taxes() {
  const { data, error } = useApi<TaxOverview>('/api/taxes')
  const [selId, setSelId] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  const calRef = useRef<HTMLDivElement>(null), popRef = useRef<HTMLDivElement>(null)
  const { pop, onHover } = useCalPop(calRef, popRef)
  const hov: Hov = (k, el) => { setHoverDate(k); onHover(k, el) }
  const showDeadline = (id: string, date: string) => {
    setSelId(id)
    const el = calRef.current?.querySelector<HTMLElement>(`[data-date="${date}"]`)
    if (!el) return
    el.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' })
    el.classList.remove('ping'); void el.offsetWidth; el.classList.add('ping')
    el.addEventListener('animationend', () => el.classList.remove('ping'), { once: true })
  }
  if (!data) return <Loading error={error} what="taxes" />

  const ft = data.franchiseTax
  const events = data.events.slice().sort((a, b) => a.date.localeCompare(b.date))
  const byDay = new Map<string, TaxEvent[]>()
  for (const e of events) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e])
  const now = new Date()
  const upcoming = events.filter(e => e.status !== 'done' && toDate(e.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) || e.status === 'overdue')
  const overdue = upcoming.filter(e => e.status === 'overdue')
  const ahead = upcoming.filter(e => e.status !== 'overdue')
  const delaware = events.find(e => e.authority === 'Delaware')
  const sel = events.find(e => e.id === selId) ?? upcoming[0] ?? events[0]
  const est = data.estimatedTaxYear
  const missingW9 = data.contractors1099.filter(c => !c.w9).length
  const pctOff = ft.authorizedSharesMethod ? Math.round((ft.savings / ft.authorizedSharesMethod) * 100) : 0

  return (
    <div className="fade-in">
      <header className="page-head">
        <div>
          <h1>Taxes & deadlines</h1>
          <p>{overdue.length ? `${overdue.length} overdue · ` : ''}{ahead.length} deadlines in the next 12 months{ahead[0] ? ` · next is ${ahead[0].title}, ${dateLong(ahead[0].date)}` : ''}</p>
        </div>
      </header>

      <section className="reveal">
        <div>
          <span className="rv-label"><Icon name="mail" size={15} />Delaware's notice will say</span>
          <div className="rv-num strike"><Num value={ft.authorizedSharesMethod} k="tx-notice" duration={550} /></div>
          <p className="rv-math">Authorized shares method: <b>{fmtN(ft.authorizedShares)}</b> authorized shares, taxed on the count alone.</p>
        </div>
        <div>
          <span className="rv-label"><Icon name="calculator" size={15} />What you actually owe</span>
          <div className="rv-num"><Num value={ft.assumedParValueMethod} k="tx-owe" delay={900} duration={500} /></div>
          <p className="rv-math">Assumed par value method: <b>{fmtN(ft.issuedShares)}</b> issued shares against <b>{money(ft.grossAssets)}</b> gross assets.</p>
        </div>
        <div>
          <span className="rv-label"><Icon name="gem" size={15} />You keep</span>
          <div className="rv-num save"><Num value={ft.savings} k="tx-keep" delay={900} duration={500} /></div>
          <p className="rv-math">{pctOff}% less, by filing with the assumed par value method before {delaware ? dateLong(delaware.date) : 'March 1'}.</p>
          {delaware && <button className="btn" style={{ marginTop: 12 }} onClick={() => showDeadline(delaware.id, delaware.date)}><Icon name="calendar" size={15} />Show the deadline</button>}
        </div>
      </section>

      <div className="tax-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48, minWidth: 0 }}>
          <section>
            <div className="sec-head">
              <h2 className="h2">Next 12 months</h2>
              <div className="legend">
                <span><i style={{ background: 'var(--accent-soft)', boxShadow: 'inset 0 0 0 1px var(--accent)' }} />Upcoming</span>
                <span><i style={{ background: 'var(--warn-soft)', boxShadow: 'inset 0 0 0 1px var(--warn)' }} />Due soon</span>
                <span><i style={{ background: 'var(--bad-soft)', boxShadow: 'inset 0 0 0 1px var(--bad)' }} />Overdue</span>
                <span><i style={{ background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--ink-4)' }} />Done</span>
                <span><i style={{ background: 'transparent', boxShadow: 'inset 0 0 0 1.5px var(--ink)' }} />Today</span>
              </div>
            </div>
            <div className="cal" ref={calRef}>
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
                return <Month key={i} y={d.getFullYear()} m={d.getMonth()} byDay={byDay} sel={sel?.id} onPick={e => setSelId(e.id)} onHover={hov} hl={hoverDate} popOpen={pop?.state === 'open' ? pop.key : null} />
              })}
              <div role="tooltip" id="cal-pop" ref={popRef} className="cal-pop" data-state={pop?.state ?? 'closed'} data-instant={pop?.instant ? '' : undefined}
                style={{ transform: `translate(${pop?.x ?? 0}px, ${pop?.y ?? 0}px)`, transformOrigin: `${pop?.ox ?? 0}px ${pop?.side === 'bottom' ? '0%' : '100%'}` }}>
                {pop && (() => {
                  const evs = byDay.get(pop.key) ?? [], rl = relLabel(evs, pop.key)
                  return <>
                    <div className="cp-head"><b>{dateLong(pop.key)}</b><span style={{ color: rl.c }}>{rl.t}</span></div>
                    <div className={`cp-list${evs.length >= 3 ? ' many' : ''}`}>
                      {evs.map(e => (
                        <div className="cp-ev" key={e.id}>
                          <div className="cp-r1"><span className={`tag ${STATUS[e.status].tone}`}><Icon name={STATUS[e.status].icon} size={13} />{STATUS[e.status].label}</span><span className="cp-amt num">{amtCell(e)}</span></div>
                          <div className="cp-title">{e.title}</div>
                          <div className="cp-auth"><Icon name={AUTH_ICON[e.authority]} size={13} />{e.authority}{e.form ? ` · ${e.form}` : ''}</div>
                          <p className="cp-desc">{e.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                })()}
              </div>
            </div>
          </section>

          <section>
            <div className="sec-head">
              <div><h2 className="h2">Estimated taxes this year</h2><p className="sub">What to set aside, so April is not a surprise.</p></div>
            </div>
            <div className="est">
              <div><span className="kpi-label"><Icon name="building" size={15} />Federal income tax</span><span className="kpi-value"><Num value={est.federal} k="est-fed" duration={600} /></span><span className="kpi-note">{est.federal === 0 ? 'Operating at a loss, so nothing is owed on income yet.' : 'Pay in quarterly estimates to avoid penalties.'}</span></div>
              <div><span className="kpi-label"><Icon name="sun" size={15} />State</span><span className="kpi-value"><Num value={est.state} k="est-st" delay={60} duration={600} /></span><span className="kpi-note">{est.state === 800 ? 'California’s $800 minimum franchise tax.' : 'State income and franchise taxes.'}</span></div>
              <div><span className="kpi-label"><Icon name="people" size={15} />Payroll taxes</span><span className="kpi-value"><Num value={est.payroll} k="est-pay" delay={120} duration={600} /></span><span className="kpi-note">Employer share, withheld and filed through Gusto.</span></div>
            </div>
          </section>

          <section>
            <div className="sec-head">
              <div><h2 className="h2">1099 contractors</h2><p className="sub">{missingW9 ? `${missingW9} without a W-9. You need one before you can file their 1099-NEC by Jan 31.` : 'Every contractor has a W-9 on file.'}</p></div>
            </div>
            <div className="rows">
              <div className="row head c-row"><span>Contractor</span><span className="right">Paid this year</span><span className="right">W-9</span></div>
              {data.contractors1099.map(c => (
                <div className="row c-row" key={c.name}>
                  <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Icon name="user" size={16} />{c.name}</span>
                  <span className="num right">{money(c.paid)}</span>
                  <span className="right">{c.w9 ? <span className="tag good"><Icon name="check-circle" size={13} />On file</span> : <span className="tag warn"><Icon name="alert" size={13} />Missing</span>}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ position: 'sticky', top: 24 }}>
          {sel && (
            <div className="ev-detail">
             <div className="ev-body" key={sel.id}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`tag ${STATUS[sel.status].tone}`}><Icon name={STATUS[sel.status].icon} size={13} />{STATUS[sel.status].label}</span>
                <span className="sub">{sel.authority}{sel.form ? ` · ${sel.form}` : ''}</span>
              </div>
              <h3>{sel.title}</h3>
              <div className="sub">{dateLong(sel.date)}</div>
              {sel.amount != null && <div className="amt-big"><Num value={sel.amount} k="tax-amt" duration={400} /></div>}
              <p style={{ color: 'var(--ink-2)', fontSize: 13 }}>{sel.description}</p>
             </div>
            </div>
          )}
          <div className="sec-head"><h2 className="h2">Coming up</h2></div>
          <div className="rows ev-list">
            {upcoming.slice(0, 7).map(e => {
              const d = toDate(e.date)
              return (
                <button key={e.id} className={`row${sel?.id === e.id ? ' sel' : ''}${hoverDate === e.date ? ' hl' : ''}`} onClick={() => setSelId(e.id)} onMouseEnter={() => setHoverDate(e.date)} onMouseLeave={() => setHoverDate(null)}>
                  <span className="ev-date">{d.toLocaleDateString('en-US', { month: 'short' })}<b>{d.getDate()}</b></span>
                  <span className="ellip"><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name={AUTH_ICON[e.authority]} size={14} /><span className="ellip" style={{ fontWeight: 540 }}>{e.title}</span></span><span className="sub">{e.authority}{e.form ? ` · ${e.form}` : ''}</span></span>
                  <span className="num" style={{ fontSize: 13 }}>{e.amount != null ? money(e.amount) : ''}</span>
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
