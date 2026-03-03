'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface InvoiceListContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

interface Invoice {
  id: string
  orderId: string
  customer: string
  amount: number
  status: 'draft' | 'issued' | 'paid' | 'overdue'
  dueDate: string
  currency: string
}

export default function InvoiceListContent({ persona, locale }: InvoiceListContentProps) {
  const t = useTranslations('crm')
  const { selectedCountry } = useCountry()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [selectedCountry, persona])

  const loadInvoices = async () => {
    setLoading(true)
    setError(null)
    try {
      // In a real implementation, this would call apiClient.getDomainFinance({ type: 'invoices' })
      // For now, we mock it based on the verified design pattern
      await new Promise(resolve => setTimeout(resolve, 800))
      // To test the error case, uncomment the following line
      // throw new Error('Failed to fetch invoices')
      setInvoices([
        { id: 'INV-2024-001', orderId: 'ORD-001', customer: 'Customer A', amount: 125000, status: 'paid', dueDate: '2024-01-30', currency: 'USD' },
        { id: 'INV-2024-002', orderId: 'ORD-002', customer: 'Customer B', amount: 89000, status: 'issued', dueDate: '2024-02-15', currency: 'USD' },
        { id: 'INV-2024-003', orderId: 'ORD-003', customer: 'Customer C', amount: 156000, status: 'draft', dueDate: '2024-02-20', currency: 'USD' },
        { id: 'INV-2024-004', orderId: 'ORD-004', customer: 'Customer D', amount: 45000, status: 'overdue', dueDate: '2024-01-10', currency: 'USD' }
      ])
    } catch (error) {
      setError('Failed to load invoices. Please try again later.')
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalInvoices = invoices.length
  const totalValue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length
  const paidCount = invoices.filter(i => i.status === 'paid').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
      </div>
    )
  }
  
  if (error) {
    return <div className="p-12 text-center text-red-500">{error}</div>
  }

  if (invoices.length === 0) {
    return <div className="p-12 text-center">No invoices available.</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Invoicing & Billing</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + Generate Invoice
        </button>
      </div>

      {/* Invoice Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Invoices"
          value={totalInvoices}
          icon="📄"
        />
        <KPICard
          label="Total Value"
          value={`$${(totalValue / 1000).toFixed(1)}k`}
          icon="💰"
        />
        <KPICard
          label="Paid"
          value={paidCount}
          icon="✅"
        />
        <KPICard
          label="Overdue"
          value={overdueCount}
          icon="⚠️"
          change={overdueCount > 0 ? { value: 5, trend: 'down', label: 'last week' } : undefined}
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-black200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F2F2F2]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Invoice ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Order Ref</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-black font-medium">{inv.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{inv.orderId}</td>
                    <td className="px-4 py-3 text-sm text-black">{inv.customer}</td>
                    <td className="px-4 py-3 text-sm text-black font-medium">
                      {inv.currency} {inv.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                        inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        inv.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-black">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="text-[#C3A35E] hover:underline font-medium">View PDF</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
