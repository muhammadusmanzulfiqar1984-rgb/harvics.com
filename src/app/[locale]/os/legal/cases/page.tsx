'use client'

import { useState, useEffect } from 'react'

interface LegalCase {
  id: string
  case_title: string
  case_type: string
  country: string
  description: string
  assigned_to: string
  status: string
  hearing_date: string | null
  documents: string[]
  created_at: string
}

export default function LegalCasesPage() {
  const [cases, setCases] = useState<LegalCase[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null)
  const [formData, setFormData] = useState({
    case_title: '',
    case_type: '',
    country: '',
    description: '',
    assigned_to: '',
    status: 'open',
    hearing_date: '',
    documents: [] as string[]
  })

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.getLegalCases()
      // if (response.data) {
      //   setCases(response.data)
      // }
      
      // Mock data for now
      setCases([
        {
          id: '1',
          case_title: 'Trademark Dispute - Brand XYZ',
          case_type: 'Trademark',
          country: 'US',
          description: 'Dispute regarding trademark infringement',
          assigned_to: 'John Doe',
          status: 'open',
          hearing_date: '2024-02-15',
          documents: ['complaint.pdf'],
          created_at: '2024-01-10T10:00:00Z'
        }
      ])
    } catch (error) {
      console.error('Error loading cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (caseId: string, newStatus: string) => {
    try {
      // TODO: Replace with actual API call
      // await apiClient.updateLegalCaseStatus(caseId, newStatus)
      setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c))
    } catch (error) {
      console.error('Error updating case status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-[#C3A35E]/20 text-[#C3A35E]',
      closed: 'bg-green-100 text-green-800',
      cancelled: 'bg-white text-[#C3A35E]/90'
    }
    return statusStyles[status] || 'bg-white text-[#C3A35E]/90'
  }

  const statusOptions = ['open', 'in-progress', 'closed', 'cancelled']

  return (
    <div>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Legal Cases</h1>
            <p className="text-[#C3A35E]/90">Manage legal cases and track their status</p>
          </div>
        <button
          onClick={() => {
            setSelectedCase(null)
            setFormData({
              case_title: '',
              case_type: '',
              country: '',
              description: '',
              assigned_to: '',
              status: 'open',
              hearing_date: '',
              documents: []
            })
            setShowForm(true)
          }}
          className="bg-white text-[#C3A35E]/90 px-6 py-2 font-semibold hover:bg-white/90 transition-colors"
        >
            + New Case
          </button>
        </div>
      </div>

      {/* Case Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-white0 bg-opacity-75 transition-opacity" onClick={() => setShowForm(false)}></div>
            
            <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-[#C3A35E]">
                    {selectedCase ? 'Edit Case' : 'New Legal Case'}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-[#C3A35E]/90 hover:text-[#C3A35E]/90"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Case Title *</label>
                    <input
                      type="text"
                      value={formData.case_title}
                      onChange={(e) => setFormData({ ...formData, case_title: e.target.value })}
                      className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Case Type *</label>
                      <input
                        type="text"
                        value={formData.case_type}
                        onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                        className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Country *</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Assigned To</label>
                      <input
                        type="text"
                        value={formData.assigned_to}
                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                        className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Hearing Date</label>
                    <input
                      type="date"
                      value={formData.hearing_date}
                      onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                      className="w-full px-3 py-2 border border-black300 focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    // TODO: Save case
                    setShowForm(false)
                  }}
                  className="w-full inline-flex justify-center border border-transparent shadow-sm px-4 py-2 bg-white text-[#C3A35E]/90 font-semibold hover:bg-white/90 sm:ml-3 sm:w-auto"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="mt-3 w-full inline-flex justify-center border border-black300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-[#C3A35E]/90 hover:bg-white sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cases Table */}
      <div className="bg-white border border-black200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-[#C3A35E]/90">Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#C3A35E]/90">No legal cases found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-black200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Case Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Hearing Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((legalCase) => (
                  <tr key={legalCase.id} className="hover:bg-white">
                    <td className="px-6 py-4 text-sm font-medium text-[#C3A35E]/90">
                      {legalCase.case_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                      {legalCase.case_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                      {legalCase.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                      {legalCase.assigned_to || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={legalCase.status}
                        onChange={(e) => handleStatusUpdate(legalCase.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusBadge(legalCase.status)}`}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">
                      {legalCase.hearing_date ? new Date(legalCase.hearing_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedCase(legalCase)
                          setFormData({
                            case_title: legalCase.case_title,
                            case_type: legalCase.case_type,
                            country: legalCase.country,
                            description: legalCase.description,
                            assigned_to: legalCase.assigned_to,
                            status: legalCase.status,
                            hearing_date: legalCase.hearing_date || '',
                            documents: legalCase.documents
                          })
                          setShowForm(true)
                        }}
                        className="text-white hover:text-[#C3A35E]/90"
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
    </div>
  )
}

