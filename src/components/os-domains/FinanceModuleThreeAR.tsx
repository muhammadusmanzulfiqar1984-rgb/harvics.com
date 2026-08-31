'use client'

/**
 * Module #3 — Accounts Receivable (SAP+ workspace)
 * Invoices · collections · aging · customer statements · write-off / credit note · GL posts.
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { OsBarChart, OsLivePulse, OsPanel, OsPieChart, OS } from '@/components/os/charts/OsCharts'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'invoices' | 'payments' | 'aging' | 'collections' | 'dunning' | 'o2c' | 'customers'

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

const BUCKETS: { key: string; label: string; color: string }[] = [
  { key: 'current', label: 'Current', color: '#2E7D32' },
  { key: 'd30', label: '1–30 days', color: '#9CB451' },
  { key: 'd60', label: '31–60 days', color: '#B8860B' },
  { key: 'd90', label: '61–90 days', color: '#E65100' },
  { key: 'd90plus', label: '90+ days', color: '#B71C1C' },
]

export default function FinanceModuleThreeAR() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('invoices')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [aging, setAging] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [dunningQueue, setDunningQueue] = useState<any[]>([])
  const [dunningStages, setDunningStages] = useState<any[]>([])
  const [o2cPipeline, setO2cPipeline] = useState<any[]>([])
  const [o2cSummary, setO2cSummary] = useState<Record<string, number>>({})
  const [o2cStages, setO2cStages] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({
    current: 0,
    d30: 0,
    d60: 0,
    d90: 0,
    d90plus: 0,
  })

  const [invForm, setInvForm] = useState({
    customer: '',
    amount: '',
    dueDate: '',
    postToGl: true,
  })
  const [payForm, setPayForm] = useState({
    invoiceNo: '',
    amount: '',
    method: 'Bank Transfer',
    reference: '',
    postToGl: true,
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [inv, pay, age, coll, dunn, o2c, cust] = await Promise.all([
        api('/api/finance/invoices?type=AR&limit=200'),
        api('/api/finance/payments?limit=500'),
        api('/api/finance/ar/aging'),
        api('/api/finance/ar/collections'),
        api('/api/finance/ar/dunning/queue'),
        api('/api/finance/ar/o2c/pipeline').catch(() => ({ data: [], summary: {} })),
        api('/api/finance/ar/customers'),
      ])
      const stagesRes = await api('/api/finance/ar/dunning/stages').catch(() => ({ data: [] }))
      const o2cStagesRes = await api('/api/finance/ar/o2c/stages').catch(() => ({ data: [] }))
      const invNos = new Set((inv.data || []).map((i: any) => i.invoiceNo))
      setInvoices(inv.data || [])
      setPayments((pay.data || []).filter((p: any) => invNos.has(p.invoiceNo)))
      setAging(age.data || [])
      setSummary(age.summary || { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 })
      setCollections(coll.data || [])
      setDunningQueue(dunn.data || [])
      setDunningStages(stagesRes.data || [])
      setO2cPipeline(o2c.data || [])
      setO2cSummary(o2c.summary || {})
      setO2cStages(o2cStagesRes.data || [])
      setCustomers(cust.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #3 AR')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const sendDunning = async (invoiceId: string, invoiceNo: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/finance/invoices/${invoiceId}/dunning/send`, { method: 'POST', body: JSON.stringify({}) })
      setMessage(`Dunning sent for ${invoiceNo} — ${r.dunning?.stage?.label || 'stage complete'}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const runDunningBatch = async (dryRun: boolean) => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/ar/dunning/run-batch', {
        method: 'POST',
        body: JSON.stringify({ limit: 20, dryRun }),
      })
      setMessage(r.message || `Batch: ${r.sent}/${r.processed}`)
      if (!dryRun) await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const o2cAction = async (orderId: string, action: 'ship' | 'deliver' | 'bill' | 'release_credit', orderNo: string) => {
    try {
      setError('')
      setMessage('')
      const path =
        action === 'release_credit'
          ? `/api/finance/ar/o2c/orders/${orderId}/release-credit`
          : `/api/finance/ar/o2c/orders/${orderId}/${action}`
      const r = await api(path, { method: 'POST', body: JSON.stringify({ postToGl: true }) })
      setMessage(r.message || `${action} complete for ${orderNo}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const runO2CBatch = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/ar/o2c/run-batch', { method: 'POST', body: JSON.stringify({ limit: 10 }) })
      setMessage(r.message || `O2C batch: ${r.billed} billed`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createInvoice = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customer: invForm.customer,
          amount: Number(invForm.amount),
          dueDate: invForm.dueDate || undefined,
          type: 'AR',
          postToGl: invForm.postToGl,
        }),
      })
      setInvForm({ customer: '', amount: '', dueDate: '', postToGl: true })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`Invoice ${r.data?.invoiceNo} created${glBit}`)
      await load()
      setTab('aging')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const recordPayment = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/payments', {
        method: 'POST',
        body: JSON.stringify({
          invoiceNo: payForm.invoiceNo,
          amount: Number(payForm.amount),
          method: payForm.method,
          reference: payForm.reference || undefined,
          postToGl: payForm.postToGl,
        }),
      })
      setPayForm({ invoiceNo: '', amount: '', method: 'Bank Transfer', reference: '', postToGl: true })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`Payment recorded · status ${r.invoiceStatus}${glBit}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const quickCollect = (invoiceNo: string, outstanding: number) => {
    setPayForm((f) => ({ ...f, invoiceNo, amount: String(outstanding) }))
    setTab('payments')
  }

  const openInvoices = invoices.filter((i) => !['Paid', 'WrittenOff', 'CreditNote', 'Cancelled'].includes(i.status))
  const outstandingTotal = Object.values(summary).reduce((s, v) => s + (Number(v) || 0), 0)
  const collectedTotal = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #3 · Finance</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Accounts Receivable
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Billing, collections, aging & customer statements — posts to Module #1 GL (1100 / 4000 / 1000).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Collections coach"
        subtitle="AI prioritises recovery (not just oldest-first) and drafts call scripts — classic SAP dunning cannot"
        endpoint="/api/finance/ai/ar-collections"
        cta="Coach collections"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #6B1D2A' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Outstanding</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(outstandingTotal)}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #2E7D32' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Collected</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(collectedTotal)}</div>
        </div>
        {BUCKETS.map((b) => (
          <div key={b.key} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: `3px solid ${b.color}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{b.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{fmt(summary[b.key] || 0)}</div>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-harvics-burgundy/70">
        Open documents: <strong>{openInvoices.length}</strong>
        {' · '}
        <OsLivePulse label="AR LIVE" />
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <OsPanel title="Aging bar chart" subtitle="Open receivables by bucket">
          <OsBarChart
            data={BUCKETS.map((b) => ({ name: b.label, value: summary[b.key] || 0 }))}
            color={OS.burgundy}
            height={200}
          />
        </OsPanel>
        <OsPanel title="Aging mix" subtitle="Pie">
          <OsPieChart
            data={
              BUCKETS.map((b) => ({ name: b.label, value: summary[b.key] || 0 })).filter((d) => d.value > 0).length
                ? BUCKETS.map((b) => ({ name: b.label, value: summary[b.key] || 0 })).filter((d) => d.value > 0)
                : [{ name: 'No open AR', value: 1 }]
            }
            height={200}
          />
        </OsPanel>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['invoices', 'Invoices'],
            ['payments', 'Payments'],
            ['aging', 'Aging'],
            ['collections', 'Collections'],
            ['dunning', 'Dunning'],
            ['o2c', 'O2C'],
            ['customers', 'Customers'],
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

      {!loading && tab === 'invoices' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 px-4 py-3">
            <p className="text-[13px] text-harvics-burgundy/70">
              Invoice Intelligence: say one sentence → AI fills commercial tax invoice (HS, Incoterms, bank) → GL → print. SAP FB70 cannot.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}/os/ar/master`}
                className="border border-harvics-burgundy/30 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em]"
              >
                AR master data
              </Link>
              <Link
                href={`/${locale}/os/finance/global-house`}
                className="border border-harvics-burgundy/30 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em]"
              >
                Global House
              </Link>
              <Link
                href={`/${locale}/os/ar/invoices/new`}
                className="bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
              >
                Open Invoice Intelligence
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Invoice', 'Customer', 'Amount', 'Outstanding', 'Status', 'Due'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No AR invoices yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, i) => (
                    <tr key={inv.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-semibold">
                        <Link className="underline decoration-harvics-gold/50 underline-offset-2" href={`/${locale}/os/ar/invoices/${inv.id}`}>
                          {inv.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{inv.customer || inv.customerName || '—'}</td>
                      <td className="px-3 py-2">{fmt(inv.amount)}</td>
                      <td className="px-3 py-2">{fmt(inv.outstanding ?? inv.amount)}</td>
                      <td className="px-3 py-2">{inv.status}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/60">{inv.dueDate || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'payments' ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Record payment</p>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={payForm.invoiceNo}
              onChange={(e) => setPayForm((f) => ({ ...f, invoiceNo: e.target.value }))}
            >
              <option value="">Select open invoice</option>
              {openInvoices.map((inv) => (
                <option key={inv.id} value={inv.invoiceNo}>
                  {inv.invoiceNo} — {inv.customer || inv.customerName} ({fmt(inv.outstanding ?? inv.amount)})
                </option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Amount"
              type="number"
              value={payForm.amount}
              onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={payForm.method}
              onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value }))}
            >
              <option>Bank Transfer</option>
              <option>Cash</option>
              <option>Cheque</option>
              <option>Card</option>
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Reference"
              value={payForm.reference}
              onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                checked={payForm.postToGl}
                onChange={(e) => setPayForm((f) => ({ ...f, postToGl: e.target.checked }))}
              />
              Post to Module #1 GL (Dr 1000 / Cr 1100)
            </label>
            <button
              type="button"
              onClick={() => void recordPayment()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Record payment
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Invoice', 'Amount', 'Method', 'Reference', 'Date'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No payments yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p, i) => (
                    <tr key={p.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">{p.invoiceNo}</td>
                      <td className="px-3 py-2 font-mono">{fmt(p.amount)}</td>
                      <td className="px-3 py-2">{p.method || '—'}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/60">{p.reference || '—'}</td>
                      <td className="px-3 py-2">{p.receivedDate || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'aging' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Invoice', 'Customer', 'Amount', 'Paid', 'Outstanding', 'Days OD', 'Bucket'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aging.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No outstanding receivables.
                  </td>
                </tr>
              ) : (
                aging.map((r, i) => (
                  <tr key={r.invoiceNo} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link className="underline decoration-harvics-gold/50 underline-offset-2" href={`/${locale}/os/ar/invoices/${r.id}`}>
                        {r.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.customerName || '—'}</td>
                    <td className="px-3 py-2 font-mono">{fmt(r.amount)}</td>
                    <td className="px-3 py-2 font-mono text-green-800">{fmt(r.paid)}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{fmt(r.outstanding)}</td>
                    <td className="px-3 py-2">{r.daysOverdue}</td>
                    <td className="px-3 py-2">{r.bucket}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'collections' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Priority', 'Invoice', 'Customer', 'Outstanding', 'Days OD', 'Bucket', 'Action'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    Collections queue empty.
                  </td>
                </tr>
              ) : (
                collections.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono">P{r.priority}</td>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link className="underline decoration-harvics-gold/50 underline-offset-2" href={`/${locale}/os/ar/invoices/${r.id}`}>
                        {r.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.customerName || '—'}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{fmt(r.outstanding)}</td>
                    <td className="px-3 py-2">{r.daysOverdue}</td>
                    <td className="px-3 py-2">{r.bucket}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => quickCollect(r.invoiceNo, r.outstanding)}
                        className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                      >
                        Collect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'dunning' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-harvics-burgundy">Oracle-style staged dunning</p>
              <p className="text-[11px] text-harvics-burgundy/60">
                5 levels: reminder → 1st notice → 2nd → final → pre-legal. Real Resend email + history on invoice meta.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runDunningBatch(true)}
                className="border border-harvics-burgundy/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
              >
                Preview batch
              </button>
              <button
                type="button"
                onClick={() => runDunningBatch(false)}
                className="bg-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream"
              >
                Send batch (20)
              </button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-5">
            {dunningStages.map((s: any) => (
              <div key={s.stage} className="border border-harvics-burgundy/15 bg-white px-3 py-2 text-[10px]">
                <p className="font-bold uppercase tracking-[0.1em] text-harvics-burgundy">L{s.stage}</p>
                <p className="text-harvics-burgundy/70">{s.label}</p>
                <p className="text-harvics-gold">≥{s.minDaysOverdue}d OD</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Invoice', 'Customer', 'Outstanding', 'Days OD', 'Last', 'Next', 'Email', 'Send'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dunningQueue.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No invoices due for next dunning stage.
                    </td>
                  </tr>
                ) : (
                  dunningQueue.map((r: any, i: number) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link className="underline decoration-harvics-gold/50 underline-offset-2" href={`/${locale}/os/ar/invoices/${r.id}`}>
                          {r.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{r.customerName || '—'}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{fmt(r.outstanding)}</td>
                      <td className="px-3 py-2">{r.daysOverdue}</td>
                      <td className="px-3 py-2">L{r.lastStage || 0}</td>
                      <td className="px-3 py-2 font-semibold text-harvics-burgundy">L{r.nextStage} {r.nextStageLabel}</td>
                      <td className="px-3 py-2 text-[11px]">{r.contactEmail || '—'}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => sendDunning(r.id, r.invoiceNo)}
                          disabled={!r.contactEmail}
                          className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] disabled:opacity-40"
                        >
                          Send
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'o2c' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-harvics-burgundy">Order → delivery → billing</p>
              <p className="text-[11px] text-harvics-burgundy/60">
                Oracle bill-on-delivery: confirm → ship → deliver → AR invoice + GL. Not bill-on-order.
              </p>
            </div>
            <button
              type="button"
              onClick={() => runO2CBatch()}
              className="bg-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream"
            >
              Bill delivered batch
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-6">
            {[
              ['confirmed', o2cSummary.confirmed],
              ['inFulfillment', o2cSummary.inFulfillment],
              ['shipped', o2cSummary.shipped],
              ['deliveredUnbilled', o2cSummary.deliveredUnbilled],
              ['invoiced', o2cSummary.invoiced],
              ['creditHold', o2cSummary.creditHold],
            ].map(([key, val]) => (
              <div key={String(key)} className="border border-harvics-burgundy/15 bg-white px-3 py-2 text-[10px]">
                <p className="font-bold uppercase tracking-[0.1em] text-harvics-burgundy">{String(key)}</p>
                <p className="text-lg font-semibold text-harvics-gold">{val ?? 0}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {o2cStages.map((s: any) => (
              <span key={s.key} className="border border-harvics-burgundy/15 px-2 py-1 text-[10px] text-harvics-burgundy/70">
                {s.order}. {s.label}
              </span>
            ))}
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Order', 'Customer', 'Status', 'Amount', 'Delivery', 'Invoice', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {o2cPipeline.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No sales orders in O2C pipeline. Accept a CPQ quote or create a sales order in Module #9/#10.
                    </td>
                  </tr>
                ) : (
                  o2cPipeline.map((r: any, i: number) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">{r.orderNumber}</td>
                      <td className="px-3 py-2">{r.customerName}</td>
                      <td className="px-3 py-2">
                        <span className="font-semibold">{r.stageLabel || r.status}</span>
                      </td>
                      <td className="px-3 py-2 font-mono">{fmt(r.totalAmount)}</td>
                      <td className="px-3 py-2 text-[11px]">
                        {r.delivery ? `${r.delivery.status} · ${new Date(r.delivery.scheduledFor).toLocaleDateString()}` : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {r.invoice?.id ? (
                          <Link
                            className="font-mono underline decoration-harvics-gold/50"
                            href={`/${locale}/os/ar/invoices/${r.invoice.id}`}
                          >
                            {r.invoice.invoiceNo}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {(r.nextActions || []).map((a: string) => (
                            <button
                              key={a}
                              type="button"
                              onClick={() =>
                                o2cAction(
                                  r.id,
                                  a === 'release_credit' ? 'release_credit' : (a as 'ship' | 'deliver' | 'bill'),
                                  r.orderNumber,
                                )
                              }
                              className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
                            >
                              {a.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'customers' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Customer', 'Invoices', 'Open', 'Billed', 'Collected', 'Outstanding', 'Statement'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No AR customers yet.
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={c.customerName} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-semibold">{c.customerName}</td>
                    <td className="px-3 py-2">{c.invoiceCount}</td>
                    <td className="px-3 py-2">{c.openCount}</td>
                    <td className="px-3 py-2 font-mono">{fmt(c.billed)}</td>
                    <td className="px-3 py-2 font-mono text-green-800">{fmt(c.collected)}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{fmt(c.outstanding)}</td>
                    <td className="px-3 py-2">
                      <Link
                        className="text-[10px] font-bold uppercase tracking-[0.12em] underline decoration-harvics-gold/50"
                        href={`/${locale}/os/ar/customers/${encodeURIComponent(c.customerName)}`}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
