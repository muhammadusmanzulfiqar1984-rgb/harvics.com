'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useLocalization } from '@/utils/localization'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface PayrollProcessingContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function PayrollProcessingContent({ persona, locale }: PayrollProcessingContentProps) {
  const { selectedCountry, countryData } = useCountry()
  const { getCurrencyCode, getCurrencySymbol, currency } = useLocalization()
  const [loading, setLoading] = useState(true)
  const [payrollData, setPayrollData] = useState<any>(null)

  const currentCurrency = currency?.code || countryData?.currency?.code || getCurrencyCode() || 'USD'
  const currencySymbol = currency?.symbol || countryData?.currency?.symbol || getCurrencySymbol() || '$'

  useEffect(() => {
    loadPayroll()
  }, [selectedCountry, persona])

  const loadPayroll = async () => {
    setLoading(true)
    try {
      const [payrollRes, summaryRes] = await Promise.all([
        apiClient.request('/hr/payroll?limit=10'),
        apiClient.request('/hr/summary')
      ])
      
      const rawPayroll = (payrollRes?.data as any)
      const payrollRuns: any[] = Array.isArray(rawPayroll) ? rawPayroll : (rawPayroll?.data ?? [])
      const summary = (summaryRes?.data as any) || {}
      const latestRun = payrollRuns[0] || {}
      
      setPayrollData({
        totalPayroll: latestRun.totalAmount || 0,
        processed: latestRun.employeeCount || 0,
        pending: (summary.totalEmployees || 0) - (latestRun.employeeCount || 0),
        averageSalary: latestRun.employeeCount > 0 ? Math.round(latestRun.totalAmount / latestRun.employeeCount) : 0,
        payrollRuns: payrollRuns
      })
    } catch (error) {
      console.error('Error loading payroll:', error)
      setPayrollData({
        totalPayroll: 0,
        processed: 0,
        pending: 0,
        averageSalary: 0
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

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${currencySymbol}${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${currencySymbol}${(amount / 1000).toFixed(1)}K`
    }
    return `${currencySymbol}${amount.toFixed(0)}`
  }

  const totalPayroll = payrollData?.totalPayroll || 0
  const processed = payrollData?.processed || 0
  const pending = payrollData?.pending || 0
  const averageSalary = payrollData?.averageSalary || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1D1D1F]">Payroll Processing</h3>
        <button className="px-4 py-2 bg-[#6B1F2B] text-white text-xs font-medium rounded-xl hover:bg-[#5a1a24] transition-colors">
          Process Payroll
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Payroll"
          value={formatCurrency(totalPayroll)}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v7M6 6h3.5a1 1 0 010 2H6.5a1 1 0 000 2H10"/></svg>}
        />
        <KPICard
          label="Processed"
          value={processed}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>}
        />
        <KPICard
          label="Pending"
          value={pending}
          icon="⏳"
        />
        <KPICard
          label="Avg. Salary"
          value={formatCurrency(averageSalary)}
          icon="💳"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4">Payroll Summary</h4>
        <p className="text-black mb-4">Process and manage employee payroll, bonuses, and incentives.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Pay Period</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Employees</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Total Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {(payrollData?.payrollRuns || []).map((run: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#F5F5F7] transition-colors">
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{run.period || run.month || `Period ${idx + 1}`}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{(run.employeeCount || 0).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{formatCurrency(run.totalAmount || 0)}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${run.status === 'Processed' || run.status === 'Completed' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>{run.status || 'Pending'}</span>
                  </td>
                </tr>
              ))}
              {(!payrollData?.payrollRuns || payrollData.payrollRuns.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">No payroll records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

