'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'

export default function CompliancePage() {
  const t = useTranslations('legal')
  const [compliance, setCompliance] = useState<any[]>([])
  const [regulations, setRegulations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompliance()
  }, [])

  const loadCompliance = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDomainLegalCompliance()
      const responseTyped = response as { data?: { countries?: any[]; regulations?: any[] }; error?: string }
      if (responseTyped?.data) {
        setCompliance(responseTyped.data.countries || [])
        setRegulations(responseTyped.data.regulations || [])
      }
    } catch (error) {
      console.error('Error loading compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-white'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'bg-green-100 text-green-800'
      case 'Review Required': return 'bg-[#C3A35E]/20 text-[#C3A35E]'
      case 'Non-Compliant': return 'bg-red-100 text-red-800'
      default: return 'bg-white text-[#C3A35E]/90'
    }
  }

  return (
    <>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Legal Compliance</h1>
        <p className="text-[#C3A35E]/90">Track compliance status across all countries</p>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12">Loading...</div>
        ) : (
          compliance.map((item) => (
            <div key={item.country} className="bg-white rounded-lg border border-black200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#C3A35E]/90">{item.country}</h3>
                <span className={`text-2xl font-bold ${getScoreColor(item.complianceScore)}`}>
                  {item.complianceScore}%
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#C3A35E]/90">Last Audit:</span>
                  <span className="font-medium">{item.lastAudit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C3A35E]/90">Next Audit:</span>
                  <span className="font-medium">{item.nextAudit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C3A35E]/90">Issues:</span>
                  <span className={item.issues > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {item.issues}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Regulations */}
      <div className="bg-white rounded-lg border border-black200 overflow-hidden">
        <div className="px-6 py-4 border-b border-black200">
          <h2 className="text-xl font-semibold text-[#C3A35E]/90">Regulations</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Regulation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase tracking-wider">Last Check</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regulations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#C3A35E]/90">
                  No regulations found
                </td>
              </tr>
            ) : (
              regulations.map((reg, idx) => (
                <tr key={idx} className="hover:bg-white">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">{reg.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{reg.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reg.status)}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{reg.lastCheck}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

