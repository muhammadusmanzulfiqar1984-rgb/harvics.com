'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { fetchArInvoices, fetchCreditLimits } from '@/lib/distributorPortal'

export default function InvoicesAndPayments() {
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState('Open')
  const [invoices, setInvoices] = useState<any[]>([])
  const [credit, setCredit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const [inv, limits] = await Promise.all([fetchArInvoices(), fetchCreditLimits()])
        setInvoices(inv)
        setCredit(limits[0] || null)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const grouped = {
    Open: invoices.filter((i) => i.status !== 'Paid' && i.status !== 'Overdue'),
    Paid: invoices.filter((i) => i.status === 'Paid'),
    Overdue: invoices.filter((i) => i.status === 'Overdue'),
  }

  const creditInfo = credit
    ? { limit: credit.limit, utilised: credit.used, available: credit.available }
    : { limit: 0, utilised: 0, available: 0 }

  return (
    <div className="space-y-6">
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4" />
      <h1 className="text-2xl font-bold text-harvics-burgundy">Invoices & Payments</h1>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white border p-6">
          <h2 className="text-lg font-bold text-harvics-burgundy mb-4">Credit</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-gray-600">Limit</span><div className="text-xl font-bold">${creditInfo.limit.toLocaleString()}</div></div>
            <div><span className="text-gray-600">Used</span><div className="text-xl font-bold">${creditInfo.utilised.toLocaleString()}</div></div>
            <div><span className="text-gray-600">Available</span><div className="text-xl font-bold text-green-700">${creditInfo.available.toLocaleString()}</div></div>
          </div>
        </div>
        <div className="lg:col-span-3 bg-white border overflow-hidden">
          <div className="flex border-b">
            {(['Open', 'Paid', 'Overdue'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold ${activeTab === tab ? 'border-b-2 border-harvics-burgundy' : ''}`}>
                {tab} ({grouped[tab].length})
              </button>
            ))}
          </div>
          {loading ? (
            <p className="p-8 text-center text-sm text-gray-600">Loading invoices…</p>
          ) : grouped[activeTab as keyof typeof grouped].length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-600">No {activeTab.toLowerCase()} invoices — AR data appears after Module #3 billing.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#F5F0E8]">
                <tr>
                  {['Invoice', 'Customer', 'Amount', 'Due', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {grouped[activeTab as keyof typeof grouped].map((inv) => (
                  <tr key={inv.id || inv.invoiceId}>
                    <td className="px-4 py-3 font-semibold">{inv.invoiceId || inv.id}</td>
                    <td className="px-4 py-3">{inv.customer || inv.customerName || '—'}</td>
                    <td className="px-4 py-3">${Number(inv.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">{inv.dueDate || '—'}</td>
                    <td className="px-4 py-3">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
