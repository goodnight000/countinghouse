import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { MonthStat } from '../../shared/types'
import { compact, firstPlay, money, monthLong, monthShort } from './lib'

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

// Draw-on-load once per session, decided when the chart first has a width. `wait` holds it until scrolled into view.
function useDraw(name: string, width: number, ref: React.RefObject<HTMLElement | null>, onView = false) {
  const [draw, setDraw] = useState<boolean | null>(null)
  const [seen, setSeen] = useState(!onView)
  useEffect(() => { if (width > 0 && draw === null) setDraw(firstPlay('chart-' + name)) }, [width, draw, name])
  useEffect(() => {
    if (!draw || seen || !ref.current) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.35 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [draw, seen, ref])
  return draw ? (seen ? 'draw' : 'draw wait') : undefined
}

// Always-mounted tooltip that glides between points; the first show after a leave fades in at the target.
export function Tip({ x, y, width, show, children }: { x: number; y: number; width: number; show: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const was = useRef(false), last = useRef<ReactNode>(null)
  const instant = show && !was.current
  useEffect(() => { was.current = show })
  if (show) last.current = children
  const w = ref.current?.offsetWidth ?? 0
  const cx = w ? Math.min(Math.max(x, w / 2 + 4), width - w / 2 - 4) : x
  return (
    <div ref={ref} className="tip" data-instant={instant ? '' : undefined} aria-hidden={!show}
      style={{ left: 0, top: 0, opacity: show ? 1 : 0, transform: `translate(${cx}px, ${y}px) translate(-50%, -100%)` }}>
      {last.current}
    </div>
  )
}

// Bar with 4px rounded data-end, square at the baseline.
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h)
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
}

function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(v || 1))
  return Math.ceil(v / p / 2) * 2 * p
}

export function InOutChart({ months, onPick }: { months: MonthStat[]; onPick?: (month: string) => void }) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const H = 232, top = 8, bottom = 28, left = 48
  const plotW = Math.max(0, width - left), plotH = H - top - bottom
  const max = niceMax(Math.max(...months.map(m => Math.max(m.revenue, m.expenses)), 1))
  const y = (v: number) => top + plotH - (v / max) * plotH
  const band = plotW / months.length
  const bw = Math.min(16, (band - 14) / 2)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * max)
  const hm = hover != null ? months[hover] : null
  const draw = useDraw('inout', width, ref)
  const hi = hover ?? 0, hmm = months[hi]
  const prevM = hi > 0 ? months[hi - 1] : null
  const chg = prevM && hmm && prevM.net !== 0 ? ((hmm.net - prevM.net) / Math.abs(prevM.net)) * 100 : null

  return (
    <div className="chart" ref={ref} onPointerLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={H} role="img" aria-label="Money in versus money out by month" className={draw}>
          {hover != null && <rect x={left + band * hover + 2} y={top} width={band - 4} height={plotH} rx="4" fill="var(--hover-a)" />}
          {ticks.map(t => (
            <g key={t}>
              <line x1={left} x2={width} y1={y(t)} y2={y(t)} stroke={t === 0 ? 'var(--line-2)' : 'var(--line)'} strokeDasharray={t === 0 ? undefined : '2 3'} />
              <text x={left - 10} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)" className="num">{compact(t)}</text>
            </g>
          ))}
          {months.map((m, i) => {
            const cx = left + band * i + band / 2
            const dim = hover != null && hover !== i
            return (
              <g key={m.month} opacity={dim ? 0.4 : 1} style={{ transition: 'opacity 120ms' }}>
                <path className="bar-in" style={{ animationDelay: `${300 + i * 35}ms` }} d={barPath(cx - bw - 1, y(m.revenue), bw, plotH + top - y(m.revenue))} fill="var(--in)" />
                <path className="bar-in" style={{ animationDelay: `${300 + i * 35}ms` }} d={barPath(cx + 1, y(m.expenses), bw, plotH + top - y(m.expenses))} fill="var(--out)" />
                <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill={hover === i ? 'var(--ink)' : 'var(--ink-3)'}>{monthShort(m.month)}</text>
                <rect x={left + band * i} y={0} width={band} height={H} fill="transparent" onPointerEnter={() => setHover(i)} onClick={() => onPick?.(months[i].month)} style={{ cursor: onPick ? 'pointer' : undefined }} />
              </g>
            )
          })}
        </svg>
      )}
      {hmm && (
        <Tip show={hm != null} width={width} x={left + band * hi + band / 2} y={Math.min(y(Math.max(hmm.revenue, hmm.expenses)), H - 130) - 8}>
          <div><b>{monthLong(hmm.month)}</b></div>
          <div className="t-row"><span>Money in</span><span>{money(hmm.revenue)}</span></div>
          <div className="t-row"><span>Money out</span><span>{money(hmm.expenses)}</span></div>
          <div className="t-row"><span>Net</span><b style={{ color: hmm.net >= 0 ? 'var(--good)' : 'var(--bad)' }}>{hmm.net >= 0 ? '+' : '−'}{money(Math.abs(hmm.net))}</b></div>
          {chg != null && <div className="t-row"><span>vs prior month</span><span>{chg > 0 ? '+' : chg < 0 ? '−' : ''}{Math.abs(chg).toFixed(0)}%</span></div>}
          {onPick && <div className="t-sub">Click to see transactions</div>}
        </Tip>
      )}
    </div>
  )
}

