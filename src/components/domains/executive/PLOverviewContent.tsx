'use client'

import React from 'react'
import { useDomainData } from '@/hooks/useDomainData'
import { KPICard, Card, LineChart, LiveBadge, HBar, MONTHS } from '@/components/charts/OSCharts'

const fmtM = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`

export default function PLOverviewContent({ persona, locale }: { persona: string; locale: string }) {
  const { data: fin, loading: finLoading } = useDomainData('finance')
  const { data: exec, source, lastUpdated, loading: execLoading } = useDomainData('executive')

  const loading = finLoading || execLoading
  const data = exec || {}
  const finData = fin || {}
  const totalRevenue = data.totalRevenue ?? finData.revenue ?? 0
  const netProfit = data.netProfit ?? finData.netProfit ?? 0
  const profitMargin = data.profitMargin ?? (totalRevenue > 0 ? +((netProfit / totalRevenue) * 100).toFixed(1) : null)

  if (loading) return <div className="p-8 text-sm text-[#8E8E93]">Loading…</div>
  if (!exec && !fin) return <div className="p-8 text-sm text-[#8E8E93]">No executive data yet — finance and orders feed this view.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">P&L Overview</h2>
          <p className="text-sm text-[#8E8E93] mt-0.5">Enterprise performance at a glance</p>
        </div>
        <LiveBadge source={source} lastUpdated={lastUpdated} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={fmtM(totalRevenue)} sparkline={finData.revenueByMonth}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KPICard label="Net Profit" value={fmtM(netProfit)}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>}
        />
        <KPICard label="Margin" value={profitMargin != null ? `${profitMargin}` : '—'} suffix={profitMargin != null ? '%' : undefined}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18" /></svg>}
        />
        <KPICard label="YoY Growth" value={data.growthYoY != null ? `${data.growthYoY}` : '—'} suffix={data.growthYoY != null ? '%' : undefined}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="P&L Trend — Last 4 Quarters" className="lg:col-span-2">
          <div className="p-5">
            {(data.kpiTrend || []).length > 0 ? (
              <div className="grid grid-cols-4 gap-3 mb-5">
                {(data.kpiTrend || []).map((q: any, i: number) => (
                  <div key={i} className={`rounded-xl p-3 text-center ${i === (data.kpiTrend?.length || 1) - 1 ? 'bg-harvics-burgundy' : 'bg-[#F5F5F7]'}`}>
                    <p className={`text-xs font-medium mb-1 ${i === (data.kpiTrend?.length || 1) - 1 ? 'text-harvics-gold' : 'text-[#8E8E93]'}`}>{q.month}</p>
                    <p className={`text-base font-semibold tabular-nums ${i === (data.kpiTrend?.length || 1) - 1 ? 'text-white' : 'text-[#1A1A1A]'}`}>{fmtM(q.revenue)}</p>
                    <p className={`text-xs tabular-nums ${i === (data.kpiTrend?.length || 1) - 1 ? 'text-harvics-gold/70' : 'text-[#8E8E93]'}`}>{fmtM(q.profit)} profit</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8E8E93] mb-5">Quarterly trend appears when executive aggregates are populated.</p>
            )}
            <LineChart
              data={[
                { label: 'Revenue', values: finData.revenueByMonth || [], color: 'var(--harvics-burgundy)' },
                { label: 'Expenses', values: finData.expenseByMonth || [], color: '#FF9500' },
              ]}
              labels={MONTHS}
              height={140}
              formatY={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Business Health">
            <div className="p-5 space-y-3">
              {[
                { label: 'ROI', value: data.roi, max: 50, color: 'var(--harvics-burgundy)', unit: '%' },
                { label: 'Market Share', value: data.marketShare, max: 40, color: '#007AFF', unit: '%' },
                { label: 'Cust. Retention', value: data.customerRetention, max: 100, color: '#34C759', unit: '%' },
                { label: 'Employee Sat.', value: data.employeeSatisfaction, max: 100, color: '#FF9500', unit: '%' },
              ].map((item) => (
                item.value != null ? (
                  <HBar key={item.label} label={item.label} value={item.value} max={item.max} color={item.color} formatValue={(v) => `${v}${item.unit}`} />
                ) : (
                  <div key={item.label} className="flex justify-between text-xs text-[#8E8E93]">
                    <span>{item.label}</span>
                    <span>—</span>
                  </div>
                )
              ))}
            </div>
          </Card>

          <Card title={`Alerts (${(data.alerts || []).length})`}>
            <div className="divide-y divide-[#F5F5F7]">
              {(data.alerts || []).length === 0 ? (
                <p className="px-4 py-3 text-xs text-[#8E8E93]">No active alerts</p>
              ) : (data.alerts || []).map((a: any, i: number) => {
                const colors: Record<string, string> = { warning: '#FF9500', info: '#007AFF', success: '#34C759', error: '#FF3B30' }
                return (
                  <div key={i} className="px-4 py-3 flex gap-3 items-start">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: colors[a.type] || '#8E8E93' }} />
                    <div>
                      <p className="text-xs text-[#1A1A1A] leading-snug">{a.message}</p>
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
