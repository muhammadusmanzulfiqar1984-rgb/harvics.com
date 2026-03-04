'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export default function CustomsPage() {
  const [hsCodes, setHsCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadHSCodes()
  }, [])

  const loadHSCodes = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDomainHSCodes()
      if (response?.data) {
        setHsCodes(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error loading HS codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCodes = hsCodes.filter(code =>
    code.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Customs & Tariffs</h1>
        <p className="text-[#C3A35E]/90">HS Code lookup and tariff information</p>
      </div>

      <div className="bg-white border border-black200 p-4">
        <input
          type="text"
          placeholder="Search HS codes or descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-black300 px-4 py-2"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white border border-black200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">HS Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Import Duty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">VAT</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#C3A35E]/90">
                    No HS codes found
                  </td>
                </tr>
              ) : (
                filteredCodes.map((code) => (
                  <tr key={code.code} className="hover:bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">{code.code}</td>
                    <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{code.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{code.importDuty}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{code.vat}%</td>
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

