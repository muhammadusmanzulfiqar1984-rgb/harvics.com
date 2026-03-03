'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function InvoicesAndPayments() {
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState('Open')

  const invoices = {
    Open: [
      { id: 'INV-001', orderId: 'ORD-12345', date: '2025-01-10', amount: 15000, dueDate: '2025-01-25', aging: 15, status: 'Open' },
      { id: 'INV-002', orderId: 'ORD-12346', date: '2025-01-05', amount: 8500, dueDate: '2025-01-20', aging: 20, status: 'Open' },
    ],
    Paid: [
      { id: 'INV-003', orderId: 'ORD-12340', date: '2024-12-20', amount: 12000, dueDate: '2025-01-05', aging: 0, status: 'Paid' },
      { id: 'INV-004', orderId: 'ORD-12341', date: '2024-12-15', amount: 9500, dueDate: '2024-12-30', aging: 0, status: 'Paid' },
    ],
    Overdue: [
      { id: 'INV-005', orderId: 'ORD-12338', date: '2024-11-20', amount: 8000, dueDate: '2024-12-20', aging: 65, status: 'Overdue' },
    ]
  }

  const creditInfo = {
    limit: 200000,
    utilised: 23500,
    available: 176500
  }

  const getAgingColor = (aging: number) => {
    if (aging <= 30) return 'text-green-600'
    if (aging <= 60) return 'text-white'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#C3A35E]">Invoices & Payments</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Side Info - Credit */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-black200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#C3A35E] mb-4">Credit Information</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-[#C3A35E]/90 mb-1">Credit Limit</div>
              <div className="text-xl font-bold text-[#C3A35E]">${(creditInfo.limit / 1000).toFixed(0)}k</div>
            </div>
            <div>
              <div className="text-sm text-[#C3A35E]/90 mb-1">Credit Utilised</div>
              <div className="text-xl font-bold text-white">${(creditInfo.utilised / 1000).toFixed(1)}k</div>
            </div>
            <div>
              <div className="text-sm text-[#C3A35E]/90 mb-1">Available Credit</div>
              <div className="text-xl font-bold text-green-600">${(creditInfo.available / 1000).toFixed(1)}k</div>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${(creditInfo.utilised / creditInfo.limit) * 100}%` }}
              ></div>
            </div>
            <button className="w-full bg-white text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Request Limit Increase
            </button>
          </div>
        </div>

        {/* Main Content - Invoices */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-black200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-black200">
            <div className="flex">
              {['Open', 'Paid', 'Overdue'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-semibold transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-white text-[#C3A35E]/90'
                      : 'text-[#C3A35E]/90 hover:text-[#C3A35E]/90'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Invoice ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Aging</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices[activeTab as keyof typeof invoices].map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-white">
                    <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">{invoice.id}</td>
                    <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{invoice.orderId}</td>
                    <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{invoice.date}</td>
                    <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">${invoice.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{invoice.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-[#C3A35E]/20 text-[#C3A35E]'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold ${getAgingColor(invoice.aging)}`}>
                      {invoice.aging} days
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-white hover:underline text-sm font-semibold">
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

