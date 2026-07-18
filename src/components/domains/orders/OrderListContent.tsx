'use client'

import React, { useState } from 'react'
import { useDomainData } from '@/hooks/useDomainData'
import { KPICard, Card, DataTable, StatusDot, DonutChart, BarChart, LineChart, LiveBadge, MONTHS } from '@/components/charts/OSCharts'

const fmtMoney = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`

const channelColors = ['var(--harvics-burgundy)', '#007AFF', '#34C759', '#FF9500']

export default function OrderListContent({ persona, locale }: { persona: string; locale: string }) {
  const { data, source, lastUpdated } = useDomainData('orders')
  const [tab, setTab] = useState<'orders' | 'analytics'>('orders')
  const [filter, setFilter] = useState<string>('All')

  if (!data) return <div className="p-8 text-sm text-[#8E8E93]">Loading…</div>

  const statuses = ['All', 'Pending', 'In Transit', 'Completed']
  const filtered = filter === 'All' ? (data.orders || []) : (data.orders || []).filter((o: any) => o.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Order Management</h2>
          <p className="text-sm text-[#8E8E93] mt-0.5">Live order pipeline across all markets</p>
        </div>
        <LiveBadge source={source} lastUpdated={lastUpdated} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Orders" value={data.total?.toLocaleString() || '2,140'} trend={14.2} sparkline={data.revenueByMonth}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <KPICard label="Revenue" value={fmtMoney(data.revenue || 28400000)} trend={18.6} sparkline={data.revenueByMonth}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPICard label="In Transit" value={data.inTransit || 133} trend={-2.1}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 .001M13 16H9m4 0h3m3 0h.01M16 6l3 4h.99" /></svg>}
        />
        <KPICard label="Pending" value={data.pending || 187} trend={5.4}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Monthly Revenue" className="lg:col-span-2">
          <div className="p-5">
            <LineChart
              data={[{ label: 'Revenue', values: data.revenueByMonth || [], color: 'var(--harvics-burgundy)' }]}
              labels={MONTHS}
              height={160}
              formatY={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
            />
          </div>
        </Card>
        <Card title="Orders by Channel">
          <div className="p-5 flex flex-col items-center gap-4">
            <DonutChart
              segments={(data.ordersByChannel || []).map((c: any, i: number) => ({ label: c.channel, value: c.count, color: channelColors[i % channelColors.length] }))}
              size={120}
              centerLabel="Total"
              centerValue={data.total?.toLocaleString()}
            />
            <div className="w-full space-y-2">
              {(data.ordersByChannel || []).map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: channelColors[i % channelColors.length] }} />
                    <span className="text-[#1A1A1A]">{c.channel}</span>
                  </div>
                  <span className="text-[#8E8E93] tabular-nums">{c.count} · {fmtMoney(c.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs + filter */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#E5E5EA] pb-0">
        <div className="flex gap-6">
          {(['orders', 'analytics'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-harvics-burgundy text-[#1A1A1A]' : 'border-transparent text-[#8E8E93] hover:text-[#1A1A1A]'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {tab === 'orders' && (
          <div className="flex gap-1.5 pb-3">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${filter === s ? 'bg-harvics-burgundy text-white' : 'bg-[#F5F5F7] text-[#8E8E93] hover:bg-[#EBEBF0]'}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'orders' ? (
        <Card>
          <DataTable
            columns={[
              { key: 'id', label: 'Order ID' },
              { key: 'customer', label: 'Customer' },
              { key: 'country', label: 'Country' },
              { key: 'channel', label: 'Channel' },
              { key: 'status', label: 'Status' },
              { key: 'date', label: 'Date' },
              { key: 'amount', label: 'Amount', right: true },
            ]}
            rows={filtered.map((o: any) => ({
              id: <span className="font-mono text-xs text-[#8E8E93]">{o.id}</span>,
              customer: <span className="font-medium text-[#1A1A1A]">{o.customer}</span>,
              country: <span className="text-[#1A1A1A]">{o.country}</span>,
              channel: <span className="text-xs text-[#8E8E93] bg-[#F5F5F7] px-2 py-0.5 rounded-full">{o.channel}</span>,
              status: <StatusDot status={o.status} />,
              date: <span className="text-[#8E8E93]">{o.date}</span>,
              amount: <span className="font-semibold text-[#1A1A1A]">{fmtMoney(o.amount)}</span>,
            }))}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Revenue by Channel">
            <div className="p-5">
              <BarChart
                data={(data.ordersByChannel || []).map((c: any, i: number) => ({ label: c.channel.split(' ')[0], value: c.revenue, color: channelColors[i % channelColors.length] }))}
                height={120}
                formatValue={fmtMoney}
              />
            </div>
          </Card>
          <Card title="Orders by Channel">
            <div className="p-5">
              <BarChart
                data={(data.ordersByChannel || []).map((c: any, i: number) => ({ label: c.channel.split(' ')[0], value: c.count, color: channelColors[i % channelColors.length] }))}
                height={120}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
