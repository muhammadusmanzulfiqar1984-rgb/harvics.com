'use client'

import React from 'react'
import { useDomainData } from '@/hooks/useDomainData'
import { KPICard, Card, DataTable, DonutChart, LineChart, LiveBadge, HBar, MONTHS } from '@/components/charts/OSCharts'
import { ExchangeRatesWidget } from '@/components/widgets/ExchangeRatesWidget'

const fmtM = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`

const expColors = ['#6B1F2B', '#007AFF', '#FF9500', '#34C759', '#8E8E93']

export default function GLOverviewContent({ persona, locale }: { persona: string; locale: string }) {
  const { data, source, lastUpdated } = useDomainData('finance')

  if (!data) return <div className="p-8 text-sm text-[#8E8E93]">Loading…</div>

  const margin = data.revenue > 0 ? ((data.netProfit / data.revenue) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">General Ledger Overview</h2>
          <p className="text-sm text-[#8E8E93] mt-0.5">Live P&L, cash position and expense breakdown</p>
        </div>
        <LiveBadge source={source} lastUpdated={lastUpdated} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={fmtM(data.revenue || 28400000)} trend={18.6} sparkline={data.revenueByMonth}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KPICard label="Net Profit" value={fmtM(data.netProfit || 6200000)} trend={22.1} sparkline={data.revenueByMonth?.map((v: number, i: number) => v - (data.expenseByMonth?.[i] || 0))}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <KPICard label="Margin" value={margin} suffix="%" trend={3.2}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
        />
        <KPICard label="A/R Balance" value={fmtM(data.arBalance || 7800000)} trend={-4.1}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
        />
      </div>

      {/* P&L chart + expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Revenue vs Expenses — 12 Months" className="lg:col-span-2">
          <div className="p-5">
            <LineChart
              data={[
                { label: 'Revenue', values: data.revenueByMonth || [], color: '#6B1F2B' },
                { label: 'Expenses', values: data.expenseByMonth || [], color: '#FF9500' },
              ]}
              labels={MONTHS}
              height={160}
              formatY={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
            />
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]"><span className="w-3 h-0.5 bg-[#6B1F2B] rounded-full inline-block" /> Revenue</div>
              <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]"><span className="w-3 h-0.5 bg-[#FF9500] rounded-full inline-block" /> Expenses</div>
            </div>
          </div>
        </Card>
        <Card title="Expense Breakdown">
          <div className="p-5 flex flex-col items-center gap-4">
            <DonutChart
              segments={(data.expenseBreakdown || []).map((e: any, i: number) => ({ label: e.category, value: e.amount, color: expColors[i % expColors.length] }))}
              size={120}
              centerLabel="Total Exp."
              centerValue={fmtM(data.expenses || 19800000)}
            />
            <div className="w-full space-y-2">
              {(data.expenseBreakdown || []).map((e: any, i: number) => (
                <HBar key={i} label={e.category} value={e.pct} max={100} color={expColors[i % expColors.length]} formatValue={(v) => `${v}%`} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Cash summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-5 space-y-4">
            <h4 className="text-sm font-semibold text-[#1A1A1A]">Cash & Liquidity</h4>
            <div className="space-y-3">
              {[
                { label: 'Cash On Hand', value: data.cashOnHand || 4200000, color: '#34C759' },
                { label: 'A/R Balance', value: data.arBalance || 7800000, color: '#007AFF' },
                { label: 'A/P Balance', value: data.apBalance || 3400000, color: '#FF9500' },
                { label: 'Pending Payments', value: data.pendingPayments || 1840000, color: '#FF3B30' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#8E8E93]">{item.label}</span>
                  </div>
                  <span className="font-semibold text-[#1A1A1A] tabular-nums">{fmtM(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <div className="p-5 space-y-4">
            <h4 className="text-sm font-semibold text-[#1A1A1A]">Key Ratios</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Gross Margin', value: `${((data.grossProfit / data.revenue) * 100).toFixed(1)}%`, sub: 'Gross Profit / Revenue' },
                { label: 'Net Margin', value: `${margin}%`, sub: 'Net Profit / Revenue' },
                { label: 'ROI', value: '22.1%', sub: 'Return on Investment' },
                { label: 'Working Capital', value: fmtM((data.cashOnHand || 4200000) + (data.arBalance || 7800000) - (data.apBalance || 3400000)), sub: 'Cash + A/R − A/P' },
              ].map((r) => (
                <div key={r.label} className="bg-[#F5F5F7] rounded-xl p-4">
                  <p className="text-xs text-[#8E8E93]">{r.label}</p>
                  <p className="text-xl font-semibold text-[#1A1A1A] mt-1">{r.value}</p>
                  <p className="text-[10px] text-[#C7C7CC] mt-0.5">{r.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Live exchange rates */}
      <ExchangeRatesWidget />
    </div>
  )
}
