import type { Advice, Category, Insight, Summary, Txn } from '../../shared/types'
import { InOutChart, RunwayChart, Sparkline, Tip } from './charts'
import { Icon, Num, useApi, categoryIcon, compact, dateShort, firstPlay, money, monthLong, pct, providerIcon, reducedMotion } from './lib'
import { AdviceRow, useAdvice } from './Advisor'
import { useState } from 'react'
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
    runway: { icon: 'hourglass', href: '#runway' },
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

const scrollRunway = (e: React.MouseEvent) => {
  e.preventDefault()
  document.getElementById('runway')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
}
const WASTE = new Set(['aws-spike', 'unused-saas', 'duplicate'])

function Brief({ s, a }: { s: Summary; a: Advice | null }) {
  const [play] = useState(() => firstPlay('brief'))
  const confirmed = useApi<Txn[]>('/api/transactions?q=Brightline').data?.find(t => t.note?.startsWith('Learned rule'))
  const ms = s.months, last = ms[11], prev = ms[10], jun = ms[8]
  if (!last || !prev || !jun) return null
  const burnGrowth = (s.burn.lastMonth / -jun.net - 1) * 100
  const ge = (last.expenses / jun.expenses) ** (1 / 3) - 1, gr = (last.revenue / jun.revenue) ** (1 / 3) - 1
  const interest = last.net + last.expenses - last.revenue
  let cash = s.cash.total, e = last.expenses, r = last.revenue, n = 0
  while (cash > 0 && n < 60) { e *= 1 + ge; r *= 1 + gr; cash -= e - r - interest; n++ }
  const asOf = new Date(s.asOf + 'T12:00:00'); asOf.setMonth(asOf.getMonth() + n)
  const trendOut = n >= 60 ? null : asOf.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const denom = (last.revenue - jun.revenue) * 12
  const bm = denom > 0 ? (-ms[9].net - prev.net - last.net) / denom : null
  const mom = last.expenses - prev.expenses
  const deltas = Object.keys({ ...last.byCategory, ...prev.byCategory })
    .filter(c => c !== 'Revenue' && c !== 'Interest' && c !== 'Transfers')
    .map(c => [c, (last.byCategory[c as Category] ?? 0) - (prev.byCategory[c as Category] ?? 0)] as const)
    .sort((x, y) => y[1] - x[1]).slice(0, 2).filter(d => d[1] > 0)
  const lastName = monthLong(last.month).split(' ')[0], prevName = monthLong(prev.month).split(' ')[0]
  const over = s.plan ? s.burn.lastMonth - s.plan.netBurn : 0

  const ins = new Map(s.insights.map(i => [i.id, i]))
  const aws = s.topVendors.find(v => v.vendor === 'AWS')?.lastMonth ?? 0
  const sf = Number(/\$([\d,]+)\/mo/.exec(ins.get('unused-saas')?.title ?? '')?.[1]?.replace(/,/g, '') ?? 0)
  const openRecs = a ? a.recommendations.filter(x => x.status === 'open').length : 0
  const rows: { title: string; why: string; impact: React.ReactNode; href: string; onClick?: (e: React.MouseEvent) => void }[] = []
  if (ins.has('runway')) rows.push({ title: 'Set the Series A kickoff date', why: `About 9 to 11 months of cash left and a raise takes 3 to 6 months. Start prep by December 2026, or hold burn at ${compact(s.burn.avg3mo)}.`, impact: `${s.runwayMonths.toFixed(1)} mo`, href: '#runway', onClick: scrollRunway })
  if (a) rows.push({ title: "Act on the advisor's cuts", why: `${openRecs} open recommendations, ${money(a.potential.monthlySavings)}/mo. Adds ${a.potential.runwayGained} months.`, impact: `+${a.potential.runwayGained} mo`, href: '#/advisor' })
  else if (ins.has('aws-spike') || ins.has('unused-saas')) rows.push({ title: `Cut ${compact(0.3 * aws + sf)}/mo of waste`, why: 'AWS spike, idle Salesforce seats, a duplicate charge.', impact: `${compact((0.3 * aws + sf) * 12)}/yr`, href: '#/transactions?q=AWS' })
  if (ins.has('w9')) rows.push({ title: "Get Priya Raman's W-9 this week", why: "Overdue since Sep 15. $36,400 paid this year. Without it you can't file her 1099-NEC (Jan 31) and may owe 24% backup withholding.", impact: <span style={{ color: 'var(--warn)' }}>Overdue</span>, href: '#/taxes' })
  else if (ins.has('franchise-tax')) { const f = ins.get('franchise-tax')!; rows.push({ title: f.title, why: f.body, impact: f.metric ?? '', href: '#/taxes' }) }

  return (
    <section className={`brief${play ? ' play' : ''}`}>
      <p className="brief-p">
        <span className="brief-asof">As of {dateShort(s.asOf)}</span>
        You have <b>{compact(s.cash.total)}</b> in the bank and <b>{s.runwayMonths.toFixed(1)} months</b> of runway at the 3-month average burn, so cash runs out in <b>{monthLong(s.zeroCashDate)}</b>.{' '}
        That is the optimistic case: net burn is up <b>{Math.round(burnGrowth)}%</b> since {monthLong(jun.month).split(' ')[0]} ({compact(-jun.net)} to {compact(s.burn.lastMonth)}/mo)
        {s.plan && over > 0 ? <>, and {lastName} came in <b>{compact(over)} over</b> the {compact(s.plan.netBurn)} plan</> : null}
        {trendOut ? <>, and if spending keeps growing at this pace cash runs out around <b>{trendOut}</b>.</> : <>; on current growth you reach break-even before cash runs out.</>}{' '}
        Revenue is the strong part: MRR grew <b>{pct(s.mrrGrowthPct, 1).replace('+', '')}</b> to <b>{compact(s.mrr)}</b>
        {bm != null ? <>, and you spend <b>${bm.toFixed(2)}</b> of burn for each $1 of new ARR (burn multiple {bm.toFixed(1)}x). {bm < 2 ? 'That is efficient.' : bm < 3 ? 'That is fundable but not efficient.' : 'That is expensive growth.'}</> : '.'}{' '}
        {lastName} spend {mom >= 0 ? 'rose' : 'fell'} <b>{compact(Math.abs(mom))}</b> ({pct((mom / prev.expenses) * 100)}) over {prevName}
        {confirmed ? <>, mostly the <b>{money(-confirmed.amount)} {confirmed.vendor.split(' ')[0]} offsite</b> you confirmed</> : deltas.length ? <>, mostly {deltas.map(([c, v], i) => <span key={c}>{i ? ' and ' : ''}+{compact(v)} {c.toLowerCase()}</span>)}</> : null}.
      </p>
      <div className="decide">
        <h2>Decide this month</h2>
        {rows.map((r, i) => (
          <a key={r.title} className="dec" href={r.href} onClick={r.onClick} style={{ '--i': i } as React.CSSProperties}>
            <div><b>{r.title}</b><span className="why">{r.why}</span></div>
            <span className="num right">{r.impact}</span>
            <span className="arr"><Icon name="arrow-right" size={16} /></span>
          </a>
        ))}
      </div>
    </section>
  )
}

