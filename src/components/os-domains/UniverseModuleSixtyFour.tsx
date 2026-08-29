'use client'
/** Module #64 — Job Board (SAP+) Tabs: Board · Publish · Apply */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'
type Tab = 'board' | 'publish' | 'apply'
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
export default function UniverseModuleSixtyFour() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('board')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [board, setBoard] = useState<any[]>([])
  const [postings, setPostings] = useState<any[]>([])
  const [publishId, setPublishId] = useState('')
  const [apply, setApply] = useState<Record<string, { name: string; email: string }>>({})
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      setBoard((await api('/api/wave6/job-board')).data || [])
      try { setPostings((await api('/api/wave5/postings?status=Open')).data || []) } catch { setPostings([]) }
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const publish = async () => {
    try {
      setError(''); setMessage('')
      if (!publishId) throw new Error('Pick a posting')
      await api('/api/wave6/job-board/publish', { method: 'POST', body: JSON.stringify({ postingId: publishId }) })
      setPublishId(''); setMessage('Published to public board'); await load(); setTab('board')
    } catch (e: any) { setError(e.message) }
  }
  const doApply = async (id: string) => {
    try {
      setError(''); setMessage('')
      const a = apply[id]; if (!a?.name) throw new Error('Name required')
      await api(`/api/wave6/job-board/${id}/apply`, { method: 'POST', body: JSON.stringify(a) })
      setApply({ ...apply, [id]: { name: '', email: '' } }); setMessage('Application submitted'); await load()
    } catch (e: any) { setError(e.message) }
  }
  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #64 · Universe</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >Public Job Board</h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ public board on Wave5 talent · publish · apply audited.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Refresh</button>
      </div>
      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Job board AI"
        subtitle="Surfaces stale public postings and apply funnel risk"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'job-board', prompt: 'Advise on public job-board posting quality and apply funnel.' }}
        cta="Advise job board"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: 'Published', value: board.length }, { label: 'Open source', value: postings.length }, { label: 'Views', value: board.reduce((s, b) => s + (b.views || 0), 0) }, { label: 'Applies', value: board.reduce((s, b) => s + (b.applies || 0), 0) }].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {([['board','Board'],['publish','Publish'],['apply','Apply']] as const).map(([id,label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${tab===id?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy/25'}`}>{label}</button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
      {!loading && tab === 'publish' ? (
        <div className="max-w-lg space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Publish open posting</p>
          <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={publishId} onChange={(e) => setPublishId(e.target.value)}>
            <option value="">— pick —</option>
            {postings.map((p) => <option key={p.id} value={p.id}>{p.reqNo} — {p.title}</option>)}
          </select>
          <button type="button" onClick={() => void publish()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">Publish</button>
          {postings.length === 0 ? <p className="text-[11px] text-harvics-burgundy/60">No open Wave5 postings available (or API offline).</p> : null}
        </div>
      ) : null}
      {!loading && tab !== 'publish' ? (
        <div className="space-y-3">
          {board.map((b) => {
            const a = apply[b.id] || { name: '', email: '' }
            return (
              <div key={b.id} className="border border-harvics-burgundy/15 bg-white p-4" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                <div className="flex justify-between gap-2">
                  <Link href={`/${locale}/os/job-board/${b.id}`} className="font-semibold underline">{b.posting?.title || b.id}</Link>
                  <span className="text-[11px] text-harvics-burgundy/60">👁 {b.views} · 📝 {b.applies}</span>
                </div>
                <div className="mt-1 text-[11px] text-harvics-burgundy/60">{b.posting?.department || '—'} · {b.posting?.location || '—'}</div>
                {tab === 'apply' ? (
                  <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input className="border border-harvics-burgundy/20 px-2 py-1 text-sm" placeholder="Name *" value={a.name} onChange={(e) => setApply({ ...apply, [b.id]: { ...a, name: e.target.value } })} />
                    <input className="border border-harvics-burgundy/20 px-2 py-1 text-sm" placeholder="Email" value={a.email} onChange={(e) => setApply({ ...apply, [b.id]: { ...a, email: e.target.value } })} />
                    <button type="button" onClick={() => void doApply(b.id)} className="bg-harvics-burgundy px-3 py-1 text-[10px] font-bold uppercase text-harvics-cream">Apply</button>
                  </div>
                ) : null}
              </div>
            )
          })}
          {board.length === 0 ? <p className="py-8 text-center text-sm text-harvics-burgundy/50">No published roles yet.</p> : null}
        </div>
      ) : null}
    </div>
  )
}
