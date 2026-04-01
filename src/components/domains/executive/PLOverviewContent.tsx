'use client'

import React from 'react'
import { useDomainData } from '@/hooks/useDomainData'
import { KPICard, Card, DataTable, StatusDot, DonutChart, BarChart, LineChart, LiveBadge, HBar, MONTHS } from '@/components/charts/OSCharts'

const fmtM = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`

export default function PLOverviewContent({ persona, locale }: { persona: string; locale: string }) {
  const { data: ord } = useDomainData('orders')
  const { data: fin } = useDomainData('finance')
  const { data: exec, source, lastUpdated } = useDomainData('executive')

  const data = exec || {}
  const finData = fin || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1D1D1F]">P&L Overview</h2>
          <p className="text-sm text-[#8E8E93] mt-0.5">Enterprise performance at a glance</p>
        </div>
        <LiveBadge source={source} lastUpdated={lastUpdated} />
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={fmtM(data.totalRevenue || 28400000)} trend={14.2} sparkline={finData.revenueByMonth}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KPICard label="Net Profit" value={fmtM(data.netProfit || 6200000)} trend={22.1}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>}
        />
        <KPICard label="Margin" value={`${data.profitMargin || 21.8}`} suffix="%" trend={3.2}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18" /></svg>}
        />
        <KPICard label="YoY Growth" value={`${data.growthYoY || 14.2}`} suffix="%" trend={data.growthYoY || 14.2}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
      </div>

      {/* Main chart + donut grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="P&L Trend — Last 4 Quarters" className="lg:col-span-2">
          <div className="p-5">
            <div className="grid grid-cols-4 gap-3 mb-5">
              {(data.kpiTrend || []).map((q: any, i: number) => (
                <div key={i} className={`rounded-xl p-3 text-center ${i === (data.kpiTrend?.length || 1) - 1 ? 'bg-[#6B1F2B]' : 'bg-[#F5F5F7]'}`}>
                  <p className={`text-xs font-medium mb-1 ${i === (data.kpiTrend?.length || 1) - 1 ? 'text-[#C3A35E]' : 'text-[#8E8E93]'}`}>{q.month}</p>
                  <p className={`text-base font-semibold tabular-nums ${i === (data.kpiTrend?.length || 1) - 1 ? 'text-white' : 'text-[#1D1D1F]'}`}>{fmtM(q.revenue)}</p>
                  <p className={`text-xs tabular-nums ${i === (data.kpiTrend?.length || 1) - 1 ? 'text-[#C3A35E]/70' : 'text-[#8E8E93]'}`}>{fmtM(q.profit)} profit</p>
                </div>
              ))}
            </div>
            <LineChart
              data={[
                { label: 'Revenue', values: finData.revenueByMonth || [], color: '#6B1F2B' },
                { label: 'Expenses', values: finData.expenseByMonth || [], color: '#FF9500' },
              ]}
              labels={MONTHS}
              height={140}
              formatY={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
            />
          </div>
        </Card>

        <div className="space-y-4">
          {/* Business health */}
          <Card title="Business Health">
            <div className="p-5 space-y-3">
              {[
                { label: 'ROI', value: data.roi || 22.1, max: 50, color: '#6B1F2B', unit: '%' },
                { label: 'Market Share', value: data.marketShare || 18.4, max: 40, color: '#007AFF', unit: '%' },
                { label: 'Cust. Retention', value: data.customerRetention || 94, max: 100, color: '#34C759', unit: '%' },
                { label: 'Employee Sat.', value: data.employeeSatisfaction || 87, max: 100, color: '#FF9500', unit: '%' },
              ].map((item) => (
                <HBar key={item.label} label={item.label} value={item.value} max={item.max} color={item.color} formatValue={(v) => `${v}${item.unit}`} />
              ))}
            </div>
          </Card>

          {/* Active alerts */}
          <Card title={`Alerts (${(data.alerts || []).length})`}>
            <div className="divide-y divide-[#F5F5F7]">
              {(data.alerts || []).map((a: any, i: number) => {
                const colors: Record<string, string> = { warning: '#FF9500', info: '#007AFF', success: '#34C759', error: '#FF3B30' }
                return (
                  <div key={i} className="px-4 py-3 flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: colors[a.type] || '#8E8E93' }} />
                    <div>
                      <p className="text-xs text-[#1D1D1F] leading-snug">{a.message}</p>
                      <p className="text-[10px] text-[#8E8E93] mt-0.5">{a.domain} · {a.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
