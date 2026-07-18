'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import KPICard from '@/components/shared/KPICard'

interface OrderAnalyticsContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const monthlyData = [
  { name: 'Jan', orders: 400, revenue: 2400 },
  { name: 'Feb', orders: 300, revenue: 1398 },
  { name: 'Mar', orders: 200, revenue: 9800 },
  { name: 'Apr', orders: 278, revenue: 3908 },
  { name: 'May', orders: 189, revenue: 4800 },
  { name: 'Jun', orders: 239, revenue: 3800 },
]

const channelData = [
    { name: 'Retail', value: 45 },
    { name: 'Wholesale', value: 30 },
    { name: 'Direct', value: 15 },
    { name: 'Online', value: 10 },
]

export default function OrderAnalyticsContent({ persona, locale }: OrderAnalyticsContentProps) {
  const [timeRange, setTimeRange] = useState('6m')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    setLoading(true)
    setError(null)
    // Mock data loading
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [timeRange])

  if (loading) return <div className="p-12 text-center">Loading Analytics...</div>
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>
  if (!monthlyData.length || !channelData.length) return <div className="p-12 text-center">No analytics data available.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Order Analytics & Insights</h3>
        <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm text-black"
        >
            <option value="1m">Last 30 Days</option>
            <option value="3m">Last Quarter</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Year to Date</option>
        </select>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard label="Order Volume" value="1,606" icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M2 5.5l6-3.5 6 3.5v6L8 15 2 11.5V5.5z"/><path d="M8 2v13M2 5.5l6 3.5 6-3.5"/></svg>} change={{ value: 12, trend: 'up', label: 'vs last month' }} />
        <KPICard label="Avg Order Value" value="$2,450" icon="💵" change={{ value: 5, trend: 'up', label: 'vs last month' }} />
        <KPICard label="Fulfillment Rate" value="98.2%" icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="1" y="6" width="9" height="7" rx="1"/><path d="M10 8h3.5L15 10.5V13h-5"/><circle cx="4.5" cy="13.5" r="1.5"/><circle cx="12.5" cy="13.5" r="1.5"/></svg>} change={{ value: 0.2, trend: 'neutral', label: 'stable' }} />
        <KPICard label="Return Rate" value="1.4%" icon="↩️" change={{ value: 0.1, trend: 'down', label: 'improvement' }} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Volume Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Order Volume Trend</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                        />
                        <Bar dataKey="orders" fill="var(--harvics-burgundy)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Revenue Correlation</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="var(--harvics-gold)" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Channel Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {channelData.map((channel) => (
                <div key={channel.name} className="p-4 bg-[#F5F5F7] rounded-lg text-center">
                    <div className="text-sm text-gray-500 mb-1">{channel.name}</div>
                    <div className="text-2xl font-semibold text-[#1A1A1A]">{channel.value}%</div>
                    <div className="w-full bg-[#F5F5F7] h-1.5 rounded-full mt-2">
                        <div className="bg-harvics-burgundy h-1.5 rounded-full" style={{ width: `${channel.value}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}
