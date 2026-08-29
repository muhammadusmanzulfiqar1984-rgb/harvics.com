'use client'
/** Module #59 — Social Feed (SAP+ workspace) Tabs: Feed · Compose · Engagement */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'
type Tab = 'feed' | 'compose' | 'engagement'
function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}
const ME = { userId: 'os-user', name: 'OS User' }
export default function UniverseModuleFiftyNine() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('feed')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [body, setBody] = useState('')
  const [comment, setComment] = useState<Record<string, string>>({})
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setPosts((await api('/api/wave6/feed')).data || []) } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const post = async () => {
    try {
      setError(''); setMessage('')
      if (!body.trim()) throw new Error('Body required')
      await api('/api/wave6/feed', { method: 'POST', body: JSON.stringify({ authorId: ME.userId, authorName: ME.name, body }) })
      setBody(''); setMessage('Posted'); await load(); setTab('feed')
    } catch (e: any) { setError(e.message) }
  }
  const like = async (id: string) => { try { await api(`/api/wave6/feed/${id}/like`, { method: 'POST', body: JSON.stringify({ userId: ME.userId }) }); await load() } catch (e: any) { setError(e.message) } }
  const doComment = async (id: string) => {
    const c = comment[id]; if (!c?.trim()) return
    try { await api(`/api/wave6/feed/${id}/comment`, { method: 'POST', body: JSON.stringify({ authorId: ME.userId, authorName: ME.name, body: c }) }); setComment({ ...comment, [id]: '' }); await load() } catch (e: any) { setError(e.message) }
  }
  const likes = posts.reduce((s, p) => s + (p.likeCount || 0), 0)
  const comments = posts.reduce((s, p) => s + (p.commentCount || 0), 0)
  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #59 · Universe</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >Social Feed</h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ posts · likes · comments · audited creates.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Refresh</button>
      </div>
      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Feed engagement AI"
        subtitle="Suggests content actions from recent social feed activity"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'feed', prompt: 'Advise on social feed engagement priorities.' }}
        cta="Advise feed"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: 'Posts', value: posts.length }, { label: 'Likes', value: likes }, { label: 'Comments', value: comments }, { label: 'Authors', value: new Set(posts.map((p) => p.authorId)).size }].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {([['feed','Feed'],['compose','Compose'],['engagement','Engagement']] as const).map(([id,label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${tab===id?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy/25'}`}>{label}</button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
      {!loading && tab === 'compose' ? (
        <div className="max-w-xl space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Compose</p>
          <textarea className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share an update…" />
          <button type="button" onClick={() => void post()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">Post</button>
        </div>
      ) : null}
      {!loading && (tab === 'feed' || tab === 'engagement') ? (
        <div className="mx-auto max-w-2xl space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="border border-harvics-burgundy/15 bg-white p-4" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">{p.authorName}</div>
                  <div className="text-[10px] text-harvics-burgundy/50">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <Link href={`/${locale}/os/feed/${p.id}`} className="text-[10px] font-bold uppercase underline">Open</Link>
              </div>
              <p className="mt-3 text-sm">{p.body}</p>
              {tab === 'feed' ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-harvics-burgundy/10 pt-3">
                  <button type="button" onClick={() => void like(p.id)} className="border border-harvics-burgundy px-3 py-1 text-[10px] font-bold uppercase">♥ {p.likeCount} Like</button>
                  <span className="text-[11px] text-harvics-burgundy/60">{p.commentCount} comments</span>
                  <input className="min-w-[160px] flex-1 border border-harvics-burgundy/20 px-2 py-1 text-sm" placeholder="Comment…" value={comment[p.id] || ''} onChange={(e) => setComment({ ...comment, [p.id]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && void doComment(p.id)} />
                  <button type="button" onClick={() => void doComment(p.id)} className="bg-harvics-burgundy px-3 py-1 text-[10px] font-bold uppercase text-harvics-cream">Send</button>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-harvics-burgundy/60">{p.likeCount} likes · {p.commentCount} comments · {p.visibility}</div>
              )}
            </div>
          ))}
          {posts.length === 0 ? <p className="py-8 text-center text-sm text-harvics-burgundy/50">No posts yet.</p> : null}
        </div>
      ) : null}
    </div>
  )
}
