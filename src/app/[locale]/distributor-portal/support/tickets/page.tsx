'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function Tickets() {
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState('Open')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const tickets = {
    Open: [
      { id: 'TKT-001', date: '2025-01-15', category: 'Product', subject: 'Product quality issue', status: 'Open', lastUpdate: '2025-01-16' },
      { id: 'TKT-002', date: '2025-01-18', category: 'Finance', subject: 'Invoice discrepancy', status: 'Open', lastUpdate: '2025-01-19' },
    ],
    'In Progress': [
      { id: 'TKT-003', date: '2025-01-12', category: 'Logistics', subject: 'Delivery delay inquiry', status: 'In Progress', lastUpdate: '2025-01-20' },
    ],
    Resolved: [
      { id: 'TKT-004', date: '2025-01-05', category: 'Portal', subject: 'Login issue', status: 'Resolved', lastUpdate: '2025-01-06' },
    ],
    Closed: []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#C3A35E]">Support Tickets</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-white px-6 py-2 font-semibold hover:opacity-90 transition-opacity"
        >
          Create Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-black200 shadow-sm overflow-hidden">
        <div className="border-b border-black200">
          <div className="flex">
            {['Open', 'In Progress', 'Resolved', 'Closed'].map(tab => (
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

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets[activeTab as keyof typeof tickets].map((ticket) => (
                <tr key={ticket.id} className="hover:bg-white">
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">{ticket.id}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{ticket.date}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{ticket.category}</td>
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">{ticket.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ticket.status === 'Open' ? 'bg-[#C3A35E]/20 text-[#C3A35E]' :
                      ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      'bg-white text-[#C3A35E]/90'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{ticket.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#C3A35E]">Create New Ticket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#C3A35E]/90 hover:text-[#C3A35E]/90"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Category *</label>
                <select className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black" required>
                  <option value="">Select Category</option>
                  <option value="Product">Product</option>
                  <option value="Finance">Finance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Portal">Portal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Subject *</label>
                <input type="text" className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Description *</label>
                <textarea rows={5} className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Order ID (Optional)</label>
                <select className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black">
                  <option value="">Select Order</option>
                  <option value="ORD-12345">ORD-12345</option>
                  <option value="ORD-12346">ORD-12346</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Upload File/Image (Optional)</label>
                <input type="file" className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Priority *</label>
                <select className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black" required>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="flex-1 bg-white text-white px-6 py-3 font-semibold hover:opacity-90 transition-opacity">
                  Submit Ticket
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-white text-[#C3A35E]/90 px-6 py-3 font-semibold hover:bg-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

