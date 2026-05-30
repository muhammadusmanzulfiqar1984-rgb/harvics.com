'use client'

import React, { useState } from 'react'
import { useDomainData } from '@/hooks/useDomainData'
import { KPICard, Card, DataTable, StatusDot, DonutChart, BarChart, LineChart, LiveBadge, MONTHS } from '@/components/charts/OSCharts'

interface CustomerListContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const fmtMoney = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`

const regionColors = ['#6B1F2B', '#007AFF', '#34C759', '#FF9500', '#8E8E93', '#AF52DE']

export default function CustomerListContent({ persona, locale }: CustomerListContentProps) {
  const { data, loading, source, lastUpdated } = useDomainData('crm')
  const [tab, setTab] = useState<'customers' | 'leads' | 'complaints'>('customers')

  if (!data) return <div className="p-8 text-sm text-[#8E8E93]">Loading…</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Customer Overview</h2>
          <p className="text-sm text-[#8E8E93] mt-0.5">Real-time CRM intelligence across all regions</p>
        </div>
        <LiveBadge source={source} lastUpdated={lastUpdated} />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Customers"
          value={data.totalCustomers?.toLocaleString() || '342'}
          trend={8.4}
          sparkline={data.revenueByMonth}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-5.985-3.462M17 20H7m10 0v-1c0-.653-.084-1.285-.24-1.897M7 20H2v-1a4 4 0 015.985-3.462M7 20v-1c0-.653.084-1.285.24-1.897M15 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <KPICard
          label="Active Accounts"
          value={data.activeCustomers?.toLocaleString() || '298'}
          trend={5.2}
          sparkline={data.revenueByMonth?.map((v: number) => v * 0.87)}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPICard
          label="New This Month"
          value={data.newCustomers || 31}
          trend={12.1}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
        />
        <KPICard
          label="Satisfaction"
          value={data.satisfaction || 94}
          suffix="%"
          trend={1.8}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Revenue Trend — 12 Months" className="lg:col-span-2">
          <div className="p-5">
            <LineChart
              data={[{ label: 'Revenue', values: data.revenueByMonth || [], color: '#6B1F2B' }]}
              labels={MONTHS}
              height={160}
              formatY={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
          </div>
        </Card>
        <Card title="Customers by Region">
          <div className="p-5 flex flex-col items-center gap-4">
            <DonutChart
              segments={(data.customersByRegion || []).map((r: any, i: number) => ({
                label: r.region, value: r.count, color: regionColors[i % regionColors.length]
              }))}
              size={120}
              centerLabel="Accounts"
              centerValue={data.totalCustomers?.toLocaleString()}
            />
            <div className="w-full space-y-2">
              {(data.customersByRegion || []).map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: regionColors[i % regionColors.length] }} />
                    <span className="text-[#1A1A1A]">{r.region}</span>
                  </div>
                  <span className="text-[#8E8E93] tabular-nums">{r.count} · {fmtMoney(r.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E5EA]">
        <div className="flex gap-6">
          {(['customers', 'leads', 'complaints'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-[#6B1F2B] text-[#1A1A1A]' : 'border-transparent text-[#8E8E93] hover:text-[#1A1A1A]'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'complaints' && (data.complaints?.length || 0) > 0 && (
                <span className="ml-1.5 text-[10px] bg-[#FF3B30] text-white rounded-full px-1.5 py-0.5 align-middle">{data.complaints.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      {tab === 'customers' && (
        <Card>
          <DataTable
            columns={[
              { key: 'name', label: 'Customer' },
              { key: 'type', label: 'Type' },
              { key: 'country', label: 'Country' },
              { key: 'status', label: 'Status' },
              { key: 'orders', label: 'Orders', right: true },
              { key: 'ltv', label: 'Lifetime Value', right: true },
              { key: 'last', label: 'Last Order' },
            ]}
            rows={(data.customers || []).map((c: any) => ({
              name: <span className="font-medium text-[#1A1A1A]">{c.name}</span>,
              type: <span className="text-xs text-[#8E8E93] bg-[#F5F5F7] px-2 py-0.5 rounded-full">{c.type}</span>,
              country: <span className="text-[#1A1A1A]">{c.country}</span>,
              status: <StatusDot status={c.status} />,
              orders: <span className="font-medium text-[#1A1A1A]">{c.orders}</span>,
              ltv: <span className="font-semibold text-[#1A1A1A]">{fmtMoney(c.lifetimeValue || 0)}</span>,
              last: <span className="text-[#8E8E93]">{c.lastOrder || '—'}</span>,
            }))}
          />
        </Card>
      )}

      {tab === 'leads' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data.leads || []).map((lead: any, i: number) => (
              <Card key={i}>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">{lead.company}</p>
                      <p className="text-xs text-[#8E8E93]">{lead.contact}</p>
                    </div>
                    <StatusDot status={lead.stage} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8E8E93]">Est. Value</span>
                      <span className="font-semibold text-[#1A1A1A]">{fmtMoney(lead.estimatedValue || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8E8E93]">Win Probability</span>
                      <span className="font-medium text-[#34C759]">{lead.probability}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#F5F5F7] rounded-full">
                    <div className="h-full rounded-full bg-[#6B1F2B]" style={{ width: `${lead.probability}%` }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Card title="Pipeline by Stage">
            <div className="p-5">
              <BarChart
                data={[
                  { label: 'Prospect', value: 14, color: '#E5E5EA' },
                  { label: 'Qualified', value: 8, color: '#007AFF' },
                  { label: 'Proposal', value: 5, color: '#FF9500' },
                  { label: 'Negotiation', value: 3, color: '#6B1F2B' },
                  { label: 'Won', value: 18, color: '#34C759' },
                ]}
                height={100}
              />
            </div>
          </Card>
        </div>
      )}

      {tab === 'complaints' && (
        <Card>
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'customer', label: 'Customer' },
              { key: 'issue', label: 'Issue' },
              { key: 'priority', label: 'Priority' },
              { key: 'status', label: 'Status' },
              { key: 'date', label: 'Raised' },
            ]}
            rows={(data.complaints || []).map((c: any) => ({
              id: <span className="text-[#8E8E93] text-xs font-mono">{c.id}</span>,
              customer: <span className="font-medium text-[#1A1A1A]">{c.customer}</span>,
              issue: <span className="text-[#1A1A1A]">{c.issue}</span>,
              priority: <StatusDot status={c.priority} />,
              status: <StatusDot status={c.status} />,
              date: <span className="text-[#8E8E93]">{c.date}</span>,
            }))}
          />
        </Card>
      )}
    </div>
  )
}

