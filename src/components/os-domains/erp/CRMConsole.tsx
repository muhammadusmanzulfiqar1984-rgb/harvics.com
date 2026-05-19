'use client'

import { useEffect, useState } from 'react'
import { api, inputCls, btnPrimary } from './_shell'

interface Customer {
  id: string; name: string; company: string; country: string
  segment: string; ltv: number; currency: string; createdAt: string
}
interface Lead {
  id: string; name: string; company: string; source: string
  stage: 'New' | 'Qualified' | 'Proposal' | 'Won' | 'Lost'
  value: number; currency: string; owner: string; createdAt: string
}

const STAGES: Lead['stage'][] = ['New', 'Qualified', 'Proposal', 'Won', 'Lost']
const SEGMENTS = ['Enterprise', 'Distributor', 'Wholesaler', 'Retail', 'SMB']

const STAGE_COLOR: Record<string, { bg: string; text: string; bar: string; dot: string }> = {
  New:       { bg: 'bg-slate-100',   text: 'text-slate-700',   bar: 'bg-slate-400',   dot: 'bg-slate-400' },
  Qualified: { bg: 'bg-sky-100',     text: 'text-sky-700',     bar: 'bg-sky-500',     dot: 'bg-sky-500' },
  Proposal:  { bg: 'bg-amber-100',   text: 'text-amber-700',   bar: 'bg-amber-500',   dot: 'bg-amber-500' },
  Won:       { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  Lost:      { bg: 'bg-rose-100',    text: 'text-rose-700',    bar: 'bg-rose-400',    dot: 'bg-rose-400' },
}

const SEGMENT_ICON: Record<string, string> = {
  Enterprise: '🏛️', Distributor: '🚚', Wholesaler: '📦', Retail: '🛍️', SMB: '🏪',
}

const COUNTRY_FLAG: Record<string, string> = {
  AE: '🇦🇪', PK: '🇵🇰', GB: '🇬🇧', US: '🇺🇸', SA: '🇸🇦', NG: '🇳🇬', CN: '🇨🇳', IN: '🇮🇳',
}

export default function CRMConsole() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeView, setActiveView] = useState<'pipeline' | 'customers' | 'add-lead' | 'add-customer'>('pipeline')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const [custForm, setCustForm] = useState({ name: '', company: '', country: 'AE', segment: 'Retail', ltv: '0' })
  const [leadForm, setLeadForm] = useState({ name: '', company: '', source: 'Inbound', value: '10000', owner: 'Omar Farouk' })

  const load = async () => {
    setLoading(true)
    const [c, l] = await Promise.all([
      api<Customer[]>('/api/modules/demo/customers'),
      api<Lead[]>('/api/modules/demo/leads'),
    ])
    if (c.ok && c.data) setCustomers(c.data)
    if (l.ok && l.data) setLeads(l.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createCustomer = async () => {
    if (!custForm.name.trim() || !custForm.company.trim()) { setMessage('Name and company required'); return }
    const r = await api('/api/modules/demo/customers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...custForm, ltv: Number(custForm.ltv) || 0 }),
    })
    setMessage(r.ok ? `✓ ${custForm.company} added` : r.error || 'Failed')
    if (r.ok) { setCustForm({ ...custForm, name: '', company: '', ltv: '0' }); load(); setActiveView('customers') }
  }

  const createLead = async () => {
    if (!leadForm.name.trim() || !leadForm.company.trim()) { setMessage('Name and company required'); return }
    const r = await api('/api/modules/demo/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...leadForm, stage: 'New', value: Number(leadForm.value) || 0 }),
    })
    setMessage(r.ok ? `✓ Lead ${leadForm.company} captured` : r.error || 'Failed')
    if (r.ok) { setLeadForm({ ...leadForm, name: '', company: '', value: '10000' }); load(); setActiveView('pipeline') }
  }

  const moveStage = async (id: string, stage: Lead['stage']) => {
    const r = await api(`/api/modules/demo/leads/${id}/stage`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    })
    if (r.ok) { setMessage(`→ ${stage}`); load(); setSelectedLead(null) }
  }

  const removeLead = async (id: string) => {
    const r = await api(`/api/modules/demo/leads/${id}`, { method: 'DELETE' })
    if (r.ok) { load(); setSelectedLead(null) }
  }

  const removeCust = async (id: string) => {
    const r = await api(`/api/modules/demo/customers/${id}`, { method: 'DELETE' })
    if (r.ok) load()
  }

  // Derived metrics
  const pipelineValue = leads.filter(l => l.stage !== 'Lost' && l.stage !== 'Won').reduce((s, l) => s + l.value, 0)
  const wonValue = leads.filter(l => l.stage === 'Won').reduce((s, l) => s + l.value, 0)
  const totalLtv = customers.reduce((s, c) => s + c.ltv, 0)
  const conversionRate = leads.length > 0 ? ((leads.filter(l => l.stage === 'Won').length / leads.length) * 100).toFixed(0) : '0'
  const funnelMax = Math.max(...STAGES.map(s => leads.filter(l => l.stage === s).length), 1)

  const KPI_CARDS = [
    { label: 'Total Customers', value: customers.length, sub: `LTV $${(totalLtv/1000).toFixed(0)}k`, icon: '👥', color: 'from-[#6b1f2b] to-[#3d0f17]' },
    { label: 'Pipeline Value', value: `$${(pipelineValue/1000).toFixed(0)}k`, sub: `${leads.filter(l=>l.stage!=='Won'&&l.stage!=='Lost').length} open deals`, icon: '💰', color: 'from-[#1a4a7a] to-[#0f2d4d]' },
    { label: 'Won Revenue', value: `$${(wonValue/1000).toFixed(0)}k`, sub: `${leads.filter(l=>l.stage==='Won').length} deals closed`, icon: '🏆', color: 'from-[#1a5c3a] to-[#0f3621]' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, sub: `${leads.length} total leads`, icon: '📈', color: 'from-[#5c3d1a] to-[#3a2410]' },
  ]

  return (
    <div className="space-y-4">

      {/* Hero KPI bar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI_CARDS.map(k => (
          <div key={k.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${k.color} p-4 text-white shadow-lg`}>
            <div className="absolute -right-4 -top-4 text-5xl opacity-20">{k.icon}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{k.label}</p>
            <p className="mt-1 text-2xl font-black">{k.value}</p>
            <p className="mt-0.5 text-[10px] text-white/50">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Nav strip */}
      <div className="flex items-center justify-between rounded-2xl border border-[#e8e2d5] bg-white px-3 py-2 shadow-sm">
        <div className="flex gap-1">
          {([
            { key: 'pipeline', label: 'Pipeline', icon: '🔀' },
            { key: 'customers', label: 'Customers', icon: '🏢' },
            { key: 'add-lead', label: 'Capture Lead', icon: '➕' },
            { key: 'add-customer', label: 'Add Customer', icon: '🤝' },
          ] as const).map(v => (
            <button
              key={v.key}
              type="button"
              onClick={() => setActiveView(v.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${activeView === v.key ? 'bg-[#6b1f2b] text-white shadow' : 'text-[#3a3a3a] hover:bg-[#f5efe2]'}`}
            >
              <span className="mr-1">{v.icon}</span>{v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {message && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{message}</span>}
          <button type="button" onClick={load} disabled={loading}
            className="rounded-full border border-[#e8e2d5] px-3 py-1 text-[10px] font-bold text-[#6b1f2b] hover:bg-[#f5efe2]">
            {loading ? '⟳ Syncing…' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      {/* Pipeline View — Kanban */}
      {activeView === 'pipeline' && (
        <div>
          {/* Funnel visualization */}
          <div className="mb-4 rounded-2xl border border-[#e8e2d5] bg-white p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Pipeline Funnel</p>
            <div className="flex items-end gap-2">
              {STAGES.map(stage => {
                const count = leads.filter(l => l.stage === stage).length
                const stageValue = leads.filter(l => l.stage === stage).reduce((s, l) => s + l.value, 0)
                const pct = funnelMax > 0 ? (count / funnelMax) * 100 : 0
                const col = STAGE_COLOR[stage]
                return (
                  <div key={stage} className="flex-1 text-center">
                    <p className="mb-1 text-[10px] font-mono font-bold text-[#3a3a3a]">{count}</p>
                    <div className="relative mx-auto w-full rounded-t-lg overflow-hidden" style={{ height: 60 }}>
                      <div className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ${col.bar}`} style={{ height: `${Math.max(pct, 8)}%` }} />
                    </div>
                    <p className={`mt-1 rounded-full px-1 py-0.5 text-[9px] font-bold ${col.bg} ${col.text}`}>{stage}</p>
                    <p className="text-[9px] text-[#5d5d5d]">${(stageValue/1000).toFixed(0)}k</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Kanban columns */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {STAGES.map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage)
              const col = STAGE_COLOR[stage]
              return (
                <div key={stage} className="rounded-2xl border border-[#e8e2d5] bg-white shadow-sm">
                  <div className={`flex items-center justify-between rounded-t-2xl px-3 py-2 ${col.bg}`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${col.dot}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${col.text}`}>{stage}</span>
                    </div>
                    <span className={`rounded-full px-1.5 text-[9px] font-black ${col.text}`}>{stageLeads.length}</span>
                  </div>
                  <div className="space-y-2 p-2">
                    {stageLeads.map(lead => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                        className="w-full rounded-xl border border-[#e8e2d5] bg-[#fdfcfb] p-2 text-left shadow-sm transition hover:border-[#c3a35e]/50 hover:shadow"
                      >
                        <p className="text-[11px] font-bold text-[#1a1a1a] leading-tight">{lead.company}</p>
                        <p className="text-[10px] text-[#5d5d5d]">{lead.name}</p>
                        <p className="mt-1 text-[11px] font-mono font-bold text-[#6b1f2b]">${lead.value.toLocaleString()}</p>
                        <p className="text-[9px] text-[#8a8a8a]">{lead.owner}</p>
                      </button>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="rounded-lg border-2 border-dashed border-[#e8e2d5] py-4 text-center">
                        <p className="text-[10px] text-[#b0a090]">Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Lead detail panel */}
          {selectedLead && (
            <div className="mt-4 rounded-2xl border border-[#c3a35e]/40 bg-gradient-to-br from-white to-[#fdf8f2] p-5 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#1a1a1a]">{selectedLead.company}</h3>
                  <p className="text-sm text-[#5d5d5d]">{selectedLead.name} · {selectedLead.source} · {selectedLead.owner}</p>
                  <p className="mt-1 text-2xl font-black text-[#6b1f2b]">${selectedLead.value.toLocaleString()} <span className="text-sm font-normal text-[#5d5d5d]">{selectedLead.currency}</span></p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STAGE_COLOR[selectedLead.stage].bg} ${STAGE_COLOR[selectedLead.stage].text}`}>{selectedLead.stage}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <p className="w-full text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Move to stage:</p>
                {STAGES.filter(s => s !== selectedLead.stage).map(s => (
                  <button key={s} type="button" onClick={() => moveStage(selectedLead.id, s)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition hover:opacity-80 ${STAGE_COLOR[s].bg} ${STAGE_COLOR[s].text}`}>
                    → {s}
                  </button>
                ))}
                <button type="button" onClick={() => removeLead(selectedLead.id)}
                  className="ml-auto rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200">
                  Delete Lead
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customers View */}
      {activeView === 'customers' && (
        <div className="rounded-2xl border border-[#e8e2d5] bg-white shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d5] bg-[#fdf8f2]">
                {['Company', 'Contact', 'Market', 'Segment', 'LTV', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#5d5d5d]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.id} className={`border-b border-[#f0ece4] transition hover:bg-[#fdf8f2] ${i % 2 === 0 ? '' : 'bg-[#fdfcfb]'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6b1f2b] to-[#3d0f17] text-xs font-black text-white">
                        {c.company.charAt(0)}
                      </div>
                      <span className="font-bold text-[#1a1a1a]">{c.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#5d5d5d]">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <span>{COUNTRY_FLAG[c.country] || '🌍'}</span>
                      <span className="font-mono text-[#3a3a3a]">{c.country}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#f5efe2] px-2 py-0.5 text-[10px] font-bold text-[#6b1f2b]">
                      {SEGMENT_ICON[c.segment] || ''} {c.segment}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-[#1a5c3a]">${c.ltv.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => removeCust(c.id)}
                      className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-100">Remove</button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-sm text-[#b0a090]">No customers yet. Add your first account →</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Capture Lead form */}
      {activeView === 'add-lead' && (
        <div className="mx-auto max-w-md rounded-2xl border border-[#e8e2d5] bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-black text-[#1a1a1a]">Capture New Lead</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Contact Name</label>
              <input className={inputCls} placeholder="e.g. Ahmed Hassan" value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Company</label>
              <input className={inputCls} placeholder="e.g. Global Trading LLC" value={leadForm.company} onChange={e => setLeadForm({ ...leadForm, company: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Source</label>
                <input className={inputCls} placeholder="Inbound / Referral" value={leadForm.source} onChange={e => setLeadForm({ ...leadForm, source: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Deal Value ($)</label>
                <input className={inputCls} type="number" placeholder="10000" value={leadForm.value} onChange={e => setLeadForm({ ...leadForm, value: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Owner</label>
              <input className={inputCls} placeholder="Sales rep name" value={leadForm.owner} onChange={e => setLeadForm({ ...leadForm, owner: e.target.value })} />
            </div>
            <button type="button" onClick={createLead} className={`${btnPrimary} w-full text-sm`}>Capture Lead →</button>
          </div>
        </div>
      )}

      {/* Add Customer form */}
      {activeView === 'add-customer' && (
        <div className="mx-auto max-w-md rounded-2xl border border-[#e8e2d5] bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-black text-[#1a1a1a]">Add New Customer</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Contact Name</label>
              <input className={inputCls} placeholder="e.g. Khalid Mansour" value={custForm.name} onChange={e => setCustForm({ ...custForm, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Company</label>
              <input className={inputCls} placeholder="e.g. Emirates Trade Co" value={custForm.company} onChange={e => setCustForm({ ...custForm, company: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Country</label>
                <input className={inputCls} placeholder="AE" value={custForm.country} onChange={e => setCustForm({ ...custForm, country: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">Segment</label>
                <select className={inputCls} value={custForm.segment} onChange={e => setCustForm({ ...custForm, segment: e.target.value })}>
                  {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#5d5d5d]">LTV ($)</label>
                <input className={inputCls} type="number" placeholder="0" value={custForm.ltv} onChange={e => setCustForm({ ...custForm, ltv: e.target.value })} />
              </div>
            </div>
            <button type="button" onClick={createCustomer} className={`${btnPrimary} w-full text-sm`}>Add Customer →</button>
          </div>
        </div>
      )}
    </div>
  )
}


interface Customer {
  id: string
  name: string
  company: string
  country: string
  segment: string
  ltv: number
  currency: string
  createdAt: string
}

interface Lead {
  id: string
  name: string
  company: string
  source: string
  stage: 'New' | 'Qualified' | 'Proposal' | 'Won' | 'Lost'
  value: number
  currency: string
  owner: string
  createdAt: string
}
