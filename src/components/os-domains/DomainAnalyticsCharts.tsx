'use client'

import React, { useEffect, useState } from 'react'
import { BarChartCard, PieChartCard } from '@/components/charts'
import { CHART_SERIES } from '@/components/charts/chartTheme'

function authHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token') || ''
      : ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function ChartShell({ title, children, source }: { title: string; children: React.ReactNode; source?: string }) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-semibold text-[#3D1212]">{title}</h3>
        {source && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B5E52] border border-[#E8E0D4] rounded px-2 py-1 bg-white">
            {source}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#D9D0C4] bg-[#FFFEF9] px-6 py-16 text-center">
      <p className="text-sm font-medium text-[#3D1212]">{label}</p>
      <p className="mt-1 text-xs text-[#6B5E52]">Charts appear when live records exist — no sample data.</p>
    </div>
  )
}

function LoadingBlock() {
  return (
    <div className="rounded-xl border border-[#E8E0D4] bg-white px-6 py-16 text-center text-sm text-[#6B5E52]">
      Loading live metrics…
    </div>
  )
}

function KpiRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((k) => (
        <div key={k.label} className="rounded-xl border border-[#E8E0D4] bg-white px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-[#6B5E52]">{k.label}</div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-[#3D1212]">{k.value}</div>
        </div>
      ))}
    </div>
  )
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n).toLocaleString()}`
}

// ── CRM ────────────────────────────────────────────────────────────────
export function CRMAnalyticsCharts() {
  const [loading, setLoading] = useState(true)
  const [pipeline, setPipeline] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/wave8/pipeline', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) setPipeline(d.data)
        else setError(d?.error || 'Could not load pipeline')
      })
      .catch(() => setError('Pipeline API unavailable'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <ChartShell title="CRM Analytics"><LoadingBlock /></ChartShell>
  if (error || !pipeline) return <ChartShell title="CRM Analytics"><EmptyChart label={error || 'No CRM pipeline data'} /></ChartShell>

  const leadStages = (pipeline.leads || []).map((r: any) => ({
    name: r.stage || 'Unknown',
    count: r.count || 0,
    value: r.value || 0,
  }))
  const dealStages = (pipeline.deals || []).map((r: any) => ({
    name: r.stage || 'Unknown',
    count: r.count || 0,
    value: r.value || 0,
  }))
  const tiers = (pipeline.aiTiers || []).map((r: any) => ({
    name: r.tier || 'Unscored',
    value: r.count || 0,
  }))
  const hasData = leadStages.length + dealStages.length + tiers.length > 0

  if (!hasData) {
    return (
      <ChartShell title="CRM Analytics" source="Live · Wave 8">
        <EmptyChart label="No leads or deals yet — add records in Smart CRM" />
      </ChartShell>
    )
  }

  return (
    <ChartShell title="CRM Analytics" source="Live · Wave 8">
      <KpiRow
        items={[
          { label: 'Lead value', value: fmtMoney(pipeline.totals?.totalLeadValue || 0) },
          { label: 'Deal value', value: fmtMoney(pipeline.totals?.totalDealValue || 0) },
          { label: 'Pipeline total', value: fmtMoney(pipeline.totals?.totalPipelineValue || 0) },
          { label: 'AI tiers', value: String(tiers.reduce((s: number, t: any) => s + t.value, 0)) },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
        {leadStages.length > 0 && (
          <BarChartCard title="Leads by stage" data={leadStages} dataKeys={['count', 'value']} height={260} />
        )}
        {tiers.length > 0 ? (
          <PieChartCard title="Lead AI tiers" data={tiers} colors={[...CHART_SERIES]} height={260} />
        ) : dealStages.length > 0 ? (
          <BarChartCard title="Deals by stage" data={dealStages} dataKeys={['count', 'value']} height={260} />
        ) : null}
      </div>
    </ChartShell>
  )
}

// ── Finance ────────────────────────────────────────────────────────────
export function FinanceAnalyticsCharts() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const h = authHeaders()
    Promise.all([
      fetch('/api/finance/summary', { headers: h }).then((r) => r.json()).catch(() => null),
      fetch('/api/finance/invoices?limit=200', { headers: h }).then((r) => r.json()).catch(() => null),
    ]).then(([sum, inv]) => {
      if (sum?.success) setSummary(sum.data)
      else setError(sum?.error || 'Finance summary unavailable')
      if (inv?.success && Array.isArray(inv.data)) setInvoices(inv.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <ChartShell title="Finance Analytics"><LoadingBlock /></ChartShell>
  if (error && !summary) return <ChartShell title="Finance Analytics"><EmptyChart label={error} /></ChartShell>

  const byStatus: Record<string, number> = {}
  const byType: Record<string, number> = {}
  invoices.forEach((inv) => {
    const st = inv.status || 'Unknown'
    const ty = inv.type || 'Other'
    byStatus[st] = (byStatus[st] || 0) + 1
    byType[ty] = (byType[ty] || 0) + (inv.amount || 0)
  })
  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }))
  const typeData = Object.entries(byType).map(([name, value]) => ({ name, value }))
  const empty = !summary || (
    (summary.totalInvoices || 0) === 0 &&
    (summary.totalPayments || 0) === 0 &&
    (summary.totalJournalEntries || 0) === 0
  )

  if (empty && statusData.length === 0) {
    return (
      <ChartShell title="Finance Analytics" source="Live · Finance API">
        <EmptyChart label="No invoices, payments, or journals yet" />
      </ChartShell>
    )
  }

  return (
    <ChartShell title="Finance Analytics" source="Live · Finance API">
      <KpiRow
        items={[
          { label: 'Receivable', value: fmtMoney(summary?.totalReceivable || 0) },
          { label: 'Collected', value: fmtMoney(summary?.totalCollected || 0) },
          { label: 'Overdue', value: String(summary?.overdueInvoices || 0) },
          { label: 'Journals', value: String(summary?.totalJournalEntries || 0) },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
        {statusData.length > 0 && (
          <PieChartCard title="Invoices by status" data={statusData} height={260} />
        )}
        {typeData.length > 0 && (
          <BarChartCard title="Amount by invoice type" data={typeData} dataKeys={['value']} height={260} />
        )}
      </div>
      {statusData.length === 0 && typeData.length === 0 && (
        <p className="text-xs text-[#6B5E52]">Summary loaded — add invoices to unlock breakdown charts.</p>
      )}
    </ChartShell>
  )
}

// ── Sales / Orders ─────────────────────────────────────────────────────
export function SalesAnalyticsCharts() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const h = authHeaders()
    Promise.all([
      fetch('/api/orders/summary', { headers: h }).then((r) => r.json()).catch(() => null),
      fetch('/api/orders?limit=200', { headers: h }).then((r) => r.json()).catch(() => null),
    ]).then(([sum, list]) => {
      if (sum?.success) setSummary(sum.data)
      else setError(sum?.error || 'Orders summary unavailable')
      if (list?.success && Array.isArray(list.data)) setOrders(list.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <ChartShell title="Sales Analytics"><LoadingBlock /></ChartShell>
  if (error && !summary) return <ChartShell title="Sales Analytics"><EmptyChart label={error} /></ChartShell>

  const byStatus: Record<string, number> = {}
  const byChannel: Record<string, number> = {}
  orders.forEach((o) => {
    byStatus[o.status || 'Unknown'] = (byStatus[o.status || 'Unknown'] || 0) + 1
    const ch = o.channel || 'Direct'
    byChannel[ch] = (byChannel[ch] || 0) + (o.amount || 0)
  })
  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }))
  const channelData = Object.entries(byChannel).map(([name, value]) => ({ name, value }))

  if ((summary?.totalOrders || 0) === 0 && orders.length === 0) {
    return (
      <ChartShell title="Sales Analytics" source="Live · Orders API">
        <EmptyChart label="No orders yet" />
      </ChartShell>
    )
  }

  return (
    <ChartShell title="Sales Analytics" source="Live · Orders API">
      <KpiRow
        items={[
          { label: 'Orders', value: String(summary?.totalOrders || orders.length) },
          { label: 'Pending', value: String(summary?.pending || 0) },
          { label: 'Completed', value: String(summary?.completed || 0) },
          { label: 'Total amount', value: fmtMoney(summary?.totalAmount || 0) },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
        {statusData.length > 0 && <PieChartCard title="Orders by status" data={statusData} height={260} />}
        {channelData.length > 0 && <BarChartCard title="Amount by channel" data={channelData} dataKeys={['value']} height={260} />}
      </div>
    </ChartShell>
  )
}

// ── Inventory ──────────────────────────────────────────────────────────
export function InventoryAnalyticsCharts() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const h = authHeaders()
    Promise.all([
      fetch('/api/inventory/summary', { headers: h }).then((r) => r.json()).catch(() => null),
      fetch('/api/inventory?limit=200', { headers: h }).then((r) => r.json()).catch(() => null),
    ]).then(([sum, list]) => {
      if (sum?.success) setSummary(sum.data)
      else setError(sum?.error || 'Inventory summary unavailable')
      if (list?.success && Array.isArray(list.data)) setItems(list.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <ChartShell title="Inventory Analytics"><LoadingBlock /></ChartShell>
  if (error && !summary) return <ChartShell title="Inventory Analytics"><EmptyChart label={error} /></ChartShell>

  const byWh: Record<string, number> = {}
  items.forEach((it) => {
    const wh = it.warehouse || it.location || 'Unassigned'
    byWh[wh] = (byWh[wh] || 0) + (it.onHand || 0)
  })
  const whData = Object.entries(byWh).map(([name, value]) => ({ name, value }))

  if ((summary?.totalSKUs || 0) === 0 && items.length === 0) {
    return (
      <ChartShell title="Inventory Analytics" source="Live · Inventory API">
        <EmptyChart label="No stock items yet" />
      </ChartShell>
    )
  }

  return (
    <ChartShell title="Inventory Analytics" source="Live · Inventory API">
      <KpiRow
        items={[
          { label: 'SKUs', value: String(summary?.totalSKUs || 0) },
          { label: 'Stock value', value: fmtMoney(summary?.totalValue || 0) },
          { label: 'Low stock', value: String(summary?.lowStockItems || 0) },
          { label: 'Expiring batches', value: String(summary?.expiringBatches || 0) },
        ]}
      />
      {whData.length > 0 && (
        <div className="pt-2">
          <BarChartCard title="On-hand by warehouse" data={whData} dataKeys={['value']} height={260} />
        </div>
      )}
    </ChartShell>
  )
}

function UnavailableDomainCharts({ title, reason }: { title: string; reason: string }) {
  return (
    <ChartShell title={title} source="Not connected">
      <EmptyChart label={reason} />
    </ChartShell>
  )
}

export function HRAnalyticsCharts() {
  return <UnavailableDomainCharts title="HR Analytics" reason="No live HR metrics endpoint — charts stay empty until HR data is wired" />
}

export function LogisticsAnalyticsCharts() {
  return <UnavailableDomainCharts title="Logistics Analytics" reason="No live logistics metrics endpoint — charts stay empty until fleet/shipment data is wired" />
}

export function ExecutiveAnalyticsCharts() {
  return <UnavailableDomainCharts title="Executive Analytics" reason="Executive rollups need live Finance + CRM + Orders — open those domains for real charts" />
}

export function InvestorAnalyticsCharts() {
  return <UnavailableDomainCharts title="Investor Analytics" reason="No live investor / share-price feed connected" />
}

export function CompetitorAnalyticsCharts() {
  return <UnavailableDomainCharts title="Competitor Analytics" reason="No live competitor intelligence feed connected" />
}
