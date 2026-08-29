'use client'

/**
 * Module #4 — Accounts Payable (SAP+ workspace)
 * Vendor bills · payments · aging · payment proposals · write-off / credit · GL posts.
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'bills' | 'payments' | 'aging' | 'proposals' | 'vendors'

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

export default function FinanceModuleFourAP() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('bills')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [bills, setBills] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [aging, setAging] = useState<any[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [proposeTotal, setProposeTotal] = useState(0)
  const [summary, setSummary] = useState<Record<string, number>>({
    current: 0,
    d30: 0,
    d60: 0,
    d90: 0,
    d90plus: 0,
  })

  const [billForm, setBillForm] = useState({
    vendor: '',
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
      const [inv, pay, age, prop, vend] = await Promise.all([
        api('/api/finance/invoices?type=AP&limit=200'),
        api('/api/finance/payments?limit=500'),
        api('/api/finance/ap/aging'),
        api('/api/finance/ap/payment-proposals'),
        api('/api/finance/ap/vendors'),
      ])
      const billNos = new Set((inv.data || []).map((b: any) => b.invoiceNo))
      setBills(inv.data || [])
      setPayments((pay.data || []).filter((p: any) => billNos.has(p.invoiceNo)))
      setAging(age.data || [])
      setSummary(age.summary || { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 })
      setProposals(prop.data || [])
      setProposeTotal(prop.totalPropose || 0)
      setVendors(vend.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #4 AP')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createBill = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/invoices', {
        method: 'POST',
        body: JSON.stringify({
          vendor: billForm.vendor,
          amount: Number(billForm.amount),
          dueDate: billForm.dueDate || undefined,
          type: 'AP',
          postToGl: billForm.postToGl,
        }),
      })
      setBillForm({ vendor: '', amount: '', dueDate: '', postToGl: true })
      const glBit = r.journal ? ` · GL ${r.journal.entryNo}` : r.glNote ? ` · ${r.glNote}` : ''
      setMessage(`Bill ${r.data?.invoiceNo} created${glBit}`)
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

  const quickPay = (invoiceNo: string, outstanding: number) => {
    setPayForm((f) => ({ ...f, invoiceNo, amount: String(outstanding) }))
    setTab('payments')
  }

  const openBills = bills.filter((i) => !['Paid', 'WrittenOff', 'CreditNote', 'Cancelled'].includes(i.status))
  const outstandingTotal = Object.values(summary).reduce((s, v) => s + (Number(v) || 0), 0)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #4 · Finance</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Accounts Payable
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Vendor bills, payment proposals & aging — posts to Module #1 GL (6000 / 2000 / 1000).
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
        title="Payment-run AI"
        subtitle="Optimise which vendors to pay vs defer under cash constraints — smarter than static AP aging"
        endpoint="/api/finance/ai/ap-payments"
        cta="Advise payments"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #6B1D2A' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Payable</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(outstandingTotal)}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #B8860B' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Propose pay</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(proposeTotal)}</div>
        </div>
        {BUCKETS.map((b) => (
          <div key={b.key} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: `3px solid ${b.color}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{b.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{fmt(summary[b.key] || 0)}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['bills', 'Vendor bills'],
            ['payments', 'Payments'],
            ['aging', 'Aging'],
            ['proposals', 'Pay proposals'],
            ['vendors', 'Vendors'],
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

      {!loading && tab === 'bills' ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New vendor bill</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Vendor name"
              value={billForm.vendor}
              onChange={(e) => setBillForm((f) => ({ ...f, vendor: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Amount"
              type="number"
              value={billForm.amount}
              onChange={(e) => setBillForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="date"
              value={billForm.dueDate}
              onChange={(e) => setBillForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                checked={billForm.postToGl}
                onChange={(e) => setBillForm((f) => ({ ...f, postToGl: e.target.checked }))}
              />
              Post to Module #1 GL (Dr 6000 / Cr 2000)
            </label>
            <button
              type="button"
              onClick={() => void createBill()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create bill
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Bill', 'Vendor', 'Amount', 'Outstanding', 'Status', 'Due'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No AP bills yet.
                    </td>
                  </tr>
                ) : (
                  bills.map((inv, i) => (
                    <tr key={inv.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link className="underline decoration-harvics-gold/50 underline-offset-2" href={`/${locale}/os/ap/bills/${inv.id}`}>
                          {inv.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{inv.customer || inv.customerName || '—'}</td>
                      <td className="px-3 py-2 font-mono">{fmt(inv.amount)}</td>
                      <td className="px-3 py-2 font-mono">{fmt(inv.outstanding ?? inv.amount)}</td>
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
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Pay vendor</p>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={payForm.invoiceNo}
              onChange={(e) => setPayForm((f) => ({ ...f, invoiceNo: e.target.value }))}
            >
              <option value="">Select open bill</option>
              {openBills.map((inv) => (
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
              Post to Module #1 GL (Dr 2000 / Cr 1000)
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
                  {['Bill', 'Amount', 'Method', 'Reference', 'Date'].map((h) => (
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
                      No AP payments yet.
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
                {['Bill', 'Vendor', 'Amount', 'Paid', 'Outstanding', 'Days OD', 'Bucket'].map((h) => (
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
                    No outstanding payables.
                  </td>
                </tr>
              ) : (
                aging.map((r, i) => (
                  <tr key={r.invoiceNo} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link className="underline decoration-harvics-gold/50" href={`/${locale}/os/ap/bills/${r.id}`}>
                        {r.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.vendorName || '—'}</td>
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

      {!loading && tab === 'proposals' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[12px] text-harvics-burgundy/70">
            Proposed cash out: <strong className="font-mono">{fmt(proposeTotal)}</strong>
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Bill', 'Vendor', 'Propose', 'Days OD', 'Due', 'Action'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No payment proposals.
                  </td>
                </tr>
              ) : (
                proposals.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link className="underline decoration-harvics-gold/50" href={`/${locale}/os/ap/bills/${r.id}`}>
                        {r.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.vendorName || '—'}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{fmt(r.proposePay)}</td>
                    <td className="px-3 py-2">{r.daysOverdue}</td>
                    <td className="px-3 py-2">{r.dueDate || '—'}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => quickPay(r.invoiceNo, r.proposePay)}
                        className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'vendors' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Vendor', 'Bills', 'Open', 'Billed', 'Paid', 'Outstanding'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No AP vendors yet.
                  </td>
                </tr>
              ) : (
                vendors.map((v, i) => (
                  <tr key={v.vendorName} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-semibold">{v.vendorName}</td>
                    <td className="px-3 py-2">{v.billCount}</td>
                    <td className="px-3 py-2">{v.openCount}</td>
                    <td className="px-3 py-2 font-mono">{fmt(v.billed)}</td>
                    <td className="px-3 py-2 font-mono text-green-800">{fmt(v.paid)}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{fmt(v.outstanding)}</td>
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
