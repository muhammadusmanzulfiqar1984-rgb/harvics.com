'use client'

import React, { useState, useEffect } from 'react'
import KPICard from '@/components/shared/KPICard'

interface Invoice {
  id: string
  invoiceNo: string
  customer: string
  amount: number
  currency: string
  status: string
  dueDate: string
}

interface Payment {
  id: string
  invoiceNo: string
  amount: number
  currency: string
  method: string
  reference: string
  receivedDate: string
}

export default function ARContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showRecordPayment, setShowRecordPayment] = useState(false)
  const [newPayment, setNewPayment] = useState({ invoiceNo: '', amount: '', method: 'Bank Transfer', reference: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [invRes, payRes] = await Promise.all([
        fetch('/api/finance/invoices?type=AR').then(r => r.json()),
        fetch('/api/finance/payments').then(r => r.json()),
      ])
      if (invRes.success) setInvoices(invRes.data)
      if (payRes.success) setPayments(payRes.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleRecordPayment = async () => {
    if (!newPayment.invoiceNo || !newPayment.amount) return
    try {
      const res = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPayment, amount: Number(newPayment.amount), currency: 'USD' })
      }).then(r => r.json())
      if (res.success) {
        setShowRecordPayment(false)
        setNewPayment({ invoiceNo: '', amount: '', method: 'Bank Transfer', reference: '' })
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-[#E5E5EA]"></div></div>

  const unpaid = invoices.filter(i => i.status !== 'Paid')
  const overdue = invoices.filter(i => i.status === 'Overdue')
  const totalAR = unpaid.reduce((s, i) => s + i.amount, 0)
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Outstanding AR" value={`$${(totalAR / 1000).toFixed(1)}K`} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v7M6 6h3.5a1 1 0 010 2H6.5a1 1 0 000 2H10"/></svg>} />
        <KPICard label="Collected" value={`$${(totalCollected / 1000).toFixed(1)}K`} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>} change={{ value: 8, trend: 'up' }} />
        <KPICard label="Overdue" value={overdue.length} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M8 2L1.5 13.5h13L8 2z"/><path d="M8 7v3M8 11.5v.5"/></svg>} change={overdue.length > 0 ? { value: overdue.length, trend: 'down' } : undefined} />
        <KPICard label="DSO (Days)" value="28" icon="📅" change={{ value: 7, trend: 'up', label: 'industry avg: 35' }} />
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-[#1D1D1F]">Unpaid Invoices ({unpaid.length})</h4>
        <button onClick={() => setShowRecordPayment(!showRecordPayment)}
          className="px-4 py-2 text-sm font-bold text-white" style={{ background: '#6B1F2B', borderRadius: 0 }}>
          💳 Record Payment
        </button>
      </div>

      {showRecordPayment && (
        <div className="bg-[#F5F0E8] border border-[#E5E5EA]/30 p-4 space-y-3" style={{ borderRadius: 0 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={newPayment.invoiceNo} onChange={e => setNewPayment(p => ({ ...p, invoiceNo: e.target.value }))}
              className="px-3 py-2 border border-[#E5E5EA]/30 text-sm" style={{ borderRadius: 0 }}>
              <option value="">Select Invoice</option>
              {unpaid.map(inv => <option key={inv.id} value={inv.invoiceNo}>{inv.invoiceNo} — {inv.customer}</option>)}
            </select>
            <input placeholder="Amount" type="number" value={newPayment.amount}
              onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))}
              className="px-3 py-2 border border-[#E5E5EA]/30 text-sm" style={{ borderRadius: 0 }} />
            <select value={newPayment.method} onChange={e => setNewPayment(p => ({ ...p, method: e.target.value }))}
              className="px-3 py-2 border border-[#E5E5EA]/30 text-sm" style={{ borderRadius: 0 }}>
              <option>Bank Transfer</option><option>Cash</option><option>Cheque</option><option>Credit Card</option>
            </select>
            <input placeholder="Reference #" value={newPayment.reference}
              onChange={e => setNewPayment(p => ({ ...p, reference: e.target.value }))}
              className="px-3 py-2 border border-[#E5E5EA]/30 text-sm" style={{ borderRadius: 0 }} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleRecordPayment} className="px-4 py-2 text-sm font-bold text-white" style={{ background: '#6B1F2B', borderRadius: 0 }}>Record</button>
            <button onClick={() => setShowRecordPayment(false)} className="px-4 py-2 text-sm font-bold border border-[#6B1F2B] text-[#1D1D1F]" style={{ borderRadius: 0 }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Invoice #</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Amount</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {unpaid.map((inv, i) => (
              <tr key={inv.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F0E8]/50'}>
                <td className="px-4 py-3 font-mono font-semibold text-[#1D1D1F]">{inv.invoiceNo}</td>
                <td className="px-4 py-3 text-[#6B1F2B]">{inv.customer}</td>
                <td className="px-4 py-3 text-right font-bold">{inv.currency} {inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-bold ${inv.status === 'Overdue' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{inv.status}</span>
                </td>
                <td className="px-4 py-3 text-[#8E8E93]">{inv.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Payments */}
      <div>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-3">Recent Payments ({payments.length})</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-4 py-2 text-left">Invoice</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-left">Method</th>
              <th className="px-4 py-2 text-left">Reference</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr></thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F0E8]/50'}>
                  <td className="px-4 py-2 font-mono">{p.invoiceNo}</td>
                  <td className="px-4 py-2 text-right font-bold text-[#1D1D1F]">{p.currency} {p.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">{p.method}</td>
                  <td className="px-4 py-2 font-mono text-xs">{p.reference}</td>
                  <td className="px-4 py-2 text-[#8E8E93]">{p.receivedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
