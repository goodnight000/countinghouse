import type { Category, Insight, Summary } from '../../shared/types'
import { InOutChart, RunwayChart, Sparkline } from './charts'
import { Icon, categoryIcon, compact, money, monthLong, pct, providerIcon } from './lib'
import { Loading } from './App'

function insightLink(i: Insight): { icon: string; href: string } {
  const byId: Record<string, { icon: string; href: string }> = {
    'aws-spike': { icon: 'cloud', href: '#/transactions?q=AWS' },
    duplicate: { icon: 'copy', href: '#/transactions?flag=duplicate' },
    'franchise-tax': { icon: 'building', href: '#/taxes' },
    'unused-saas': { icon: 'ban', href: '#/transactions?q=Salesforce' },
    receipts: { icon: 'receipt', href: '#/transactions?flag=missing_receipt' },
    unusual: { icon: 'alert', href: '#/transactions?flag=unusual' },
    mrr: { icon: 'trending-up', href: '#/transactions?category=Revenue' },
    w9: { icon: 'file', href: '#/taxes' },
    runway: { icon: 'hourglass', href: '#/overview' },
  }
  if (byId[i.id]) return byId[i.id]
  const t = (i.title + ' ' + i.body).toLowerCase()
  if (/delaware|franchise/.test(t)) return { icon: 'building', href: '#/taxes' }
  if (/duplicate/.test(t)) return { icon: 'copy', href: '#/transactions?flag=duplicate' }
  if (/receipt/.test(t)) return { icon: 'receipt', href: '#/transactions?flag=missing_receipt' }
  if (/1099|w-9|contractor/.test(t)) return { icon: 'file', href: '#/taxes' }
  if (/aws|cloud/.test(t)) return { icon: 'cloud', href: '#/transactions?q=AWS' }
  if (/unused|seat|salesforce|subscription/.test(t)) return { icon: 'ban', href: '#/transactions?q=Salesforce' }
  if (/runway|burn/.test(t)) return { icon: 'hourglass', href: '#/overview' }
  if (/mrr|revenue|stripe/.test(t)) return { icon: 'trending-up', href: '#/transactions?category=Revenue' }
  if (/tax|irs|deadline/.test(t)) return { icon: 'calendar', href: '#/taxes' }
  return { icon: i.severity === 'warn' ? 'alert' : i.severity === 'good' ? 'check-circle' : 'sparkles', href: '#/overview' }
}

