'use client'

import React, { useState } from 'react'
import { useDomainData } from '@/hooks/useDomainData'
import { KPICard, Card, DataTable, StatusDot, DonutChart, BarChart, LineChart, LiveBadge, HBar, MONTHS } from '@/components/charts/OSCharts'

const fmtM = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`
const catColors = ['#6B1F2B', '#007AFF', '#34C759', '#FF9500', '#8E8E93']

export default function StockOverviewContent({ persona, locale }: { persona: string; locale: string }) {
  const { data, source, lastUpdated } = useDomainData('inventory')
  const [filter, setFilter] = useState<'All' | 'Low'>('All')

  if (!data) return <div className="p-8 text-sm text-[#8E8E93]">Loading…</div>

  const filtered = filter === 'Low' ? (data.skus || []).filter((s: any) => s.status === 'Low') : (data.skus || [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Stock Overview</h2>
          <p className="text-sm text-[#8E8E93] mt-0.5">Real-time inventory across {data.warehouseCount || 12} warehouses</p>
        </div>
        <LiveBadge source={source} lastUpdated={lastUpdated} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Stock Value" value={fmtM(data.totalValue || 18400000)} trend={3.1} sparkline={data.stockTrend}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
        <KPICard label="Active SKUs" value={data.totalSkus || 247} trend={6.4}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
        />
        <KPICard label="Low Stock Alerts" value={data.lowStock || 14} trend={-8.3}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <KPICard label="Turnover Days" value={data.turnoverDays || 28} trend={-2.4}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Stock Value Trend" className="lg:col-span-2">
          <div className="p-5">
            <LineChart
              data={[{ label: 'Stock Value', values: data.stockTrend || [], color: '#6B1F2B' }]}
              labels={MONTHS}
              height={160}
              formatY={(v) => fmtM(v)}
            />
          </div>
        </Card>
        <Card title="Value by Category">
          <div className="p-5 flex flex-col items-center gap-4">
            <DonutChart
              segments={(data.valueByCategory || []).map((c: any, i: number) => ({ label: c.category, value: c.value, color: catColors[i % catColors.length] }))}
              size={120}
              centerLabel="Total"
              centerValue={fmtM(data.totalValue || 18400000)}
            />
            <div className="w-full space-y-2">
              {(data.valueByCategory || []).map((c: any, i: number) => (
                <HBar key={i} label={c.category} value={c.value} max={data.totalValue || 1} color={catColors[i % catColors.length]} formatValue={fmtM} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* SKU table */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">SKU Details</h3>
        <div className="flex gap-1.5">
          {(['All', 'Low'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${filter === f ? 'bg-[#6B1F2B] text-white' : 'bg-[#F5F5F7] text-[#8E8E93] hover:bg-[#EBEBF0]'}`}>
              {f === 'Low' ? `⚠ Low Stock (${data.lowStock || 14})` : 'All SKUs'}
            </button>
          ))}
        </div>
      </div>
      <Card>
        <DataTable
          columns={[
            { key: 'sku', label: 'SKU' },
            { key: 'desc', label: 'Description' },
            { key: 'cat', label: 'Category' },
            { key: 'stock', label: 'Status' },
            { key: 'onHand', label: 'On Hand', right: true },
            { key: 'min', label: 'Min Stock', right: true },
            { key: 'value', label: 'Value', right: true },
          ]}
          rows={filtered.map((s: any) => ({
            sku: <span className="font-mono text-xs text-[#8E8E93]">{s.sku}</span>,
            desc: <span className="font-medium text-[#1A1A1A]">{s.description}</span>,
            cat: <span className="text-xs text-[#8E8E93] bg-[#F5F5F7] px-2 py-0.5 rounded-full">{s.category}</span>,
            stock: <StatusDot status={s.status} />,
            onHand: (
              <div className="flex items-center justify-end gap-2">
                <div className="w-12 h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min((s.onHand / (s.minStock * 2)) * 100, 100)}%`, backgroundColor: s.status === 'Low' ? '#FF9500' : '#34C759' }} />
                </div>
                <span>{s.onHand?.toLocaleString()}</span>
              </div>
            ),
            min: <span>{s.minStock?.toLocaleString()}</span>,
            value: <span className="font-semibold text-[#1A1A1A]">{fmtM(s.value || 0)}</span>,
          }))}
        />
      </Card>
    </div>
  )
}
