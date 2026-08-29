'use client'

/**
 * Module #8 — CRM + Sales
 * DoD: lead CRUD + stage, convert → customer+deal, deal pipeline, customers, activity feed.
 * Auth Bearer required (same pattern as Finance modules).
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

type Tab = 'leads' | 'pipeline' | 'customers' | 'activity'

const LEAD_STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] as const
const DEAL_STAGES = ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function CrmModuleEight() {
  const locale = useLocale()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('leads')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [leads, setLeads] = useState<any[]>([])
  const [pipeline, setPipeline] = useState<any[]>([])
  const [pipeSummary, setPipeSummary] = useState({ totalPipeline: 0, totalWeighted: 0 })
  const [customers, setCustomers] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])

  const [leadForm, setLeadForm] = useState({
    company: '',
    contact: '',
    email: '',
    value: '',
    source: 'Direct',
  })
  const [dealForm, setDealForm] = useState({
    name: '',
    value: '',
    stage: 'Prospecting',
    probability: '20',
  })
  const [actForm, setActForm] = useState({
    type: 'note',
    subject: '',
    body: '',
    leadId: '',
  })
  const [customerForm, setCustomerForm] = useState({
    name: '',
    segment: 'Prospect',
    country: '',
    contactEmail: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [l, p, c, a] = await Promise.all([
        api('/api/wave8/leads'),
        api('/api/wave3/crm/pipeline'),
        api('/api/crm/customers?limit=200'),
        api('/api/wave8/activities'),
      ])
      setLeads(l.data || [])
      setPipeline(p.data || [])
      setPipeSummary(p.summary || { totalPipeline: 0, totalWeighted: 0 })
      setCustomers(c.data || [])
      setActivities(a.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #8 CRM')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createLead = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/wave8/leads', {
        method: 'POST',
        body: JSON.stringify({
          company: leadForm.company,
          contact: leadForm.contact || undefined,
          email: leadForm.email || undefined,
          value: Number(leadForm.value) || 0,
          source: leadForm.source || undefined,
        }),
      })
      setLeadForm({ company: '', contact: '', email: '', value: '', source: 'Direct' })
      setMessage(`Lead created · ${r.data?.company}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setLeadStage = async (id: string, stage: string) => {
    try {
      setError('')
      await api(`/api/wave8/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const convertLead = async (id: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/wave8/leads/${id}/convert`, { method: 'POST', body: '{}' })
      setMessage(r.message || 'Converted to customer + deal')
      const customerId = r.customer?.id
      if (customerId) {
        router.push(`/${locale}/os/crm/customers/${customerId}`)
        return
      }
      await load()
      setTab('pipeline')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const qualifyLead = async (id: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/wave8/leads/${id}/qualify`, { method: 'POST', body: '{}' })
      setMessage(r.message || 'Qualified')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const scoreLeadAi = async (id: string) => {
    try {
      setError('')
      const r = await api(`/api/wave8/leads/${id}/score`, { method: 'POST', body: '{}' })
      const d = r.data || r
      setMessage(`AI ${d.tier || ''} ${d.score ?? d.aiScore ?? ''} — ${d.reasoning || d.nextAction || 'scored'}`.trim())
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const bulkScoreAi = async () => {
    try {
      setError('')
      const r = await api('/api/wave8/leads/bulk-score', { method: 'POST', body: '{}' })
      setMessage(`Bulk scored ${r.scored || 0} leads · ${r.aiEnabled ? 'LLM' : 'heuristic'}`)
      await load()
      setTab('leads')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const draftEmailAi = async (id: string) => {
    try {
      setError('')
      const r = await api(`/api/wave8/leads/${id}/email-draft`, {
        method: 'POST',
        body: JSON.stringify({ purpose: 'follow_up' }),
      })
      const d = r.data || r
      setMessage(`Email: ${d.subject}\n\n${d.body}`)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createDeal = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/wave3/crm/deals', {
        method: 'POST',
        body: JSON.stringify({
          name: dealForm.name,
          value: Number(dealForm.value) || 0,
          stage: dealForm.stage,
          probability: Number(dealForm.probability) || 20,
        }),
      })
      setDealForm({ name: '', value: '', stage: 'Prospecting', probability: '20' })
      setMessage('Deal created')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const advanceDeal = async (id: string, stage: string) => {
    try {
      setError('')
      await api(`/api/wave3/crm/deals/${id}/stage`, {
        method: 'POST',
        body: JSON.stringify({ stage }),
      })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createCustomer = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/crm/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: customerForm.name,
          segment: customerForm.segment || undefined,
          country: customerForm.country || undefined,
          contactEmail: customerForm.contactEmail || undefined,
        }),
      })
      setCustomerForm({ name: '', segment: 'Prospect', country: '', contactEmail: '' })
      setMessage('Customer created')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const logActivity = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/wave8/activities', {
        method: 'POST',
        body: JSON.stringify({
          type: actForm.type,
          subject: actForm.subject,
          body: actForm.body || undefined,
          leadId: actForm.leadId || undefined,
        }),
      })
      setActForm({ type: 'note', subject: '', body: '', leadId: '' })
      setMessage('Activity logged')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const openLeads = leads.filter((l) => l.stage !== 'Converted' && l.stage !== 'Lost')

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #8 · Commercial</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            CRM + Sales
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Leads → convert to customer + deal → pipeline → activity. Prisma-backed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/os/crm/reports`}
            className="border border-harvics-gold/50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Reports
          </Link>
          <Link
            href={`/${locale}/os/crm/smart`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Smart CRM
          </Link>
          <button
            type="button"
            onClick={() => void bulkScoreAi()}
            className="bg-harvics-burgundy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            AI bulk score
          </button>
          <Link
            href={`/${locale}/os/crm/import-harvyx`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Import HarvyX
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}
      {message ? (
        <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #1E3A8A' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Open leads</div>
          <div className="mt-1 font-mono text-lg font-semibold">{openLeads.length}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #B8860B' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Pipeline</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(pipeSummary.totalPipeline)}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #2E7D32' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Weighted</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(pipeSummary.totalWeighted)}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #6B4F3A' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Customers</div>
          <div className="mt-1 font-mono text-lg font-semibold">{customers.length}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['leads', 'Leads'],
            ['pipeline', 'Pipeline'],
            ['customers', 'Customers'],
            ['activity', 'Activity'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
              tab === id ? 'bg-harvics-burgundy text-harvics-cream' : 'border border-harvics-burgundy/25'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

      {!loading && tab === 'leads' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New lead</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Company *"
              value={leadForm.company}
              onChange={(e) => setLeadForm((f) => ({ ...f, company: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Contact"
              value={leadForm.contact}
              onChange={(e) => setLeadForm((f) => ({ ...f, contact: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Email"
              value={leadForm.email}
              onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Value"
              type="number"
              value={leadForm.value}
              onChange={(e) => setLeadForm((f) => ({ ...f, value: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Source"
              value={leadForm.source}
              onChange={(e) => setLeadForm((f) => ({ ...f, source: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createLead()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create lead
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Company', 'Contact', 'Value', 'AI', 'Stage', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No leads yet.
                    </td>
                  </tr>
                ) : (
                  leads.map((l, i) => (
                    <tr key={l.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2">
                        <Link
                          href={`/${locale}/os/crm/leads/${l.id}`}
                          className="font-semibold underline-offset-2 hover:underline"
                        >
                          {l.company}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{l.contact || '—'}</td>
                      <td className="px-3 py-2 font-mono">{fmt(l.value)}</td>
                      <td className="px-3 py-2 font-mono text-[12px]">
                        {l.aiScore != null ? (
                          <span>
                            {l.aiScore}
                            {l.aiTier ? ` · ${l.aiTier}` : ''}
                          </span>
                        ) : (
                          <span className="text-harvics-burgundy/35">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          className="border border-harvics-burgundy/20 bg-white px-2 py-1 text-xs"
                          value={l.stage}
                          disabled={l.stage === 'Converted'}
                          onChange={(e) => void setLeadStage(l.id, e.target.value)}
                        >
                          {[...LEAD_STAGES, 'Converted'].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        {l.stage !== 'Converted' && l.stage !== 'Lost' ? (
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => void scoreLeadAi(l.id)}
                              className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
                            >
                              AI score
                            </button>
                            <button
                              type="button"
                              onClick={() => void draftEmailAi(l.id)}
                              className="border border-harvics-burgundy/25 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
                            >
                              AI email
                            </button>
                            {l.stage !== 'Qualified' ? (
                              <button
                                type="button"
                                onClick={() => void qualifyLead(l.id)}
                                className="border border-harvics-burgundy/25 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
                              >
                                Qualify
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void convertLead(l.id)}
                              className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
                            >
                              Convert
                            </button>
                          </div>
                        ) : (
                          <span className="text-harvics-burgundy/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'pipeline' ? (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New deal</p>
              <input
                className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                placeholder="Deal name *"
                value={dealForm.name}
                onChange={(e) => setDealForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                placeholder="Value"
                type="number"
                value={dealForm.value}
                onChange={(e) => setDealForm((f) => ({ ...f, value: e.target.value }))}
              />
              <select
                className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                value={dealForm.stage}
                onChange={(e) => setDealForm((f) => ({ ...f, stage: e.target.value }))}
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void createDeal()}
                className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
              >
                Create deal
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {pipeline.map((col) => (
                <div key={col.stage} className="border border-harvics-burgundy/15 bg-white">
                  <div className="bg-harvics-burgundy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream">
                    {col.stage} · {col.count} · {fmt(col.value)}
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto p-2">
                    {(col.deals || []).length === 0 ? (
                      <p className="px-1 py-4 text-center text-xs text-harvics-burgundy/40">Empty</p>
                    ) : (
                      (col.deals || []).map((d: any) => (
                        <div key={d.id} className="border border-harvics-burgundy/10 bg-harvics-cream/30 p-2">
                          <Link
                            href={`/${locale}/os/crm/deals/${d.id}`}
                            className="text-sm font-semibold underline-offset-2 hover:underline"
                          >
                            {d.name}
                          </Link>
                          <div className="font-mono text-xs">{fmt(d.value)}</div>
                          <select
                            className="mt-2 w-full border border-harvics-burgundy/20 bg-white px-1 py-1 text-[11px]"
                            value={d.stage}
                            onChange={(e) => void advanceDeal(d.id, e.target.value)}
                          >
                            {DEAL_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'customers' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New customer</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Name *"
              value={customerForm.name}
              onChange={(e) => setCustomerForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Segment"
              value={customerForm.segment}
              onChange={(e) => setCustomerForm((f) => ({ ...f, segment: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Country"
              value={customerForm.country}
              onChange={(e) => setCustomerForm((f) => ({ ...f, country: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Email"
              value={customerForm.contactEmail}
              onChange={(e) => setCustomerForm((f) => ({ ...f, contactEmail: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createCustomer()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create customer
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Name', 'Segment', 'Country', 'Email', 'LTV'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No customers yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((c, i) => (
                    <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2">
                        <Link className="font-semibold underline-offset-2 hover:underline" href={`/${locale}/os/crm/customers/${c.id}`}>
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{c.segment || '—'}</td>
                      <td className="px-3 py-2">{c.country || '—'}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/60">{c.contactEmail || '—'}</td>
                      <td className="px-3 py-2 font-mono">{fmt(c.lifetimeValue || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'activity' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Log activity</p>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={actForm.type}
              onChange={(e) => setActForm((f) => ({ ...f, type: e.target.value }))}
            >
              {['note', 'call', 'email', 'meeting', 'task', 'demo'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Subject *"
              value={actForm.subject}
              onChange={(e) => setActForm((f) => ({ ...f, subject: e.target.value }))}
            />
            <textarea
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Body"
              rows={3}
              value={actForm.body}
              onChange={(e) => setActForm((f) => ({ ...f, body: e.target.value }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={actForm.leadId}
              onChange={(e) => setActForm((f) => ({ ...f, leadId: e.target.value }))}
            >
              <option value="">Link lead (optional)</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void logActivity()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Log activity
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Type', 'Subject', 'Outcome', 'When'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No activities yet.
                    </td>
                  </tr>
                ) : (
                  activities.map((a, i) => (
                    <tr key={a.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono text-xs uppercase">{a.type}</td>
                      <td className="px-3 py-2 font-semibold">{a.subject}</td>
                      <td className="px-3 py-2">{a.outcome || '—'}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/60">
                        {a.occurredAt ? new Date(a.occurredAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
