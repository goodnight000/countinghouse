import { useEffect, useMemo, useState } from 'react'
import { marked } from 'marked'
import type { BrainPage } from '../../shared/types'
import { Icon, ago, providerIcon, useApi } from './lib'
import type { Provider } from '../../shared/types'
import { Loading } from './App'

const TYPE_ICON: Record<string, string> = { vendor: 'store', account: 'bank', month: 'calendar', policy: 'shield', company: 'building', tax: 'receipt' }
const TYPE_LABEL: Record<string, string> = { vendor: 'Vendors', account: 'Accounts', month: 'Months', policy: 'Policies', company: 'Company', tax: 'Taxes' }
const ORDER = ['company', 'policy', 'tax', 'account', 'vendor', 'month']

const pageIcon = (p: BrainPage) => (p.type === 'account' && providerIcon[p.slug.split('/')[1] as Provider]) || TYPE_ICON[p.type] || 'file'

export default function Memory() {
  const list = useApi<BrainPage[]>('/api/brain')
  const { data, error } = list
  const [slug, setSlug] = useState<string | null>(null)
  const groups = useMemo(() => {
    const g = new Map<string, BrainPage[]>()
    for (const p of data ?? []) g.set(p.type, [...(g.get(p.type) ?? []), p])
    return [...g].sort((a, b) => (ORDER.indexOf(a[0]) + 99) % 99 - (ORDER.indexOf(b[0]) + 99) % 99)
  }, [data])
  const cur = slug ?? groups[0]?.[1][0]?.slug ?? null
  const page = useApi<{ slug: string; markdown: string }>(cur ? `/api/brain/page?slug=${encodeURIComponent(cur)}` : null)
  const reloadList = list.reload, reloadPage = page.reload
  // The agent writes pages while you watch; pick them up.
  useEffect(() => { const t = setInterval(() => { reloadList(); reloadPage() }, 10000); return () => clearInterval(t) }, [reloadList, reloadPage])
  const meta = data?.find(p => p.slug === cur)
  const html = useMemo(() => (page.data && page.data.slug === cur ? (marked.parse(page.data.markdown.replace(/^---\n[\s\S]*?\n---\n/, '')) as string) : ''), [page.data, cur])

  if (!data) return <Loading error={error} what="memory" />
  return (
    <div className="fade-in">
      <header className="page-head">
        <div>
          <h1>Memory</h1>
          <p>{data.length} pages the agent keeps about your company, vendors, and books. It reads these before it answers.</p>
        </div>
      </header>
      <div className="mem">
        <nav className="mem-list">
          {groups.map(([type, pages]) => (
            <div key={type}>
              <div className="mem-group"><span>{TYPE_LABEL[type] ?? type}</span><span className="num">{pages.length}</span></div>
              {pages.map(p => (
                <button key={p.slug} className={`mem-item${p.slug === cur ? ' on' : ''}`} onClick={() => setSlug(p.slug)}>
                  <Icon name={pageIcon(p)} size={15} />
                  <span className="mem-txt"><b>{p.title}</b><span>{p.excerpt.startsWith(p.title.split(' (')[0]) ? p.excerpt.slice(p.title.split(' (')[0].length).trim() : p.excerpt}</span></span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <article className="mem-doc">
          {meta && <div className="mem-meta"><span className="tag"><Icon name={TYPE_ICON[meta.type] ?? 'file'} size={13} />{meta.slug}</span><span>Updated {ago(meta.updatedAt).toLowerCase()}</span></div>}
          {html ? <div className="md fade-in" key={cur} dangerouslySetInnerHTML={{ __html: html }} /> : <Loading error={page.error} what="page" />}
        </article>
      </div>
    </div>
  )
}
