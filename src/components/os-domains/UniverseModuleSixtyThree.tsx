'use client'
/** Module #63 — Mentorship (SAP+) Tabs: Mentors · Sessions · Request */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'
type Tab = 'mentors' | 'sessions' | 'request'
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
export default function UniverseModuleSixtyThree() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('mentors')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [mentors, setMentors] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [form, setForm] = useState({ userId: '', name: '', bio: '', expertise: '', yearsExp: 0 })
  const [req, setReq] = useState({ mentorId: '', menteeId: '', topic: '', scheduledAt: '', durationMins: 30 })
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [m, s] = await Promise.all([api('/api/wave6/mentors'), api('/api/wave6/mentorship-sessions')])
      setMentors(m.data || []); setSessions(s.data || [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const create = async () => {
    try {
      setError(''); setMessage('')
      if (!form.userId || !form.name) throw new Error('User ID + name required')
      await api('/api/wave6/mentors', { method: 'POST', body: JSON.stringify(form) })
      setForm({ ...form, userId: '', name: '' }); setMessage('Mentor registered'); await load(); setTab('mentors')
    } catch (e: any) { setError(e.message) }
  }
  const request = async () => {
    try {
      setError(''); setMessage('')
      if (!req.mentorId || !req.menteeId || !req.topic || !req.scheduledAt) throw new Error('All fields required')
      await api(`/api/wave6/mentors/${req.mentorId}/request`, { method: 'POST', body: JSON.stringify({ menteeId: req.menteeId, topic: req.topic, scheduledAt: req.scheduledAt, durationMins: req.durationMins }) })
      setMessage('Session requested'); await load(); setTab('sessions')
    } catch (e: any) { setError(e.message) }
  }
  const setStatus = async (id: string, status: string) => {
    try { setError(''); setMessage(''); await api(`/api/wave6/mentorship-sessions/${id}/status`, { method: 'POST', body: JSON.stringify({ status, rating: status === 'Completed' ? 5 : undefined }) }); setMessage(`Session → ${status}`); await load() } catch (e: any) { setError(e.message) }
  }
  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #63 · Universe</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >Mentorship & Experts</h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ mentors · Requested→Confirmed→Completed · ratings.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Refresh</button>
      </div>
      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Mentorship AI"
        subtitle="Balances mentor load and open session requests"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'mentorship', prompt: 'Advise on mentorship capacity and open session triage.' }}
        cta="Advise mentorship"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: 'Mentors', value: mentors.length }, { label: 'Sessions', value: sessions.length }, { label: 'Open', value: sessions.filter((s) => s.status === 'Requested' || s.status === 'Confirmed').length }, { label: 'Done', value: sessions.filter((s) => s.status === 'Completed').length }].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {([['mentors','Mentors'],['sessions','Sessions'],['request','Request / Register']] as const).map(([id,label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${tab===id?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy/25'}`}>{label}</button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
      {!loading && tab === 'mentors' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {mentors.map((m) => (
            <div key={m.id} className="border border-harvics-burgundy/15 bg-white p-4" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
              <div className="flex justify-between"><Link href={`/${locale}/os/mentorship/${m.id}`} className="font-semibold underline">{m.name}</Link><span className="text-[11px]">★ {m.rating}</span></div>
              <div className="mt-1 text-[11px] text-harvics-burgundy/60">{m.expertise || '—'} · {m.yearsExp}y</div>
              <p className="mt-2 text-[12px]">{m.bio || ''}</p>
            </div>
          ))}
        </div>
      ) : null}
      {!loading && tab === 'sessions' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead><tr className="bg-harvics-burgundy text-harvics-cream"><th className="p-2">Mentor</th><th className="p-2">Topic</th><th className="p-2">When</th><th className="p-2">Status</th><th className="p-2">Workflow</th></tr></thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2">{s.mentor?.name || s.mentorId}</td>
                  <td className="p-2">{s.topic}</td>
                  <td className="p-2 text-[11px]">{new Date(s.scheduledAt).toLocaleString()}</td>
                  <td className="p-2 font-semibold">{s.status}</td>
                  <td className="p-2 space-x-1">
                    {['Confirmed','Completed','Cancelled'].map((st) => (
                      <button key={st} type="button" onClick={() => void setStatus(s.id, st)} className="border border-harvics-burgundy px-2 py-0.5 text-[9px] font-bold uppercase">{st}</button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {!loading && tab === 'request' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Register mentor</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="User ID *" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Expertise" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
            <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">+ Register</button>
          </div>
          <div className="space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Request session</p>
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={req.mentorId} onChange={(e) => setReq({ ...req, mentorId: e.target.value })}>
              <option value="">— mentor —</option>
              {mentors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Mentee ID *" value={req.menteeId} onChange={(e) => setReq({ ...req, menteeId: e.target.value })} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Topic *" value={req.topic} onChange={(e) => setReq({ ...req, topic: e.target.value })} />
            <input type="datetime-local" className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={req.scheduledAt} onChange={(e) => setReq({ ...req, scheduledAt: e.target.value })} />
            <button type="button" onClick={() => void request()} className="bg-harvics-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy">Request</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
