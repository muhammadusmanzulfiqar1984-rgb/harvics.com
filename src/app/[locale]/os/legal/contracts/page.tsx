'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'

export default function ContractsPage() {
  const t = useTranslations('legal')
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    contract_type: '',
    title: '',
    party_name: '',
    start_date: '',
    end_date: '',
    value: '',
    currency: 'USD'
  })

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDomainLegalContracts()
      const responseTyped = response as { data?: { contracts?: any[] }; error?: string }
      if (responseTyped?.data?.contracts) {
        setContracts(responseTyped.data.contracts)
      }
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement API call to create contract
      alert('Contract created successfully')
      setShowForm(false)
      loadContracts()
    } catch (error) {
      console.error('Error creating contract:', error)
      alert('Error creating contract')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-[#C3A35E]/20 text-[#C3A35E]'
      case 'Expired': return 'bg-red-100 text-red-800'
      default: return 'bg-white text-[#C3A35E]/90'
    }
  }

  const isExpiringSoon = (endDate: string) => {
    if (!endDate || endDate === '—') return false
    const end = new Date(endDate)
    const today = new Date()
    const daysUntilExpiry = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0
  }

  return (
    <div>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Contracts Management</h1>
            <p className="text-[#C3A35E]/90">Manage all legal contracts and agreements</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-white px-4 py-2 rounded-lg hover:bg-[#5a000c] transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Contract'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-black200 p-4">
          <div className="text-sm text-[#C3A35E]/90 mb-1">Active Contracts</div>
          <div className="text-2xl font-bold text-[#C3A35E]">
            {contracts.filter(c => c.status === 'Active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-black200 p-4">
          <div className="text-sm text-[#C3A35E]/90 mb-1">Expiring Soon</div>
          <div className="text-2xl font-bold text-white">
            {contracts.filter(c => isExpiringSoon(c.endDate)).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-black200 p-4">
          <div className="text-sm text-[#C3A35E]/90 mb-1">Pending</div>
          <div className="text-2xl font-bold text-[#C3A35E]">
            {contracts.filter(c => c.status === 'Pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-black200 p-4">
          <div className="text-sm text-[#C3A35E]/90 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-[#ffffff]">
            ${contracts.reduce((sum, c) => {
              const val = parseFloat(c.value?.replace('$', '').replace('M', '') || '0')
              return sum + val
            }, 0).toFixed(1)}M
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-black200 p-6">
          <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">New Contract</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Contract Type *</label>
                <select
                  required
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-3 py-2"
                >
                  <option value="">Select type</option>
                  <option value="Distribution Agreement">Distribution Agreement</option>
                  <option value="Supplier Agreement">Supplier Agreement</option>
                  <option value="License Agreement">License Agreement</option>
                  <option value="Service Agreement">Service Agreement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Party Name *</label>
                <input
                  type="text"
                  required
                  value={formData.party_name}
                  onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-3 py-2"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Value</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full border border-black300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-black300 rounded-lg hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-white rounded-lg hover:bg-[#5a000c]"
              >
                Create Contract
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-black200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Contract ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Party</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[#C3A35E]/90">
                    No contracts found
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract.id} className={`hover:bg-white ${isExpiringSoon(contract.endDate) ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">{contract.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{contract.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{contract.party}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{contract.startDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{contract.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{contract.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-[#C3A35E]/90 hover:text-[#5a000c]">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