export function Sparkline({ data, w = 88, h = 24, color = 'var(--ink-2)', play, row = 0 }: { data: number[]; w?: number; h?: number; color?: string; play?: boolean; row?: number }) {
  if (!data.length) return null
  const max = Math.max(...data), min = Math.min(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => [(i / (data.length - 1 || 1)) * (w - 4) + 2, h - 3 - ((v - min) / span) * (h - 6)])
  const last = pts[pts.length - 1]
  return (
    <svg width={w} height={h} aria-hidden="true" className={play ? 'draw' : undefined} style={{ display: 'block', overflow: 'visible', '--d': `${200 + row * 40}ms` } as React.CSSProperties}>
      <polyline className="spk" pathLength="1" points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle className="spk-dot" cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  )
}

// Cash balance: history reconstructed from monthly net, then projected at avg burn until zero.
export function RunwayChart({ cash, months, burn, zeroDate }: { cash: number; months: MonthStat[]; burn: number; zeroDate: string }) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const hist: { m: string; v: number; proj: boolean }[] = []
  let bal = cash
  for (let i = months.length - 1; i >= 0; i--) { hist.unshift({ m: months[i].month, v: bal, proj: false }); bal -= months[i].net }
  const [yy, mm] = months[months.length - 1].month.split('-').map(Number)
  const proj: typeof hist = []
  for (let k = 1, v = cash; v > 0 && k < 48; k++) {
    v = Math.max(0, cash - burn * k)
    const d = new Date(yy, mm - 1 + k, 1)
    proj.push({ m: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, v, proj: true })
  }
  const pts = [...hist, ...proj]
  const H = 180, top = 12, bottom = 26, left = 48
  const plotW = Math.max(0, width - left), plotH = H - top - bottom
  const max = niceMax(Math.max(...pts.map(p => p.v), 1))
  const x = (i: number) => left + (i / (pts.length - 1)) * plotW
  const y = (v: number) => top + plotH - (v / max) * plotH
  const nowI = hist.length - 1
  const line = (a: number, b: number) => pts.slice(a, b + 1).map((p, j) => `${j ? 'L' : 'M'}${x(a + j)},${y(p.v)}`).join('')
  const area = `${line(0, nowI)}L${x(nowI)},${y(0)}L${x(0)},${y(0)}Z`
  const hp = hover != null ? pts[hover] : null
  const draw = useDraw('runway', width, ref, true)
  const hi = hover ?? nowI, hpp = pts[hi]
  const vsToday = hpp ? hpp.v - cash : 0
  return (
    <div className="chart" ref={ref} onPointerLeave={() => setHover(null)}
      onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.round(((e.clientX - r.left - left) / plotW) * (pts.length - 1)); setHover(i >= 0 && i < pts.length ? i : null) }}>
      {width > 0 && (
        <svg width={width} height={H} role="img" aria-label={`Cash balance, projected to reach zero in ${monthLong(zeroDate)}`} className={draw}>
          {[0, 0.5, 1].map(t => (
            <g key={t}>
              <line x1={left} x2={width} y1={y(t * max)} y2={y(t * max)} stroke={t === 0 ? 'var(--line-2)' : 'var(--line)'} strokeDasharray={t === 0 ? undefined : '2 3'} />
              <text x={left - 10} y={y(t * max) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)">{compact(t * max)}</text>
            </g>
          ))}
          <g className="rw-area"><path d={area} fill="var(--in)" style={{ opacity: "var(--area)" }} /></g>
          <path className="rw-hist" pathLength="1" d={line(0, nowI)} fill="none" stroke="var(--in)" strokeWidth="2" strokeLinejoin="round" />
          <g className="rw-proj"><path d={line(nowI, pts.length - 1)} fill="none" stroke="var(--in)" strokeWidth="2" strokeDasharray="4 4" /></g>
          <g className="rw-today">
            <line x1={x(nowI)} x2={x(nowI)} y1={top} y2={y(0)} stroke="var(--ink-4)" strokeDasharray="2 3" />
            <text x={x(nowI) + 6} y={top + 10} fontSize="11" fill="var(--ink-2)">Today</text>
            <circle cx={x(nowI)} cy={y(cash)} r="4" fill="var(--in)" stroke="var(--surface)" strokeWidth="2" />
          </g>
          <g className="rw-zero">
            <circle cx={x(pts.length - 1)} cy={y(0)} r="4" fill="var(--bad)" stroke="var(--surface)" strokeWidth="2" />
            <line x1={x(pts.length - 1)} x2={x(pts.length - 1)} y1={top} y2={y(0)} stroke="var(--bad)" strokeDasharray="2 3" opacity="0.6" />
            <text x={x(pts.length - 1) - 6} y={top + 10} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--bad)">{width < 560 ? `$0 · ${monthShort(zeroDate)} ’${zeroDate.slice(2, 4)}` : `Zero cash · ${monthLong(zeroDate)}`}</text>
          </g>
          {pts.map((p, i) => (i % (width < 560 ? 6 : 3) === 0 ? <text key={p.m} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{monthShort(p.m)}{p.m.endsWith('-01') ? ` ’${p.m.slice(2, 4)}` : ''}</text> : null))}
          <g transform={`translate(${x(hi)},0)`} style={{ transition: 'transform 80ms var(--ease-out)', opacity: hp ? 1 : 0 }}>
            <line x1={0} x2={0} y1={top} y2={y(0)} stroke="var(--ink-4)" strokeDasharray="2 3" />
            {hpp && <circle cx={0} cy={y(hpp.v)} r="4" fill="var(--surface)" stroke="var(--in)" strokeWidth="2" />}
          </g>
        </svg>
      )}
      {hpp && (
        <Tip show={hp != null} width={width} x={x(hi)} y={y(hpp.v) - 12}>
          <div><b>{monthLong(hpp.m)}</b>{hpp.proj ? ' · projected' : ''}</div>
          <div className="t-row"><span>Cash</span><b>{money(hpp.v)}</b></div>
          {hi !== nowI && <div className="t-row"><span>vs today</span><span>{vsToday >= 0 ? '+' : '−'}{money(Math.abs(vsToday))}</span></div>}
          {hpp.proj && <div className="t-sub">{(hpp.v / (burn || 1)).toFixed(1)} months of runway left</div>}
        </Tip>
      )}
    </div>
  )
}
