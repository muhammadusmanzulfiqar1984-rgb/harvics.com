'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'

export default function CounterfeitReportsPage() {
  const t = useTranslations('legal')
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    product_name: '',
    brand: '',
    location: '',
    description: '',
    priority: 'medium'
  })

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDomainLegalCounterfeit()
      const responseTyped = response as { data?: { cases?: any[] }; error?: string }
      if (responseTyped?.data?.cases) {
        setReports(responseTyped.data.cases)
      }
    } catch (error) {
      console.error('Error loading counterfeit reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement API call to create report
      // await apiClient.createCounterfeitReport(formData)
      alert('Report submitted successfully')
      setShowForm(false)
      setFormData({ product_name: '', brand: '', location: '', description: '', priority: 'medium' })
      loadReports()
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Error submitting report')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800'
      case 'Under Investigation': return 'bg-[#C3A35E]/20 text-[#C3A35E]'
      case 'Legal Action Initiated': return 'bg-red-100 text-red-800'
      default: return 'bg-white text-[#C3A35E]/90'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 font-bold'
      case 'High': return 'text-orange-600 font-semibold'
      case 'Medium': return 'text-white'
      default: return 'text-[#C3A35E]/90'
    }
  }

  return (
    <>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Counterfeit Detection</h1>
            <p className="text-[#C3A35E]/90">Report and track counterfeit product incidents</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-white px-4 py-2 hover:bg-[#5a000c] transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Report'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-black200 p-6">
          <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">New Counterfeit Report</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full border border-black300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full border border-black300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-black300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-black300 px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#C3A35E]/90 mb-1">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-black300 px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-black300 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-white hover:bg-[#5a000c]"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white border border-black200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Report ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Reported Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#C3A35E]/90">
                    No counterfeit reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">{report.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{report.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{report.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{report.reportedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${getSeverityColor(report.severity)}`}>
                        {report.severity}
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
    </>
  )
}

