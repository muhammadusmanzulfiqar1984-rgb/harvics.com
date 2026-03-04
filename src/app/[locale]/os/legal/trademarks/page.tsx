'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface Trademark {
  id: string
  brand_name: string
  class_number: string
  country: string
  application_no: string
  status: string
  expiry_date: string | null
  documents: string[]
  created_at: string
  updated_at: string
}

export default function TrademarksPage() {
  const [trademarks, setTrademarks] = useState<Trademark[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCountry, setFilterCountry] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [selectedTrademark, setSelectedTrademark] = useState<Trademark | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const [formData, setFormData] = useState({
    brand_name: '',
    class_number: '',
    country: '',
    application_no: '',
    status: 'pending',
    expiry_date: '',
    documents: [] as string[]
  })

  useEffect(() => {
    loadTrademarks()
  }, [filterCountry, filterStatus])

  const loadTrademarks = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getTrademarks({ 
        country: filterCountry || undefined, 
        status: filterStatus || undefined 
      })
      const responseTyped = response as { data?: any[]; error?: string }
      if (responseTyped.data) {
        setTrademarks(Array.isArray(responseTyped.data) ? responseTyped.data : [])
      }
    } catch (error) {
      console.error('Error loading trademarks:', error)
      // Fallback to empty array on error
      setTrademarks([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTrademarks = trademarks.filter(tm => {
    if (filterCountry && tm.country !== filterCountry) return false
    if (filterStatus && tm.status !== filterStatus) return false
    return true
  })

  const handleView = (trademark: Trademark) => {
    setSelectedTrademark(trademark)
    setIsEditMode(false)
    setFormData({
      brand_name: trademark.brand_name,
      class_number: trademark.class_number,
      country: trademark.country,
      application_no: trademark.application_no,
      status: trademark.status,
      expiry_date: trademark.expiry_date || '',
      documents: trademark.documents
    })
    setIsModalOpen(true)
  }

  const handleEdit = (trademark: Trademark) => {
    setSelectedTrademark(trademark)
    setIsEditMode(true)
    setFormData({
      brand_name: trademark.brand_name,
      class_number: trademark.class_number,
      country: trademark.country,
      application_no: trademark.application_no,
      status: trademark.status,
      expiry_date: trademark.expiry_date || '',
      documents: trademark.documents
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (isEditMode && selectedTrademark) {
        await apiClient.updateTrademark(selectedTrademark.id, formData)
      } else {
        await apiClient.createTrademark(formData)
      }
      
      setIsModalOpen(false)
      loadTrademarks()
    } catch (error) {
      console.error('Error saving trademark:', error)
      alert('Failed to save trademark. Please try again.')
    }
  }

  const handleAddNew = () => {
    setSelectedTrademark(null)
    setIsEditMode(true)
    setFormData({
      brand_name: '',
      class_number: '',
      country: '',
      application_no: '',
      status: 'pending',
      expiry_date: '',
      documents: []
    })
    setIsModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-[#C3A35E]/20 text-[#C3A35E]',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-white text-[#C3A35E]/90'
    }
    return statusStyles[status] || 'bg-white text-[#C3A35E]/90'
  }

  const countries = ['US', 'GB', 'AE', 'PK', 'FR', 'DE', 'IT', 'ES', 'CN', 'JP']
  const statuses = ['active', 'pending', 'expired', 'cancelled']

  return (
    <>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Trademarks</h1>
            <p className="text-[#C3A35E]/90">Manage trademark registrations and applications</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-white text-[#C3A35E]/90 px-6 py-2 font-semibold hover:bg-white/90 transition-colors"
          >
            + Add New Trademark
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-black200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Country</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterCountry('')
                setFilterStatus('')
              }}
              className="w-full px-4 py-2 text-sm text-[#C3A35E]/90 border border-black300 hover:bg-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-[#C3A35E]/90">Loading trademarks...</p>
          </div>
        ) : filteredTrademarks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#C3A35E]/90">No trademarks found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-black200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Brand Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Application No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrademarks.map((trademark) => (
                  <tr key={trademark.id} className="hover:bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">
                      {trademark.brand_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                      {trademark.class_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                      {trademark.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                      {trademark.application_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(trademark.status)}`}>
                        {trademark.status.charAt(0).toUpperCase() + trademark.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                      {trademark.expiry_date ? new Date(trademark.expiry_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleView(trademark)}
                        className="text-white hover:text-[#C3A35E]/90 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(trademark)}
                        className="text-[#C3A35E]/90 hover:text-[#C3A35E]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-white0 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-[#C3A35E]">
                    {isEditMode ? (selectedTrademark ? 'Edit Trademark' : 'Add New Trademark') : 'View Trademark'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-[#C3A35E]/90 hover:text-[#C3A35E]/90"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Brand Name *</label>
                      <input
                        type="text"
                        value={formData.brand_name}
                        onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                        className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Class Number</label>
                        <input
                          type="text"
                          value={formData.class_number}
                          onChange={(e) => setFormData({ ...formData, class_number: e.target.value })}
                          className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Country *</label>
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        >
                          <option value="">Select Country</option>
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Application Number</label>
                        <input
                          type="text"
                          value={formData.application_no}
                          onChange={(e) => setFormData({ ...formData, application_no: e.target.value })}
                          className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Status *</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Documents</label>
                      <div className="border border-black300 p-4">
                        {formData.documents.length > 0 ? (
                          <ul className="space-y-2">
                            {formData.documents.map((doc, idx) => (
                              <li key={idx} className="text-sm text-[#C3A35E]/90 flex items-center justify-between">
                                <span>{doc}</span>
                                <button
                                  onClick={() => setFormData({ ...formData, documents: formData.documents.filter((_, i) => i !== idx) })}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-[#C3A35E]/90">No documents attached</p>
                        )}
                        <button className="mt-2 text-sm text-white hover:text-[#C3A35E]/90">
                          + Add Document
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Brand Name</label>
                      <p className="text-sm text-[#C3A35E]/90">{formData.brand_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Class Number</label>
                        <p className="text-sm text-[#C3A35E]/90">{formData.class_number || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Country</label>
                        <p className="text-sm text-[#C3A35E]/90">{formData.country}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Application Number</label>
                        <p className="text-sm text-[#C3A35E]/90">{formData.application_no || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Status</label>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(formData.status)}`}>
                          {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Expiry Date</label>
                      <p className="text-sm text-[#C3A35E]/90">{formData.expiry_date ? new Date(formData.expiry_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Documents</label>
                      {formData.documents.length > 0 ? (
                        <ul className="space-y-2">
                          {formData.documents.map((doc, idx) => (
                            <li key={idx} className="text-sm text-[#C3A35E]/90">
                              <a href="#" className="text-white hover:text-[#C3A35E]/90">{doc}</a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-[#C3A35E]/90">No documents attached</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {isEditMode && (
                  <button
                    onClick={handleSave}
                    className="w-full inline-flex justify-center border border-transparent shadow-sm px-4 py-2 bg-white text-[#C3A35E]/90 font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:ml-3 sm:w-auto"
                  >
                    Save
                  </button>
                )}
                {!isEditMode && (
                  <button
                    onClick={() => {
                      if (selectedTrademark) {
                        handleEdit(selectedTrademark)
                      }
                    }}
                    className="w-full inline-flex justify-center border border-transparent shadow-sm px-4 py-2 bg-white text-[#C3A35E]/90 font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:ml-3 sm:w-auto"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center border border-black300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-[#C3A35E]/90 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:mt-0 sm:ml-3 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

