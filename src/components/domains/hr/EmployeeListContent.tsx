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
      const [summaryRes, employeesRes] = await Promise.all([
        apiClient.request('/hr/summary'),
        apiClient.request('/hr/employees?limit=50')
      ])
      
      const summary = (summaryRes?.data as any) || {}
      const rawEmployees = (employeesRes?.data as any)
      const employees: any[] = Array.isArray(rawEmployees) ? rawEmployees : (rawEmployees?.data ?? [])
      
      setHrData({
        totalEmployees: summary.totalEmployees || 0,
        active: summary.activeEmployees || 0,
        departments: Object.keys(summary.byDepartment || {}).length,
        attendance: 98, // Mock for now
        employees: employees
      })
    } catch (error) {
      console.error('Error loading HR:', error)
      setHrData({
        totalEmployees: 0,
        active: 0,
        departments: 0,
        attendance: 98
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5E5EA]"></div>
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
        <h3 className="text-sm font-semibold text-[#1D1D1F]">Employee List</h3>
        <button className="px-4 py-2 bg-[#6B1F2B] text-white text-xs font-medium rounded-xl hover:bg-[#5a1a24] transition-colors">
          + Add Employee
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Employees"
          value={totalEmployees}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="6" cy="5" r="2.5"/><path d="M2 14c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="12" cy="5" r="2"/><path d="M14 14c0-1.7-1-3.1-2.5-3.7"/></svg>}
        />
        <KPICard
          label="Active"
          value={active}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>}
        />
        <KPICard
          label="Departments"
          value={departments}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M6 7h4M6 10h2"/></svg>}
        />
        <KPICard
          label="Attendance"
          value={`${attendance}%`}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="2" y="9" width="3" height="5" rx="0.5"/><rect x="6.5" y="6" width="3" height="8" rx="0.5"/><rect x="11" y="3" width="3" height="11" rx="0.5"/></svg>}
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4">Employee Directory</h4>
        <p className="text-black mb-4">View and manage all employee records and information.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Employee ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Department</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Country</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {(hrData?.employees || []).map((emp: any) => (
                <tr key={emp.id} className="hover:bg-[#F5F5F7] transition-colors">
                  <td className="py-2 text-black font-mono text-xs">{emp.employeeId || emp.id?.substring(0, 8)}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{emp.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{emp.department}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{emp.country}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${emp.status === 'Active' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>{emp.status}</span>
                  </td>
                </tr>
              ))}
              {(!hrData?.employees || hrData.employees.length === 0) && (
                <tr><td colSpan={5} className="py-4 text-center text-gray-500">No employees found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

