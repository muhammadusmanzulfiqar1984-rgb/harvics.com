'use client'

import React, { useState, useEffect } from 'react'
import KPICard from '@/components/shared/KPICard'

interface GLOverviewContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

interface FinanceSummary {
  totalReceivable: number
  totalCollected: number
  overdueInvoices: number
  totalInvoices: number
  totalPayments: number
  totalJournalEntries: number
}

interface Invoice {
  id: string
  invoiceNo: string
  customer: string
  amount: number
  currency: string
  status: string
  dueDate: string
  type: string
}

interface JournalEntry {
  id: string
  entryNo: string
  description: string
  debit: string
  credit: string
  amount: number
  currency: string
  postedDate: string
}

export default function GLOverviewContent({ persona, locale }: GLOverviewContentProps) {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'journal'>('overview')
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [newInvoice, setNewInvoice] = useState({ customer: '', amount: '', currency: 'USD', dueDate: '' })

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [summaryRes, invoicesRes, journalRes] = await Promise.all([
        fetch('/api/finance/summary').then(r => r.json()),
        fetch('/api/finance/invoices').then(r => r.json()),
        fetch('/api/finance/journal').then(r => r.json()),
      ])
      if (summaryRes.success) setSummary(summaryRes.data)
      if (invoicesRes.success) setInvoices(invoicesRes.data)
      if (journalRes.success) setJournal(journalRes.data)
    } catch (error) {
      console.error('Error loading finance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async () => {
    if (!newInvoice.customer || !newInvoice.amount) return
    try {
      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newInvoice, amount: Number(newInvoice.amount), type: 'AR' })
      }).then(r => r.json())
      if (res.success) {
        setInvoices(prev => [res.data, ...prev])
        setNewInvoice({ customer: '', amount: '', currency: 'USD', dueDate: '' })
        setShowCreateInvoice(false)
        loadAll()
      }
    } catch (e) { console.error('Create invoice failed:', e) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-[#C3A35E]" style={{ borderRadius: 0 }}></div>
      </div>
    )
  }

  const statusColor = (s: string) => {
    if (s === 'Paid') return 'bg-green-100 text-green-800'
    if (s === 'Overdue') return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Accounts Receivable" value={`$${((summary?.totalReceivable || 0) / 1000).toFixed(1)}K`} icon="💰"
          change={{ value: 12, trend: 'up', label: 'last month' }} />
        <KPICard label="Collected" value={`$${((summary?.totalCollected || 0) / 1000).toFixed(1)}K`} icon="✅"
          change={{ value: 8, trend: 'up', label: 'last month' }} />
        <KPICard label="Overdue Invoices" value={summary?.overdueInvoices || 0} icon="⚠️"
          change={{ value: summary?.overdueInvoices ? 5 : 0, trend: summary?.overdueInvoices ? 'down' : 'neutral' }} />
        <KPICard label="Journal Entries" value={summary?.totalJournalEntries || 0} icon="📝" />
      </div>

      {/* Tab Bar */}
      <div className="flex gap-0 border-b border-[#C3A35E]/30">
        {(['overview', 'invoices', 'journal'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              borderBottom: activeTab === tab ? '3px solid #C3A35E' : '3px solid transparent',
              color: activeTab === tab ? '#6B1F2B' : '#6B1F2B99',
              background: activeTab === tab ? '#F5F1E8' : 'transparent',
            }}>
            {tab === 'overview' ? '📊 Overview' : tab === 'invoices' ? '🧾 Invoices' : '📒 Journal'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#C3A35E]/20 p-6" style={{ borderRadius: 0 }}>
            <h4 className="text-lg font-bold text-[#6B1F2B] mb-4">Financial Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-[#F5F1E8]">
                <span className="text-[#6B1F2B]/70">Total Invoices</span>
                <span className="font-bold text-[#6B1F2B]">{summary?.totalInvoices}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F5F1E8]">
                <span className="text-[#6B1F2B]/70">Total Payments</span>
                <span className="font-bold text-[#6B1F2B]">{summary?.totalPayments}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F5F1E8]">
                <span className="text-[#6B1F2B]/70">Outstanding AR</span>
                <span className="font-bold text-[#6B1F2B]">${(summary?.totalReceivable || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F5F1E8]">
                <span className="text-[#6B1F2B]/70">Collections</span>
                <span className="font-bold text-green-700">${(summary?.totalCollected || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-[#F5F1E8] border-l-4 border-[#C3A35E] p-4" style={{ borderRadius: 0 }}>
            <div className="flex items-start gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <h5 className="font-bold text-[#6B1F2B] text-sm">AI Finance Insight</h5>
                <p className="text-[#6B1F2B]/80 text-sm mt-1">
                  {summary?.overdueInvoices
                    ? `${summary.overdueInvoices} invoice(s) overdue. Consider offering 2% early payment discount to reduce DSO by ~7 days. Expected cash recovery: $${Math.round((summary.totalReceivable || 0) * 0.7).toLocaleString()}.`
                    : 'All invoices are current. Cash flow is healthy.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-[#6B1F2B]">Invoices ({invoices.length})</h4>
            <button onClick={() => setShowCreateInvoice(!showCreateInvoice)}
              className="px-4 py-2 text-sm font-bold text-white transition-colors"
              style={{ background: '#6B1F2B', borderRadius: 0 }}>
              + New Invoice
            </button>
          </div>

          {/* Create Invoice Form */}
          {showCreateInvoice && (
            <div className="bg-[#F5F1E8] border border-[#C3A35E]/30 p-4 space-y-3" style={{ borderRadius: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input placeholder="Customer name" value={newInvoice.customer}
                  onChange={e => setNewInvoice(p => ({ ...p, customer: e.target.value }))}
                  className="px-3 py-2 border border-[#C3A35E]/30 text-sm" style={{ borderRadius: 0 }} />
                <input placeholder="Amount" type="number" value={newInvoice.amount}
                  onChange={e => setNewInvoice(p => ({ ...p, amount: e.target.value }))}
                  className="px-3 py-2 border border-[#C3A35E]/30 text-sm" style={{ borderRadius: 0 }} />
                <select value={newInvoice.currency}
                  onChange={e => setNewInvoice(p => ({ ...p, currency: e.target.value }))}
                  className="px-3 py-2 border border-[#C3A35E]/30 text-sm" style={{ borderRadius: 0 }}>
                  <option>USD</option><option>AED</option><option>PKR</option><option>GBP</option><option>EUR</option>
                </select>
                <input type="date" value={newInvoice.dueDate}
                  onChange={e => setNewInvoice(p => ({ ...p, dueDate: e.target.value }))}
                  className="px-3 py-2 border border-[#C3A35E]/30 text-sm" style={{ borderRadius: 0 }} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateInvoice}
                  className="px-4 py-2 text-sm font-bold text-white" style={{ background: '#6B1F2B', borderRadius: 0 }}>
                  Create Invoice
                </button>
                <button onClick={() => setShowCreateInvoice(false)}
                  className="px-4 py-2 text-sm font-bold border border-[#6B1F2B] text-[#6B1F2B]" style={{ borderRadius: 0 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Invoice Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#6B1F2B] text-white">
                  <th className="px-4 py-3 text-left font-semibold">Invoice #</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F1E8]/50'}>
                    <td className="px-4 py-3 font-mono text-[#6B1F2B] font-bold">{inv.invoiceNo}</td>
                    <td className="px-4 py-3 text-[#6B1F2B]">{inv.customer}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#6B1F2B]">
                      {inv.currency} {inv.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-bold ${statusColor(inv.status)}`} style={{ borderRadius: 0 }}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6B1F2B]/70">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-[#C3A35E] hover:text-[#6B1F2B] font-bold text-xs">View</button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6B1F2B]/50">No invoices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Journal Tab */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-[#6B1F2B]">Journal Entries ({journal.length})</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#6B1F2B] text-white">
                  <th className="px-4 py-3 text-left font-semibold">Entry #</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Debit</th>
                  <th className="px-4 py-3 text-left font-semibold">Credit</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {journal.map((je, i) => (
                  <tr key={je.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F1E8]/50'}>
                    <td className="px-4 py-3 font-mono text-[#6B1F2B] font-bold">{je.entryNo}</td>
                    <td className="px-4 py-3 text-[#6B1F2B]">{je.description}</td>
                    <td className="px-4 py-3 text-[#6B1F2B]/70">{je.debit}</td>
                    <td className="px-4 py-3 text-[#6B1F2B]/70">{je.credit}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#6B1F2B]">
                      {je.currency} {je.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[#6B1F2B]/70">{je.postedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