function AdviceStrip({ adv }: { adv: ReturnType<typeof useAdvice> }) {
  const a = adv.data
  const top = a ? a.recommendations.filter(r => r.status !== 'dismissed').slice().sort((x, y) => y.monthlySavings - x.monthlySavings).slice(0, 3) : []
  return (
    <section className="advice-strip">
      <div className="rows">
        <div className="as-head">
          <div style={{ minWidth: 0 }}>
            <b className="ellip">{a?.headline ?? 'Reading the ledger for savings…'}</b>
            <span className="sub">{a ? `${money(a.potential.monthlySavings)}/mo in savings found · runway ${a.baseline.runwayMonths} → ${a.potential.runwayMonths} months` : ' '}</span>
          </div>
          {a && <a href="#/advisor">All {a.recommendations.length} →</a>}
        </div>
        {top.map(r => <AdviceRow key={r.id} rec={r} onDecide={adv.decide} />)}
      </div>
    </section>
  )
}

export default function Overview({ s, error }: { s: Summary | null; error: string | null }) {
  const adv = useAdvice()
  const [catPlay] = useState(() => firstPlay('cats'))
  const [insPlay] = useState(() => firstPlay('list-insights'))
  const [venPlay] = useState(() => firstPlay('list-vendors'))
  const [catHov, setCatHov] = useState<{ i: number; x: number; y: number; w: number } | null>(null)
  const [catLast, setCatLast] = useState(0)
  if (!s) return <Loading error={error} what="your books" />
  const a = adv.data
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
  const ins = a ? s.insights.filter(i => !WASTE.has(i.id)) : s.insights
  const burnDelta = s.burn.avg3mo ? ((s.burn.lastMonth - s.burn.avg3mo) / s.burn.avg3mo) * 100 : 0

  return (
    <div className="fade-in">
      <header className="page-head">
        <div>
          <h1>{s.company.name}</h1>
          <p>{s.company.legalName} · {s.company.state} corporation since {s.company.incorporated.slice(0, 4)} · {s.company.employees} people</p>
        </div>
      </header>

      <Brief s={s} a={a} />

      <section className="hero">
        <div className="kpi">
          <span className="kpi-label"><Icon name="bank" size={15} />Cash on hand</span>
          <span className="kpi-value"><Num value={s.cash.total} k="ov-cash" /></span>
          <span className="kpi-note">Across {s.cash.byAccount.length} accounts{biggest ? <> · most in <b>{biggest.name}</b></> : null}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon name="hourglass" size={15} />Runway</span>
          <span className="kpi-value"><Num value={s.runwayMonths} fmt={n => n.toFixed(1)} k="ov-runway" delay={60} /><small>months</small></span>
          <span className="kpi-note">Cash runs out in <b>{monthLong(s.zeroCashDate)}</b> at today's burn{a && a.potential.runwayGained > 0 ? <span style={{ color: 'var(--good)' }}> · {a.potential.runwayMonths} with advisor</span> : null}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon name="flame" size={15} />Net burn</span>
          <span className="kpi-value"><Num value={s.burn.avg3mo} k="ov-burn" delay={120} /><small>/mo</small></span>
          <span className="kpi-note">3-month average · last month <b>{money(s.burn.lastMonth)}</b> ({pct(burnDelta)}){s.plan ? <> · Plan {compact(s.plan.netBurn)} · <b className={s.burn.lastMonth > s.plan.netBurn ? 'err' : 'pos'}>{compact(Math.abs(s.burn.lastMonth - s.plan.netBurn))} {s.burn.lastMonth > s.plan.netBurn ? 'over' : 'under'}</b></> : null}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon name="trending-up" size={15} />MRR</span>
          <span className="kpi-value"><Num value={s.mrr} k="ov-mrr" delay={180} /></span>
          <span className="kpi-note"><b className={s.mrrGrowthPct >= 0 ? 'pos' : 'err'}>{pct(s.mrrGrowthPct, 1)}</b> month over month · {compact(s.mrr * 12)} ARR</span>
        </div>
      </section>

      <AdviceStrip adv={adv} />

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
            <InOutChart months={s.months} onPick={m => { location.hash = '#/transactions?month=' + m }} />
          </section>

          <div className="split">
            <section>
              <div className="sec-head">
                <div>
                  <h2 className="h2">Where the money goes</h2>
                  <p className="sub">{top[0] ? `${top[0][0]} is ${Math.round((top[0][1] / catSum) * 100)}% of spend.` : ''}</p>
                </div>
              </div>
              <div className="cats" style={{ position: 'relative' }} onPointerLeave={() => setCatHov(null)}>
              {top.map(([c, v], i) => {
                const inner = <>
                  <Icon name={categoryIcon[c] ?? 'tag'} size={15} />
                  <span className="ellip">{c}</span>
                  <div><div className="bar" style={{ width: `${(v / catMax) * 100}%` }} /></div>
                  <span className="num right">{compact(v)}</span>
                </>
                const props = {
                  className: `cat${c === 'Other' ? '' : ' click'}${catPlay ? '' : ' noplay'}${catHov?.i === i ? ' hov' : ''}`, style: { '--i': i } as React.CSSProperties,
                  onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
                    const row = e.currentTarget, bar = row.querySelector('.bar') as HTMLElement, box = row.parentElement!.getBoundingClientRect(), br = bar.getBoundingClientRect()
                    setCatHov({ i, x: br.right - box.left, y: row.getBoundingClientRect().top - box.top, w: box.width }); setCatLast(i)
                  },
                }
                return c === 'Other' ? <div key={c} {...props}>{inner}</div> : <a key={c} {...props} href={'#/transactions?category=' + encodeURIComponent(c)}>{inner}</a>
              })}
              {top[catLast] && (
                <Tip show={catHov != null} width={catHov?.w ?? 400} x={catHov?.x ?? 0} y={(catHov?.y ?? 0) + 2}>
                  {money(top[catLast][1])} over 12 months · {Math.round((top[catLast][1] / catSum) * 100)}% of spend · {money(top[catLast][1] / 12)}/mo
                </Tip>
              )}
              </div>
              <div className="sec-head" style={{ marginTop: 40 }}>
                <div>
                  <h2 className="h2">Cash by account</h2>
                  <p className="sub">Where the {compact(s.cash.total)} sits today.</p>
                </div>
              </div>
              <div className="rows">
                {s.cash.byAccount.map(acct => (
                  <a className="row acct-row click" key={acct.name} href={`#/transactions?source=${acct.provider}`}>
                    <span className="int-ic sm"><Icon name={providerIcon[acct.provider]} size={15} /></span>
                    <span className="ellip">{acct.name}</span>
                    <span className="num right">{money(acct.balance)}</span>
                  </a>
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
              <div className={`rows${venPlay ? ' stagger' : ''}`}>
                {s.topVendors.slice(0, 8).map((v, vi) => (
                  <a className="row vendor-row click" key={v.vendor} href={`#/transactions?q=${encodeURIComponent(v.vendor)}`} style={{ color: 'inherit', textDecoration: 'none', '--i': vi } as React.CSSProperties}>
                    <div className="vname"><b className="ellip">{v.vendor}</b><span className="ellip">{v.category}</span></div>
                    <Sparkline data={v.sparkline} color={v.changePct > 15 ? 'var(--out)' : 'var(--ink-3)'} play={venPlay} row={vi} />
                    <span className="num right">{compact(v.lastMonth)}</span>
                    <span className={`chg right ${v.changePct > 5 ? 'up' : v.changePct < -5 ? 'down' : 'muted'}`}>{pct(v.changePct)}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>

          <section className="ov-runway" id="runway">
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
          <div className="sec-head"><h2 className="h2">What needs you</h2><span className="sub num">{ins.length}</span></div>
          <div className={`insights${insPlay ? ' stagger' : ''}`}>
            {ins.map((i, idx) => {
              const l = insightLink(i)
              return (
                <a key={i.id} href={l.href} onClick={i.id === 'runway' ? scrollRunway : undefined} className={`insight ${i.severity}`} style={{ color: 'inherit', textDecoration: 'none', '--i': idx } as React.CSSProperties}>
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
