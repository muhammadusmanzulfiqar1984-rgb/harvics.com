'use client'
/** Module #68 — Referrals (SAP+) Tabs: Pipeline · Invite · Paid */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'
type Tab = 'pipeline' | 'invite' | 'paid'
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
export default function UniverseModuleSixtyEight() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('pipeline')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({ referrerId: 'demo-me', referrerName: 'Demo Me', refereeEmail: '', refereeName: '', rewardAmount: 50, rewardCurrency: 'USD' })
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setRows((await api('/api/wave6/referrals')).data || []) } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const create = async () => {
    try {
      setError(''); setMessage('')
      if (!form.refereeEmail) throw new Error('Email required')
      await api('/api/wave6/referrals', { method: 'POST', body: JSON.stringify(form) })
      setForm({ ...form, refereeEmail: '', refereeName: '' }); setMessage('Referral sent'); await load(); setTab('pipeline')
    } catch (e: any) { setError(e.message) }
  }
  const setStatus = async (code: string, status: string) => {
    try { setError(''); setMessage(''); await api(`/api/wave6/referrals/${code}/status`, { method: 'POST', body: JSON.stringify({ status }) }); setMessage(`Status → ${status}`); await load() } catch (e: any) { setError(e.message) }
  }
  const paid = rows.filter((r) => r.status === 'Paid')
  const open = rows.filter((r) => r.status !== 'Paid' && r.status !== 'Expired')
  const view = tab === 'paid' ? paid : open
  const totalPaid = paid.reduce((s, r) => s + (r.rewardAmount || 0), 0)
  const totalPending = open.reduce((s, r) => s + (r.rewardAmount || 0), 0)
  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #68 · Universe</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >Referral Program</h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">SAP+ Pending→Signed→Qualified→Paid · audited transitions.</p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">Refresh</button>
      </div>
      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Referral AI"
        subtitle="Prioritises pending referrals toward qualified/paid"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'referrals', prompt: 'Advise on referral pipeline conversion and payout readiness.' }}
        cta="Advise referrals"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ label: 'Referrals', value: rows.length }, { label: 'Open', value: open.length }, { label: 'Paid $', value: totalPaid }, { label: 'Pending $', value: totalPending }].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {([['pipeline','Pipeline'],['invite','Invite'],['paid','Paid']] as const).map(([id,label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${tab===id?'bg-harvics-burgundy text-harvics-cream':'border border-harvics-burgundy/25'}`}>{label}</button>
        ))}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
      {!loading && tab === 'invite' ? (
        <div className="max-w-lg space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Invite referee</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Referee email *" value={form.refereeEmail} onChange={(e) => setForm({ ...form, refereeEmail: e.target.value })} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Referee name" value={form.refereeName} onChange={(e) => setForm({ ...form, refereeName: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: +e.target.value })} />
            <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.rewardCurrency} onChange={(e) => setForm({ ...form, rewardCurrency: e.target.value })} />
          </div>
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">Send referral</button>
        </div>
      ) : null}
      {!loading && tab !== 'invite' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead><tr className="bg-harvics-burgundy text-harvics-cream"><th className="p-2">Code</th><th className="p-2">Referee</th><th className="p-2">Reward</th><th className="p-2">Status</th><th className="p-2">Workflow</th></tr></thead>
            <tbody>
              {view.map((r) => (
                <tr key={r.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 font-mono font-semibold"><Link href={`/${locale}/os/referrals/${r.id}`} className="underline">{r.referralCode}</Link></td>
                  <td className="p-2 text-[11px]">{r.refereeEmail}</td>
                  <td className="p-2 font-mono">{r.rewardCurrency} {r.rewardAmount}</td>
                  <td className="p-2 font-semibold">{r.status}</td>
                  <td className="p-2 space-x-1">
                    {r.status === 'Pending' ? <button type="button" onClick={() => void setStatus(r.referralCode, 'Signed')} className="border border-harvics-burgundy px-2 py-0.5 text-[9px] font-bold uppercase">Signed</button> : null}
                    {r.status === 'Signed' ? <button type="button" onClick={() => void setStatus(r.referralCode, 'Qualified')} className="border border-harvics-burgundy px-2 py-0.5 text-[9px] font-bold uppercase">Qualify</button> : null}
                    {r.status === 'Qualified' ? <button type="button" onClick={() => void setStatus(r.referralCode, 'Paid')} className="border border-harvics-burgundy px-2 py-0.5 text-[9px] font-bold uppercase">Mark paid</button> : null}
                    {r.status === 'Paid' ? <span className="text-[10px]">✓</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
