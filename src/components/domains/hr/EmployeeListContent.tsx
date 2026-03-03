'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface EmployeeListContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function EmployeeListContent({ persona, locale }: EmployeeListContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [hrData, setHrData] = useState<any>(null)

  useEffect(() => {
    loadHR()
  }, [selectedCountry, persona])

  const loadHR = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      setHrData((response as any)?.data?.data?.hr || (response as any)?.data?.hr || null)
    } catch (error) {
      console.error('Error loading HR:', error)
      setHrData({
        totalEmployees: 4500,
        active: 4200,
        departments: 60,
        attendance: 98
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
      </div>
    )
  }

  const totalEmployees = hrData?.totalEmployees || 0
  const active = hrData?.active || 0
  const departments = hrData?.departments || 0
  const attendance = hrData?.attendance || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Employee List</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + Add Employee
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Employees"
          value={totalEmployees}
          icon="👥"
        />
        <KPICard
          label="Active"
          value={active}
          icon="✅"
        />
        <KPICard
          label="Departments"
          value={departments}
          icon="🏢"
        />
        <KPICard
          label="Attendance"
          value={`${attendance}%`}
          icon="📊"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Employee Directory</h4>
        <p className="text-black mb-4">View and manage all employee records and information.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black200">
                <th className="text-left py-2 font-medium text-black">Employee ID</th>
                <th className="text-left py-2 font-medium text-black">Name</th>
                <th className="text-left py-2 font-medium text-black">Department</th>
                <th className="text-left py-2 font-medium text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">EMP-001</td>
                <td className="py-2 text-black">John Doe</td>
                <td className="py-2 text-black">Sales</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">EMP-002</td>
                <td className="py-2 text-black">Jane Smith</td>
                <td className="py-2 text-black">Logistics</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">EMP-003</td>
                <td className="py-2 text-black">Mike Johnson</td>
                <td className="py-2 text-black">Finance</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

