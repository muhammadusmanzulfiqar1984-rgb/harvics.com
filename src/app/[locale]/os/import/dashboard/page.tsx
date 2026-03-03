'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'
import Link from 'next/link'

interface DashboardData {
  imports: {
    pending: number
    inTransit: number
    customs: number
    totalValue: number
  }
  exports: {
    pending: number
    inTransit: number
    customs: number
    totalValue: number
  }
  customs: {
    pending: number
    cleared: number
  }
  documents: {
    pending: number
    expiring: number
  }
}

export default function ImportExportDashboardPage() {
  const locale = useLocale()
  const { selectedCountry } = useCountry()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [selectedCountry])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/os-domains/import-export/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('auth_token') 
            ? { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } 
            : {}),
        }
      })
      
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to load dashboard')
      }
    } catch (err) {
      console.error('Error fetching import/export dashboard:', err)
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Import/Export OS Dashboard</h1>
        <p className="text-[#C3A35E]/90">Monitor your import and export operations</p>
      </div>

      {loading && <div className="text-center py-12">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Import Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">📦 Imports</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-bold text-[#C3A35E]">{data.imports.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>In Transit:</span>
                <span className="font-bold text-blue-600">{data.imports.inTransit || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Customs:</span>
                <span className="font-bold text-orange-600">{data.imports.customs || 0}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Total Value:</span>
                <span className="font-bold text-green-600">
                  ${(data.imports.totalValue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Export Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">🚢 Exports</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-bold text-[#C3A35E]">{data.exports.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>In Transit:</span>
                <span className="font-bold text-blue-600">{data.exports.inTransit || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Customs:</span>
                <span className="font-bold text-orange-600">{data.exports.customs || 0}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Total Value:</span>
                <span className="font-bold text-green-600">
                  ${(data.exports.totalValue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customs Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">🏛️ Customs</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-bold text-orange-600">{data.customs.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleared:</span>
                <span className="font-bold text-green-600">{data.customs.cleared || 0}</span>
              </div>
            </div>
          </div>

          {/* Documents Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">📄 Documents</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-bold text-[#C3A35E]">{data.documents.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Expiring:</span>
                <span className="font-bold text-red-600">{data.documents.expiring || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

