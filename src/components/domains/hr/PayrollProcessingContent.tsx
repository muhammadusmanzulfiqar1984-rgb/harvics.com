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
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: currentCurrency
      })
      setPayrollData({
        totalPayroll: 2500000,
        processed: 4200,
        pending: 300,
        averageSalary: 5800
      })
    } catch (error) {
      console.error('Error loading payroll:', error)
      setPayrollData({
        totalPayroll: 2500000,
        processed: 4200,
        pending: 300,
        averageSalary: 5800
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
        <h3 className="text-xl font-semibold text-black">Payroll Processing</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          Process Payroll
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Payroll"
          value={formatCurrency(totalPayroll)}
          icon="💰"
        />
        <KPICard
          label="Processed"
          value={processed}
          icon="✅"
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

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Payroll Summary</h4>
        <p className="text-black mb-4">Process and manage employee payroll, bonuses, and incentives.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black200">
                <th className="text-left py-2 font-medium text-black">Pay Period</th>
                <th className="text-left py-2 font-medium text-black">Employees</th>
                <th className="text-left py-2 font-medium text-black">Total Amount</th>
                <th className="text-left py-2 font-medium text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">Jan 2024</td>
                <td className="py-2 text-black">4,200</td>
                <td className="py-2 text-black">{formatCurrency(24360000)}</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Processed</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">Feb 2024</td>
                <td className="py-2 text-black">4,200</td>
                <td className="py-2 text-black">{formatCurrency(24360000)}</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Processed</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">Mar 2024</td>
                <td className="py-2 text-black">4,200</td>
                <td className="py-2 text-black">{formatCurrency(24360000)}</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

