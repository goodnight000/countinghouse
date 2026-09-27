import { useState } from 'react'
import type { TaxEvent, TaxOverview } from '../../shared/types'
import { Icon, dateLong, money, toDate, useApi } from './lib'
import { Loading } from './App'

const STATUS: Record<TaxEvent['status'], { label: string; tone: string; icon: string }> = {
  done: { label: 'Done', tone: 'good', icon: 'check-circle' },
  upcoming: { label: 'Upcoming', tone: '', icon: 'calendar' },
  due_soon: { label: 'Due soon', tone: 'warn', icon: 'timer' },
  overdue: { label: 'Overdue', tone: 'bad', icon: 'alert' },
}
const AUTH_ICON: Record<TaxEvent['authority'], string> = { IRS: 'building', Delaware: 'building', California: 'sun', Payroll: 'people', Other: 'file' }
const fmtN = (n: number) => n.toLocaleString('en-US')

function Month({ y, m, byDay, sel, onPick }: { y: number; m: number; byDay: Map<string, TaxEvent[]>; sel?: string; onPick: (e: TaxEvent) => void }) {
  const first = new Date(y, m, 1)
  const days = new Date(y, m + 1, 0).getDate()
  const t = new Date(), todayKey = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  const cells: (number | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  return (
    <div className="mon">
      <h4>{first.toLocaleDateString('en-US', { month: 'long' })} <span>{y}</span></h4>
      <div className="days">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="dow">{d}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const evs = byDay.get(key)
          if (!evs) return <span key={i} className={`day${key === todayKey ? ' today' : ''}`}>{d}</span>
          const worst = evs.find(e => e.status === 'overdue') ?? evs.find(e => e.status === 'due_soon') ?? evs[0]
          return (
            <button key={i} className={`day ev ${worst.status}${evs.some(e => e.id === sel) ? ' on' : ''}`} title={evs.map(e => e.title).join('\n')} onClick={() => onPick(evs[0])}>{d}</button>
          )
        })}
      </div>
    </div>
  )
}

export default function Taxes() {
  const { data, error } = useApi<TaxOverview>('/api/taxes')
  const [selId, setSelId] = useState<string | null>(null)
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
          <div className="rv-num strike">{money(ft.authorizedSharesMethod)}</div>
          <p className="rv-math">Authorized shares method: <b>{fmtN(ft.authorizedShares)}</b> authorized shares, taxed on the count alone.</p>
        </div>
        <div>
          <span className="rv-label"><Icon name="calculator" size={15} />What you actually owe</span>
          <div className="rv-num">{money(ft.assumedParValueMethod)}</div>
          <p className="rv-math">Assumed par value method: <b>{fmtN(ft.issuedShares)}</b> issued shares against <b>{money(ft.grossAssets)}</b> gross assets.</p>
        </div>
        <div>
          <span className="rv-label"><Icon name="gem" size={15} />You keep</span>
          <div className="rv-num save">{money(ft.savings)}</div>
          <p className="rv-math">{pctOff}% less, by filing with the assumed par value method before {delaware ? dateLong(delaware.date) : 'March 1'}.</p>
          {delaware && <button className="btn" style={{ marginTop: 12 }} onClick={() => setSelId(delaware.id)}><Icon name="calendar" size={15} />Show the deadline</button>}
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
              </div>
            </div>
            <div className="cal">
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
                return <Month key={i} y={d.getFullYear()} m={d.getMonth()} byDay={byDay} sel={sel?.id} onPick={e => setSelId(e.id)} />
              })}
            </div>
          </section>

          <section>
            <div className="sec-head">
              <div><h2 className="h2">Estimated taxes this year</h2><p className="sub">What to set aside, so April is not a surprise.</p></div>
            </div>
            <div className="est">
              <div><span className="kpi-label"><Icon name="building" size={15} />Federal income tax</span><span className="kpi-value">{money(est.federal)}</span><span className="kpi-note">{est.federal === 0 ? 'Operating at a loss, so nothing is owed on income yet.' : 'Pay in quarterly estimates to avoid penalties.'}</span></div>
              <div><span className="kpi-label"><Icon name="sun" size={15} />State</span><span className="kpi-value">{money(est.state)}</span><span className="kpi-note">{est.state === 800 ? 'California’s $800 minimum franchise tax.' : 'State income and franchise taxes.'}</span></div>
              <div><span className="kpi-label"><Icon name="people" size={15} />Payroll taxes</span><span className="kpi-value">{money(est.payroll)}</span><span className="kpi-note">Employer share, withheld and filed through Gusto.</span></div>
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
            <div className="ev-detail" key={sel.id}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`tag ${STATUS[sel.status].tone}`}><Icon name={STATUS[sel.status].icon} size={13} />{STATUS[sel.status].label}</span>
                <span className="sub">{sel.authority}{sel.form ? ` · ${sel.form}` : ''}</span>
              </div>
              <h3>{sel.title}</h3>
              <div className="sub">{dateLong(sel.date)}</div>
              {sel.amount != null && <div className="amt-big">{money(sel.amount)}</div>}
              <p style={{ color: 'var(--ink-2)', fontSize: 13 }}>{sel.description}</p>
            </div>
          )}
          <div className="sec-head"><h2 className="h2">Coming up</h2></div>
          <div className="rows ev-list">
            {upcoming.slice(0, 7).map(e => {
              const d = toDate(e.date)
              return (
                <button key={e.id} className={`row${sel?.id === e.id ? ' sel' : ''}`} onClick={() => setSelId(e.id)}>
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
