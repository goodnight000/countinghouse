import { useCallback, useEffect, useRef, useState } from 'react'
import { icon } from './icons/icons.js'
import type { Category, Provider } from '../../shared/types'

export function Icon({ name, size = 18, label, className }: { name: string; size?: number; label?: string; className?: string }) {
  return <span className={'icw' + (className ? ' ' + className : '')} dangerouslySetInnerHTML={{ __html: icon(name, { size, label }) }} />
}

const cache = new Map<string, unknown>()

// Fetch JSON from the real API; retries every 2s until the server answers.
// Last response per path is cached so revisiting a screen renders instantly, then refreshes.
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(() => (path ? (cache.get(path) as T) ?? null : null))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!path) return
    let alive = true
    let timer: number | undefined
    const load = () =>
      fetch(path)
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${r.statusText}`))))
        .then(d => { cache.set(path, d); if (alive) { setData(d); setError(null) } })
        .catch(e => { if (alive) { setError(String(e.message ?? e)); timer = window.setTimeout(load, 2000) } })
    load()
    return () => { alive = false; clearTimeout(timer) }
  }, [path, tick])
  const reload = useCallback(() => setTick(t => t + 1), [])
  return { data, error, reload, setData }
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(path, body === undefined ? { method: 'POST' } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(`${r.status}`)
  return r.json()
}

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const money = (n: number) => usd0.format(n)
export const cents = (n: number) => usd2.format(n)
export const compact = (n: number) => {
  const a = Math.abs(n), s = n < 0 ? '−' : ''
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(a >= 1e5 ? 0 : 1)}k`
  return `${s}$${Math.round(a)}`
}
export const pct = (n: number, digits = 0) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(digits)}%`

const d = (s: string) => new Date(s.length === 7 ? s + '-01T12:00:00' : s.length === 10 ? s + 'T12:00:00' : s)
export const monthShort = (m: string) => d(m).toLocaleDateString('en-US', { month: 'short' })
export const monthLong = (m: string) => d(m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
export const dateShort = (s: string) => d(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const dateLong = (s: string) => d(s).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
export const toDate = d
export function ago(iso: string | null) {
  if (!iso) return 'Never'
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 45) return 'Just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} hr ago`
  return `${Math.round(s / 86400)} days ago`
}

export const providerIcon: Record<Provider, string> = {
  mercury: 'bank', brex: 'card', ramp: 'wallet', stripe: 'coin', gusto: 'people', aws: 'cloud', carta: 'pie-chart',
}
export const providerName: Record<Provider, string> = {
  mercury: 'Mercury', brex: 'Brex', ramp: 'Ramp', stripe: 'Stripe', gusto: 'Gusto', aws: 'AWS', carta: 'Carta',
}
export const categoryIcon: Record<Category, string> = {
  Revenue: 'trending-up', Interest: 'percent', Payroll: 'people', 'Payroll Taxes': 'calculator', Contractors: 'briefcase',
  'Cloud & Infra': 'server', 'AI & APIs': 'cpu', Software: 'layers', 'Rent & Office': 'building', 'Legal & Accounting': 'book',
  Marketing: 'megaphone', 'Travel & Meals': 'plane', Hardware: 'laptop', Insurance: 'shield', 'Taxes & Fees': 'receipt',
  'Bank Fees': 'bank', Transfers: 'repeat', Other: 'tag',
}
export const CATEGORIES = Object.keys(categoryIcon) as Category[]
export const PROVIDERS = Object.keys(providerIcon) as Provider[]

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const played = new Set<string>()
export const firstPlay = (k: string) => !played.has(k) && (played.add(k), true)

// Counts up once per session (key k), then ticks old -> new over 450ms. Ghost reserves the final width.
export function Num({ value, fmt = money, k, delay = 0, duration = 800 }: { value: number; fmt?: (n: number) => string; k: string; delay?: number; duration?: number }) {
  const first = useRef<boolean | null>(null)
  if (first.current === null) first.current = firstPlay(k) && !reducedMotion()
  const [shown, setShown] = useState(first.current ? 0 : value)
  const cur = useRef(shown)
  useEffect(() => {
    const from = cur.current
    if (from === value || reducedMotion()) { cur.current = value; setShown(value); return }
    const dur = first.current ? duration : 450
    const wait = first.current ? delay : 0
    first.current = false
    let raf = 0
    const t0 = performance.now() + wait
    const step = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / dur))
      const v = from + (value - from) * (1 - (1 - p) ** 5)
      cur.current = v; setShown(v)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return (
    <span className="cu">
      <span className="cu-ghost" aria-hidden>{fmt(value)}</span>
      <span className="cu-live" aria-hidden>{fmt(shown)}</span>
      <span className="sr-only">{fmt(value)}</span>
    </span>
  )
}