export default function Overview({ s, error }: { s: Summary | null; error: string | null }) {
  if (!s) return <Loading error={error} what="your books" />
  const last = s.months[s.months.length - 1]
  const prev = s.months[s.months.length - 2]
  const in12 = s.months.reduce((a, m) => a + m.revenue, 0)
  const out12 = s.months.reduce((a, m) => a + m.expenses, 0)

  const totals = new Map<Category, number>()
  for (const m of s.months) for (const [c, v] of Object.entries(m.byCategory)) totals.set(c as Category, (totals.get(c as Category) ?? 0) + (v ?? 0))
  const cats = [...totals].filter(([c]) => c !== 'Revenue' && c !== 'Interest' && c !== 'Transfers').sort((a, b) => b[1] - a[1])
  const top = cats.slice(0, 8)
  const rest = cats.slice(8).reduce((a, [, v]) => a + v, 0)
  if (rest > 0) top.push(['Other', rest])
  const catMax = Math.max(...top.map(c => c[1]), 1)
  const catSum = cats.reduce((a, [, v]) => a + v, 0) || 1
  const biggest = s.cash.byAccount.slice().sort((a, b) => b.balance - a.balance)[0]
  const burnDelta = s.burn.avg3mo ? ((s.burn.lastMonth - s.burn.avg3mo) / s.burn.avg3mo) * 100 : 0

  return (
    <div className="fade-in">
      <header className="page-head">
        <div>
          <h1>{s.company.name}</h1>
          <p>{s.company.legalName} · {s.company.state} corporation since {s.company.incorporated.slice(0, 4)} · {s.company.employees} people</p>
        </div>
      </header>

      <section className="hero">
        <div className="kpi">
          <span className="kpi-label"><Icon name="bank" size={15} />Cash on hand</span>
          <span className="kpi-value">{money(s.cash.total)}</span>
          <span className="kpi-note">Across {s.cash.byAccount.length} accounts{biggest ? <> · most in <b>{biggest.name}</b></> : null}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon name="hourglass" size={15} />Runway</span>
          <span className="kpi-value">{s.runwayMonths.toFixed(1)}<small>months</small></span>
          <span className="kpi-note">Cash runs out in <b>{monthLong(s.zeroCashDate)}</b> at today's burn</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon name="flame" size={15} />Net burn</span>
          <span className="kpi-value">{money(s.burn.avg3mo)}<small>/mo</small></span>
          <span className="kpi-note">3-month average · last month <b>{money(s.burn.lastMonth)}</b> ({pct(burnDelta)})</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon name="trending-up" size={15} />MRR</span>
          <span className="kpi-value">{money(s.mrr)}</span>
          <span className="kpi-note"><b className={s.mrrGrowthPct >= 0 ? 'pos' : 'err'}>{pct(s.mrrGrowthPct, 1)}</b> month over month · {compact(s.mrr * 12)} ARR</span>
        </div>
      </section>

      <div className="ov">
        <div className="ov-main">
          <section>
            <div className="sec-head">
              <div>
                <h2 className="h2">Money in vs. money out</h2>
                <p className="sub">Last 12 months: {money(in12)} in, {money(out12)} out. {last && prev ? `${monthLong(last.month).split(' ')[0]} net ${last.net >= 0 ? '+' : '−'}${money(Math.abs(last.net))}.` : ''}</p>
              </div>
              <div className="legend"><span><i style={{ background: 'var(--in)' }} />Money in</span><span><i style={{ background: 'var(--out)' }} />Money out</span></div>
            </div>
            <InOutChart months={s.months} />
          </section>

          <div className="split">
            <section>
              <div className="sec-head">
                <div>
                  <h2 className="h2">Where the money goes</h2>
                  <p className="sub">{top[0] ? `${top[0][0]} is ${Math.round((top[0][1] / catSum) * 100)}% of spend.` : ''}</p>
                </div>
              </div>
              {top.map(([c, v]) => (
                <div className="cat" key={c} title={`${c}: ${money(v)} over 12 months`}>
                  <Icon name={categoryIcon[c] ?? 'tag'} size={15} />
                  <span className="ellip">{c}</span>
                  <div><div className="bar" style={{ width: `${(v / catMax) * 100}%` }} /></div>
                  <span className="num right">{compact(v)}</span>
                </div>
              ))}
              <div className="sec-head" style={{ marginTop: 40 }}>
                <div>
                  <h2 className="h2">Cash by account</h2>
                  <p className="sub">Where the {compact(s.cash.total)} sits today.</p>
                </div>
              </div>
              <div className="rows">
                {s.cash.byAccount.map(a => (
                  <div className="row acct-row" key={a.name}>
                    <span className="int-ic sm"><Icon name={providerIcon[a.provider]} size={15} /></span>
                    <span className="ellip">{a.name}</span>
                    <span className="num right">{money(a.balance)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="sec-head">
                <div>
                  <h2 className="h2">Top vendors</h2>
                  <p className="sub">Change is last month vs. the 3-month average.</p>
                </div>
              </div>
              <div className="rows">
                {s.topVendors.slice(0, 8).map(v => (
                  <a className="row vendor-row click" key={v.vendor} href={`#/transactions?q=${encodeURIComponent(v.vendor)}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <div className="vname"><b className="ellip">{v.vendor}</b><span className="ellip">{v.category}</span></div>
                    <Sparkline data={v.sparkline} color={v.changePct > 15 ? 'var(--out)' : 'var(--ink-3)'} />
                    <span className="num right">{compact(v.lastMonth)}</span>
                    <span className={`chg right ${v.changePct > 5 ? 'up' : v.changePct < -5 ? 'down' : 'muted'}`}>{pct(v.changePct)}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>

          <section>
            <div className="sec-head">
              <div>
                <h2 className="h2">Cash runway</h2>
                <p className="sub">At {money(s.burn.avg3mo)}/mo net burn, the balance reaches zero in {monthLong(s.zeroCashDate)}. Every $10k/mo cut buys about {(s.cash.total / Math.max(s.burn.avg3mo - 10000, 1) - s.runwayMonths).toFixed(1)} months.</p>
              </div>
              <div className="legend"><span><i style={{ background: 'var(--in)' }} />Actual</span><span><i style={{ background: 'repeating-linear-gradient(90deg, var(--in) 0 3px, transparent 3px 5px)' }} />Projected</span></div>
            </div>
            <RunwayChart cash={s.cash.total} months={s.months} burn={s.burn.avg3mo} zeroDate={s.zeroCashDate} />
          </section>
        </div>

        <aside className="side-rail">
          <div className="sec-head"><h2 className="h2">What needs you</h2><span className="sub num">{s.insights.length}</span></div>
          <div className="insights">
            {s.insights.map(i => {
              const l = insightLink(i)
              return (
                <a key={i.id} href={l.href} className={`insight ${i.severity}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <span className="ins-ic"><Icon name={l.icon} size={16} /></span>
                  <div>
                    <h3>{i.title}</h3>
                    <p>{i.body}</p>
                    {i.metric && <div className="metric">{i.metric}</div>}
                  </div>
                </a>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
