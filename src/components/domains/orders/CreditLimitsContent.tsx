'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import KPICard from '@/components/shared/KPICard'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface CreditLimitsContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

interface CustomerCredit {
  id: string
  name: string
  limit: number
  used: number
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'hold'
}

const COLORS = ['#00C49F', '#FFBB28', '#FF8042']

export default function CreditLimitsContent({ persona, locale }: CreditLimitsContentProps) {
  const { selectedCountry } = useCountry()
  const [credits, setCredits] = useState<CustomerCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCreditData()
  }, [selectedCountry])

  const loadCreditData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Mock Data - In real app, fetch from Finance OS API
      await new Promise(resolve => setTimeout(resolve, 600))
      // To test the error case, uncomment the following line
      // throw new Error('Failed to fetch credit data')
      setCredits([
        { id: 'CUST-001', name: 'Customer A', limit: 500000, used: 125000, riskLevel: 'low', status: 'active' },
        { id: 'CUST-002', name: 'Customer B', limit: 250000, used: 240000, riskLevel: 'high', status: 'hold' },
        { id: 'CUST-003', name: 'Customer C', limit: 1000000, used: 156000, riskLevel: 'low', status: 'active' },
        { id: 'CUST-004', name: 'Customer D', limit: 150000, used: 45000, riskLevel: 'medium', status: 'active' },
        { id: 'CUST-005', name: 'Customer E', limit: 300000, used: 20000, riskLevel: 'low', status: 'active' }
      ])
    } catch (err) {
      setError('Failed to load credit data. Please try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalExposure = credits.reduce((sum, c) => sum + c.used, 0)
  const totalLimit = credits.reduce((sum, c) => sum + c.limit, 0)
  const utilizationRate = (totalExposure / totalLimit) * 100
  const highRiskCount = credits.filter(c => c.riskLevel === 'high').length

  const riskData = [
    { name: 'Low Risk', value: credits.filter(c => c.riskLevel === 'low').length },
    { name: 'Medium Risk', value: credits.filter(c => c.riskLevel === 'medium').length },
    { name: 'High Risk', value: credits.filter(c => c.riskLevel === 'high').length },
  ]

  if (loading) return <div className="p-12 text-center">Loading Credit Data...</div>
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>
  if (credits.length === 0) return <div className="p-12 text-center">No credit data available.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Credit Control Center</h3>
        <button className="bg-white border border-[#6B1F2B] text-[#6B1F2B] px-4 py-2 rounded-lg hover:bg-gray-50">
          Review Credit Holds
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPIs */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <KPICard label="Total Exposure" value={`$${(totalExposure / 1000).toFixed(0)}k`} icon="📉" change={{ value: 2.5, trend: 'up', label: 'vs last month' }} />
          <KPICard label="Utilization Rate" value={`${utilizationRate.toFixed(1)}%`} icon="📊" change={{ value: 1.2, trend: 'neutral', label: 'stable' }} />
          <KPICard label="High Risk Accounts" value={highRiskCount} icon="🚩" change={{ value: 0, trend: 'neutral' }} />
          <KPICard label="Accounts on Hold" value={credits.filter(c => c.status === 'hold').length} icon="🔒" />
        </div>

        {/* Risk Distribution Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Distribution</h4>
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={riskData}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {riskData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Credit List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Credit Limit</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Risk Level</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {credits.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-black">{c.name}</td>
                <td className="px-4 py-3">${c.limit.toLocaleString()}</td>
                <td className="px-4 py-3">${c.used.toLocaleString()}</td>
                <td className="px-4 py-3 text-green-600">${(c.limit - c.used).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    c.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 
                    c.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {c.riskLevel.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                    {c.status === 'hold' ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">🔒 HOLD</span>
                    ) : (
                        <span className="text-green-600 font-medium">Active</span>
                    )}
                </td>
                <td className="px-4 py-3">
                  <button className="text-[#6B1F2B] hover:underline font-medium">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
