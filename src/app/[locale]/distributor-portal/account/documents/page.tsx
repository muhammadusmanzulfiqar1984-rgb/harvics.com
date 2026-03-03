'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'

export default function Documents() {
  const locale = useLocale()
  const [showUploadModal, setShowUploadModal] = useState(false)

  const documents = [
    { name: 'Distribution Agreement 2025', type: 'Contract', uploadedOn: '2025-01-01', expiryDate: '2025-12-31' },
    { name: 'Business License', type: 'License', uploadedOn: '2024-06-15', expiryDate: '2025-06-14' },
    { name: 'Tax Certificate', type: 'Compliance', uploadedOn: '2024-12-01', expiryDate: null },
    { name: 'Invoice January 2025', type: 'Invoice', uploadedOn: '2025-01-15', expiryDate: null },
  ]

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Contract': return 'bg-blue-100 text-blue-800'
      case 'License': return 'bg-green-100 text-green-800'
      case 'Compliance': return 'bg-purple-100 text-purple-800'
      case 'Invoice': return 'bg-[#C3A35E]/20 text-[#C3A35E]'
      default: return 'bg-white text-[#C3A35E]/90'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#C3A35E]">Documents</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#C3A35E] text-[#6B1F2B] px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Upload Document
        </button>
      </div>

      <div className="bg-white rounded-lg border border-black200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Document Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Uploaded On</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc, index) => (
                <tr key={index} className="hover:bg-white">
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">{doc.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(doc.type)}`}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{doc.uploadedOn}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">
                    {doc.expiryDate || <span className="text-[#C3A35E]/90">N/A</span>}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#C3A35E] hover:underline text-sm font-semibold">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#C3A35E]">Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#C3A35E]/90 hover:text-[#C3A35E]/90"
              >
                ✕
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Document Name *</label>
                <input type="text" className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Type *</label>
                <select className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black" required>
                  <option value="">Select Type</option>
                  <option value="Contract">Contract</option>
                  <option value="License">License</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Expiry Date (Optional)</label>
                <input type="date" className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Upload File *</label>
                <input type="file" className="w-full px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black" required />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="flex-1 bg-[#C3A35E] text-[#6B1F2B] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Upload
                </button>
                <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 bg-white text-[#C3A35E]/90 px-6 py-3 rounded-lg font-semibold hover:bg-white transition-colors">
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

