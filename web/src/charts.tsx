import { useLayoutEffect, useRef, useState } from 'react'
import type { MonthStat } from '../../shared/types'
import { compact, money, monthLong, monthShort } from './lib'

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

// Bar with 4px rounded data-end, square at the baseline.
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h)
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
}

function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(v || 1))
  return Math.ceil(v / p / 2) * 2 * p
}

export function InOutChart({ months }: { months: MonthStat[] }) {
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

  return (
    <div className="chart" ref={ref} onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={H} role="img" aria-label="Money in versus money out by month">
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
                <path d={barPath(cx - bw - 1, y(m.revenue), bw, plotH + top - y(m.revenue))} fill="var(--in)" />
                <path d={barPath(cx + 1, y(m.expenses), bw, plotH + top - y(m.expenses))} fill="var(--out)" />
                <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill={hover === i ? 'var(--ink)' : 'var(--ink-3)'}>{monthShort(m.month)}</text>
                <rect x={left + band * i} y={0} width={band} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
              </g>
            )
          })}
        </svg>
      )}
      {hm && hover != null && (
        <div className="tip" style={{ left: Math.min(Math.max(left + band * hover + band / 2, 90), width - 90), top: Math.min(y(Math.max(hm.revenue, hm.expenses)), H - 110) - 8 }}>
          <div><b>{monthLong(hm.month)}</b></div>
          <div className="t-row"><span>Money in</span><span>{money(hm.revenue)}</span></div>
          <div className="t-row"><span>Money out</span><span>{money(hm.expenses)}</span></div>
          <div className="t-row"><span>Net</span><b>{hm.net >= 0 ? '+' : '−'}{money(Math.abs(hm.net))}</b></div>
        </div>
      )}
    </div>
  )
}

export function Sparkline({ data, w = 88, h = 24, color = 'var(--ink-2)' }: { data: number[]; w?: number; h?: number; color?: string }) {
  if (!data.length) return null
  const max = Math.max(...data), min = Math.min(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => [(i / (data.length - 1 || 1)) * (w - 4) + 2, h - 3 - ((v - min) / span) * (h - 6)])
  const last = pts[pts.length - 1]
  return (
    <svg width={w} height={h} aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
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
  return (
    <div className="chart" ref={ref} onMouseLeave={() => setHover(null)}
      onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.round(((e.clientX - r.left - left) / plotW) * (pts.length - 1)); setHover(i >= 0 && i < pts.length ? i : null) }}>
      {width > 0 && (
        <svg width={width} height={H} role="img" aria-label={`Cash balance, projected to reach zero in ${monthLong(zeroDate)}`}>
          {[0, 0.5, 1].map(t => (
            <g key={t}>
              <line x1={left} x2={width} y1={y(t * max)} y2={y(t * max)} stroke={t === 0 ? 'var(--line-2)' : 'var(--line)'} strokeDasharray={t === 0 ? undefined : '2 3'} />
              <text x={left - 10} y={y(t * max) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)">{compact(t * max)}</text>
            </g>
          ))}
          <path d={area} fill="var(--in)" opacity="0.1" />
          <path d={line(0, nowI)} fill="none" stroke="var(--in)" strokeWidth="2" strokeLinejoin="round" />
          <path d={line(nowI, pts.length - 1)} fill="none" stroke="var(--in)" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={x(nowI)} x2={x(nowI)} y1={top} y2={y(0)} stroke="var(--ink-4)" strokeDasharray="2 3" />
          <text x={x(nowI) + 6} y={top + 10} fontSize="11" fill="var(--ink-2)">Today</text>
          <circle cx={x(nowI)} cy={y(cash)} r="4" fill="var(--in)" stroke="var(--surface)" strokeWidth="2" />
          <circle cx={x(pts.length - 1)} cy={y(0)} r="4" fill="var(--bad)" stroke="var(--surface)" strokeWidth="2" />
          <line x1={x(pts.length - 1)} x2={x(pts.length - 1)} y1={top} y2={y(0)} stroke="var(--bad)" strokeDasharray="2 3" opacity="0.6" />
          <text x={x(pts.length - 1) - 6} y={top + 10} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--bad)">Zero cash · {monthLong(zeroDate)}</text>
          {pts.map((p, i) => (i % 3 === 0 ? <text key={p.m} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{monthShort(p.m)}{p.m.endsWith('-01') ? ` ’${p.m.slice(2, 4)}` : ''}</text> : null))}
          {hp && hover != null && <circle cx={x(hover)} cy={y(hp.v)} r="4" fill="var(--surface)" stroke="var(--in)" strokeWidth="2" />}
        </svg>
      )}
      {hp && hover != null && (
        <div className="tip" style={{ left: Math.min(Math.max(x(hover), 80), width - 80), top: y(hp.v) - 12 }}>
          <div><b>{monthLong(hp.m)}</b>{hp.proj ? ' · projected' : ''}</div>
          <div className="t-row"><span>Cash</span><b>{money(hp.v)}</b></div>
        </div>
      )}
    </div>
  )
}
