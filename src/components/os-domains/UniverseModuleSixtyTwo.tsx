'use client'
/** Module #62 — Events (SAP+) Tabs: Events · Schedule · Status */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'
type Tab = 'events' | 'schedule' | 'status'
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
export default function UniverseModuleSixtyTwo() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('events')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [reg, setReg] = useState<Record<string, { userId: string; userName: string }>>({})
  const [form, setForm] = useState({ slug: '', title: '', description: '', type: 'Webinar', startsAt: '', endsAt: '', capacity: 100, location: '', meetingUrl: '' })
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setRows((await api('/api/wave6/events')).data || []) } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const create = async () => {
    try {
      setError(''); setMessage('')
      if (!form.slug || !form.title || !form.startsAt || !form.endsAt) throw new Error('Slug + title + dates required')
      await api('/api/wave6/events', { method: 'POST', body: JSON.stringify(form) })
      setForm({ ...form, slug: '', title: '' }); setMessage('Event scheduled'); await load(); setTab('events')
    } catch (e: any) { setError(e.message) }
  }
  const register = async (id: string) => {
    try {
      setError(''); setMessage('')
      const r = reg[id]; if (!r?.userId || !r?.userName) throw new Error('User ID + name required')
      const x = await api(`/api/wave6/events/${id}/register`, { method: 'POST', body: JSON.stringify(r) })
      setMessage(`Registered · ${x.seatsLeft} seats left`); await load()
    } catch (e: any) { setError(e.message) }
  }
  const setStatus = async (id: string, status: string) => {
    try { setError(''); setMessage(''); await api(`/api/wave6/events/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }); setMessage(`Status → ${status}`); await load() } catch (e: any) { setError(e.message) }
  }
  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #62 · Universe</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >Events & Engagement</h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ events · Scheduled→Live→Completed/Cancelled · RSVP.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Refresh</button>
      </div>
      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Events AI"
        subtitle="Prioritises live vs planning events for ops attention"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'events', prompt: 'Advise on events pipeline and engagement risks.' }}
        cta="Advise events"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: 'Events', value: rows.length }, { label: 'Live', value: rows.filter((e) => e.status === 'Live').length }, { label: 'Scheduled', value: rows.filter((e) => e.status === 'Scheduled').length }, { label: 'Regs', value: rows.reduce((s, e) => s + (e._count?.registrations || 0), 0) }].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {([['events','Events'],['schedule','Schedule'],['status','Status']] as const).map(([id,label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${tab===id?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy/25'}`}>{label}</button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
      {!loading && tab === 'schedule' ? (
        <div className="max-w-lg space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Schedule event</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Slug *" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            <input type="datetime-local" className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          </div>
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">+ Schedule</button>
        </div>
      ) : null}
      {!loading && tab !== 'schedule' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead><tr className="bg-harvics-burgundy text-harvics-cream"><th className="p-2">Title</th><th className="p-2">Status</th><th className="p-2">When</th><th className="p-2">Reg</th><th className="p-2">Actions</th></tr></thead>
            <tbody>
              {rows.map((e) => {
                const r = reg[e.id] || { userId: '', userName: '' }
                return (
                  <tr key={e.id} className="border-b border-harvics-burgundy/10">
                    <td className="p-2"><Link href={`/${locale}/os/events/${e.id}`} className="font-semibold underline">{e.title}</Link></td>
                    <td className="p-2 font-semibold">{e.status}</td>
                    <td className="p-2 text-[11px]">{new Date(e.startsAt).toLocaleString()}</td>
                    <td className="p-2 font-mono">{e._count?.registrations || 0}/{e.capacity}</td>
                    <td className="p-2">
                      {tab === 'events' ? (
                        <div className="flex flex-wrap gap-1">
                          <input className="w-14 border px-1 text-[10px]" placeholder="uid" value={r.userId} onChange={(ev) => setReg({ ...reg, [e.id]: { ...r, userId: ev.target.value } })} />
                          <input className="w-16 border px-1 text-[10px]" placeholder="name" value={r.userName} onChange={(ev) => setReg({ ...reg, [e.id]: { ...r, userName: ev.target.value } })} />
                          <button type="button" onClick={() => void register(e.id)} className="border border-harvics-burgundy px-2 py-0.5 text-[10px] font-bold uppercase">RSVP</button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {['Scheduled','Live','Completed','Cancelled'].map((s) => (
                            <button key={s} type="button" onClick={() => void setStatus(e.id, s)} className={`px-2 py-0.5 text-[9px] font-bold uppercase ${e.status===s?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy/40'}`}>{s}</button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
