'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ConsoleShell, Card, api } from './_shell'

const HRConsole = dynamic(() => import('./HRConsole'), { ssr: false })
const CRMConsole = dynamic(() => import('./CRMConsole'), { ssr: false })
const FinanceConsole = dynamic(() => import('./FinanceConsole'), { ssr: false })
const LogisticsConsole = dynamic(() => import('./LogisticsConsole'), { ssr: false })
const ManufacturingConsole = dynamic(() => import('./ManufacturingConsole'), { ssr: false })
const ApprovalsConsole = dynamic(() => import('./ApprovalsConsole'), { ssr: false })
const PricingConsole = dynamic(() => import('./PricingConsole'), { ssr: false })
const SalesOpsConsole = dynamic(() => import('./SalesOpsConsole'), { ssr: false })
const CustomerServiceConsole = dynamic(() => import('./CustomerServiceConsole'), { ssr: false })
const MarketingConsole = dynamic(() => import('./MarketingConsole'), { ssr: false })
const ContractsConsole = dynamic(() => import('./ContractsConsole'), { ssr: false })
const CompetitorAnalysisConsole = dynamic(() => import('./CompetitorAnalysisConsole'), { ssr: false })
const TerritoryManagementConsole = dynamic(() => import('./TerritoryManagementConsole'), { ssr: false })
const CommissionTrackingConsole = dynamic(() => import('./CommissionTrackingConsole'), { ssr: false })
const DealDeskConsole = dynamic(() => import('./DealDeskConsole'), { ssr: false })
const SalesForecastingConsole = dynamic(() => import('./SalesForecastingConsole'), { ssr: false })

type TabKey =
  | 'hr'
  | 'crm'
  | 'finance'
  | 'logistics'
  | 'manufacturing'
  | 'approvals'
  | 'pricing'
  | 'sales-ops'
  | 'customer-service'
  | 'marketing'
  | 'contracts'
  | 'competitor-analysis'
  | 'territory'
  | 'commissions'
  | 'deal-desk'
  | 'forecasting'
  | 'warehouse'
  | 'quality'
  | 'compliance'
  | 'vendors'
  | 'purchase-plans'
  | 'replenishment'
  | 'receiving'
  | 'returns'
  | 'supplier-scorecards'
  | 'trade-docs'
  | 'payroll'
  | 'ar'
  | 'ap'
  | 'treasury'
  | 'financial-plan'
  | 'recruitment'
  | 'performance'
  | 'learning'
  | 'workforce-plan'
  | 'talent-acquisition'
  | 'projects'
  | 'maintenance'
  | 'assets'
  | 'grc'
  | 'audit'
  | 'risk'
  | 'facilities'
  | 'incidents'
  | 'audit-trail'
  | 'bi-reports'
  | 'okr'
  | 'ai-insights'
  | 'tax'
  | 'fx'
  | 'documents'
  | 'integrations'
  | 'admin-users'
  | 'data-ocean'
  | 'board-packs'
  | 'funfeed'
  | 'mall'
  | 'trade-floor'
  | 'crypto'
  | 'harvicoins'
  | 'hpay'
  | 'referrals'
  | 'jobs'
  | 'experts'
  | 'portals'
  | 'playroom'

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'hr', label: 'HR', icon: '👥' },
  { key: 'crm', label: 'CRM', icon: '🤝' },
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'logistics', label: 'Logistics', icon: '🚚' },
  { key: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { key: 'approvals', label: 'Approvals', icon: '🔔' },
  { key: 'pricing', label: 'Pricing', icon: '💵' },
  { key: 'sales-ops', label: 'Sales Ops', icon: '📊' },
  { key: 'customer-service', label: 'Support', icon: '📞' },
  { key: 'marketing', label: 'Marketing', icon: '📢' },
  { key: 'contracts', label: 'Contracts', icon: '📋' },
  { key: 'competitor-analysis', label: 'Competitors', icon: '🎯' },
  { key: 'territory', label: 'Territory', icon: '🗺️' },
  { key: 'commissions', label: 'Commissions', icon: '💳' },
  { key: 'deal-desk', label: 'Deal Desk', icon: '🤝' },
  { key: 'forecasting', label: 'Forecast', icon: '📈' },
  { key: 'warehouse', label: 'Warehouse', icon: '🏬' },
  { key: 'quality', label: 'Quality', icon: '✅' },
  { key: 'compliance', label: 'Compliance', icon: '🛡️' },
  { key: 'vendors', label: 'Vendors', icon: '🏢' },
  { key: 'purchase-plans', label: 'Purchase Plans', icon: '🧾' },
  { key: 'replenishment', label: 'Replenishment', icon: '🔁' },
  { key: 'receiving', label: 'Receiving', icon: '📦' },
  { key: 'returns', label: 'Returns', icon: '↩️' },
  { key: 'supplier-scorecards', label: 'Scorecards', icon: '📑' },
  { key: 'trade-docs', label: 'Trade Docs', icon: '📁' },
  { key: 'payroll', label: 'Payroll', icon: '💼' },
  { key: 'ar', label: 'AR', icon: '📥' },
  { key: 'ap', label: 'AP', icon: '📤' },
  { key: 'treasury', label: 'Treasury', icon: '🏦' },
  { key: 'financial-plan', label: 'Fin Plan', icon: '📊' },
  { key: 'recruitment', label: 'Recruitment', icon: '🎯' },
  { key: 'performance', label: 'Performance', icon: '⭐' },
  { key: 'learning', label: 'Learning', icon: '📚' },
  { key: 'workforce-plan', label: 'Workforce', icon: '👨‍💼' },
  { key: 'talent-acquisition', label: 'Talent', icon: '🌟' },
  { key: 'projects', label: 'Projects', icon: '📋' },
  { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { key: 'assets', label: 'Assets', icon: '🏗️' },
  { key: 'grc', label: 'GRC', icon: '⚖️' },
  { key: 'audit', label: 'Audit', icon: '🔍' },
  { key: 'risk', label: 'Risk', icon: '⚠️' },
  { key: 'facilities', label: 'Facilities', icon: '🏢' },
  { key: 'incidents', label: 'Incidents', icon: '🚨' },
  { key: 'audit-trail', label: 'Audit Trail', icon: '📜' },
  { key: 'bi-reports', label: 'BI Reports', icon: '📊' },
  { key: 'okr', label: 'OKR', icon: '🎯' },
  { key: 'ai-insights', label: 'AI Insights', icon: '🤖' },
  { key: 'tax', label: 'Tax', icon: '🧾' },
  { key: 'fx', label: 'FX Rates', icon: '💱' },
  { key: 'documents', label: 'Documents', icon: '📁' },
  { key: 'integrations', label: 'Integrations', icon: '🔗' },
  { key: 'admin-users', label: 'Admin', icon: '🔐' },
  { key: 'data-ocean', label: 'Data Ocean', icon: '🌊' },
  { key: 'board-packs', label: 'Board Pack', icon: '📋' },
  { key: 'funfeed', label: 'FunFeed', icon: '📱' },
  { key: 'mall', label: 'Mall', icon: '🛍️' },
  { key: 'trade-floor', label: 'Trade Floor', icon: '📈' },
  { key: 'crypto', label: 'Crypto', icon: '₿' },
  { key: 'harvicoins', label: 'Harvicoins', icon: '🪙' },
  { key: 'hpay', label: 'HPay', icon: '💳' },
  { key: 'referrals', label: 'Referrals', icon: '🤝' },
  { key: 'jobs', label: 'Jobs', icon: '💼' },
  { key: 'experts', label: 'Experts', icon: '🎓' },
  { key: 'portals', label: 'Portals', icon: '🌐' },
  { key: 'playroom', label: 'Playroom', icon: '🎮' },
]

const TAB_BY_KEY: Record<TabKey, { label: string; icon: string }> = Object.fromEntries(
  TABS.map(t => [t.key, { label: t.label, icon: t.icon }]),
) as Record<TabKey, { label: string; icon: string }>

const TAB_GROUPS: Array<{ title: string; keys: TabKey[] }> = [
  {
    title: 'Core',
    keys: ['hr', 'crm', 'finance', 'logistics', 'manufacturing', 'approvals'],
  },
  {
    title: 'Commercial',
    keys: ['pricing', 'sales-ops', 'customer-service', 'marketing', 'contracts', 'competitor-analysis', 'territory', 'commissions', 'deal-desk', 'forecasting'],
  },
  {
    title: 'Supply',
    keys: ['warehouse', 'quality', 'compliance', 'vendors', 'purchase-plans', 'replenishment', 'receiving', 'returns', 'supplier-scorecards', 'trade-docs'],
  },
  {
    title: 'Finance + People',
    keys: ['payroll', 'ar', 'ap', 'treasury', 'financial-plan', 'recruitment', 'performance', 'learning', 'workforce-plan', 'talent-acquisition'],
  },
  {
    title: 'Ops + GRC',
    keys: ['projects', 'maintenance', 'assets', 'grc', 'audit', 'risk', 'facilities', 'incidents', 'audit-trail'],
  },
  {
    title: 'Analytics',
    keys: ['bi-reports', 'okr', 'ai-insights', 'board-packs', 'tax', 'fx', 'documents', 'integrations', 'admin-users', 'data-ocean'],
  },
  {
    title: 'Universe + Portals',
    keys: ['funfeed', 'mall', 'trade-floor', 'crypto', 'harvicoins', 'hpay', 'referrals', 'jobs', 'experts', 'portals', 'playroom'],
  },
]

export default function ERPConsoles() {
  const [tab, setTab] = useState<TabKey>('hr')

  return (
    <section className="mx-auto mt-6 w-[min(1400px,94vw)] space-y-4">
      <div className="rounded-2xl border border-[#e8e2d5] bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="space-y-3">
          {TAB_GROUPS.map(group => (
            <div key={group.title} className="rounded-xl border border-[#efe9dd] bg-[#fffdf9] p-2">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-harvics-burgundy">{group.title}</p>
              <div className="flex flex-wrap gap-1">
                {group.keys.map(key => {
                  const def = TAB_BY_KEY[key]
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTab(key)}
                      className={`rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition ${
                        tab === key ? 'bg-harvics-burgundy text-white shadow' : 'text-[#3a3a3a] hover:bg-[#f5efe2]'
                      }`}
                    >
                      <span className="mr-1">{def.icon}</span>
                      {def.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {tab === 'hr' && <HRConsole />}
      {tab === 'crm' && <CRMConsole />}
      {tab === 'finance' && <FinanceConsole />}
      {tab === 'logistics' && <LogisticsConsole />}
      {tab === 'manufacturing' && <ManufacturingConsole />}
      {tab === 'approvals' && <ApprovalsConsole />}
      {tab === 'pricing' && <PricingConsole />}
      {tab === 'sales-ops' && <SalesOpsConsole />}
      {tab === 'customer-service' && <CustomerServiceConsole />}
      {tab === 'marketing' && <MarketingConsole />}
      {tab === 'contracts' && <ContractsConsole />}
      {tab === 'competitor-analysis' && <CompetitorAnalysisConsole />}
      {tab === 'territory' && <TerritoryManagementConsole />}
      {tab === 'commissions' && <CommissionTrackingConsole />}
      {tab === 'deal-desk' && <DealDeskConsole />}
      {tab === 'forecasting' && <SalesForecastingConsole />}
      {tab === 'warehouse' && <Batch3Console title="Warehouse" endpoint="warehouse" subtitle="Warehouse utilization, occupancy, and risk." />}
      {tab === 'quality' && <Batch3Console title="Quality" endpoint="quality" subtitle="Inspection outcomes and defect tracking." />}
      {tab === 'compliance' && <Batch3Console title="Compliance" endpoint="compliance" subtitle="Regulatory controls and due dates." />}
      {tab === 'vendors' && <Batch3Console title="Vendor Management" endpoint="vendors" subtitle="Supplier performance and reliability." />}
      {tab === 'purchase-plans' && <Batch3Console title="Purchase Plans" endpoint="purchase-plans" subtitle="Planned vs approved buy quantities." />}
      {tab === 'replenishment' && <Batch3Console title="Replenishment" endpoint="replenishment" subtitle="Reorder triggers and suggested quantities." />}
      {tab === 'receiving' && <Batch3Console title="Receiving" endpoint="receiving" subtitle="Goods receipt and discrepancy monitoring." />}
      {tab === 'returns' && <Batch3Console title="Returns" endpoint="returns" subtitle="RMA queue and resolution status." />}
      {tab === 'supplier-scorecards' && <Batch3Console title="Supplier Scorecards" endpoint="supplier-scorecards" subtitle="Quarterly supplier KPI scoring." />}
      {tab === 'trade-docs' && <Batch3Console title="Trade Documents" endpoint="trade-docs" subtitle="Shipping document verification." />}
      {tab === 'payroll' && <Batch3Console title="Payroll" endpoint="batch4/payroll" subtitle="Employee compensation and processing." />}
      {tab === 'ar' && <Batch3Console title="Accounts Receivable" endpoint="batch4/ar" subtitle="Customer invoices and collections." />}
      {tab === 'ap' && <Batch3Console title="Accounts Payable" endpoint="batch4/ap" subtitle="Vendor invoices and payment obligations." />}
      {tab === 'treasury' && <Batch3Console title="Treasury" endpoint="batch4/treasury" subtitle="Cash management and risk exposure." />}
      {tab === 'financial-plan' && <Batch3Console title="Financial Planning" endpoint="batch4/financial-plan" subtitle="Budget vs actual variance tracking." />}
      {tab === 'recruitment' && <Batch3Console title="Recruitment" endpoint="batch4/recruitment" subtitle="Job openings and hiring pipeline." />}
      {tab === 'performance' && <Batch3Console title="Performance Management" endpoint="batch4/performance" subtitle="Employee reviews and ratings." />}
      {tab === 'learning' && <Batch3Console title="Learning Management" endpoint="batch4/learning" subtitle="Training courses and enrollment." />}
      {tab === 'workforce-plan' && <Batch3Console title="Workforce Planning" endpoint="batch4/workforce-plan" subtitle="Headcount and retention planning." />}
      {tab === 'talent-acquisition' && <Batch3Console title="Talent Acquisition" endpoint="batch4/talent-acquisition" subtitle="Candidate pipeline and hiring stages." />}
      {tab === 'projects' && <Batch3Console title="Project Management" endpoint="batch5/projects" subtitle="Project portfolio, timelines, and budgets." />}
      {tab === 'maintenance' && <Batch3Console title="Maintenance" endpoint="batch5/maintenance" subtitle="Preventive and corrective asset maintenance." />}
      {tab === 'assets' && <Batch3Console title="Asset Management" endpoint="batch5/assets" subtitle="Fixed assets, depreciation, and lifecycle." />}
      {tab === 'grc' && <Batch3Console title="GRC" endpoint="batch5/grc" subtitle="Governance, risk, and compliance controls." />}
      {tab === 'audit' && <Batch3Console title="Internal Audit" endpoint="batch5/audit" subtitle="Audit scope, findings, and recommendations." />}
      {tab === 'risk' && <Batch3Console title="Risk Management" endpoint="batch5/risk" subtitle="Risk assessment, mitigation, and tracking." />}
      {tab === 'facilities' && <Batch3Console title="Facilities" endpoint="batch5/facilities" subtitle="Real estate, maintenance, and utilization." />}
      {tab === 'incidents' && <Batch3Console title="Incident Management" endpoint="batch5/incidents" subtitle="Incident reporting, severity, and resolution." />}
      {tab === 'audit-trail' && <Batch3Console title="Audit Trail" endpoint="batch5/audit-trail" subtitle="Complete system activity and change log." />}
      {tab === 'bi-reports' && <BIReportsConsole />}
      {tab === 'okr' && <OKRConsole />}
      {tab === 'ai-insights' && <AIInsightsConsole />}
      {tab === 'tax' && <Batch3Console title="Tax Engine" endpoint="batch6/tax" subtitle="Multi-country tax rules and rates." />}
      {tab === 'fx' && <Batch3Console title="FX Engine" endpoint="batch6/fx" subtitle="Live foreign exchange rates." />}
      {tab === 'documents' && <Batch3Console title="Document Vault" endpoint="batch6/documents" subtitle="Centralised document management." />}
      {tab === 'integrations' && <Batch3Console title="Integration Bus" endpoint="batch6/integrations" subtitle="External system connectors and sync status." />}
      {tab === 'admin-users' && <Batch3Console title="Admin & Security" endpoint="batch6/admin-users" subtitle="User access, roles, and MFA." />}
      {tab === 'data-ocean' && <Batch3Console title="Data Ocean" endpoint="batch6/data-ocean" subtitle="Real-time data streams and pipelines." />}
      {tab === 'board-packs' && <BoardPacksConsole />}
      {tab === 'funfeed' && <Batch3Console title="FunFeed" endpoint="batch7/funfeed" subtitle="Internal social feed and activity." />}
      {tab === 'mall' && <Batch3Console title="Harvics Mall" endpoint="batch7/mall" subtitle="B2C product listings and marketplace." />}
      {tab === 'trade-floor' && <Batch3Console title="Trade Floor" endpoint="batch7/trade-floor" subtitle="Commodity bids, asks, and live prices." />}
      {tab === 'crypto' && <Batch3Console title="Crypto Lite" endpoint="batch7/crypto" subtitle="Cryptocurrency prices and market data." />}
      {tab === 'harvicoins' && <Batch3Console title="Harvicoins" endpoint="batch7/harvicoins" subtitle="Loyalty coin balances and tiers." />}
      {tab === 'hpay' && <Batch3Console title="HPay Wallet" endpoint="batch7/hpay" subtitle="Digital wallet balances and transactions." />}
      {tab === 'referrals' && <Batch3Console title="Circle Referral" endpoint="batch7/referrals" subtitle="Referral rewards and program tracking." />}
      {tab === 'jobs' && <Batch3Console title="Jobs & Travel" endpoint="batch7/jobs" subtitle="Job listings and placement services." />}
      {tab === 'experts' && <Batch3Console title="Experts Hub" endpoint="batch7/experts" subtitle="Expert marketplace and session booking." />}
      {tab === 'portals' && <Batch3Console title="Portals" endpoint="batch7/portals" subtitle="Customer, vendor, and field officer portal activity." />}
      {tab === 'playroom' && <Batch3Console title="Playroom" endpoint="batch7/playroom" subtitle="Gamification and engagement stats." />}
    </section>
  )
}

// Determine the real API base path from the endpoint string
function resolveEndpointUrl(endpoint: string): string {
  // endpoints like "batch4/payroll", "batch5/grc", "batch6/bi-reports", "batch7/funfeed"
  // or bare names like "warehouse" (batch3)
  if (endpoint.startsWith('batch')) return `/api/modules/demo/${endpoint}`
  return `/api/modules/demo/batch3/${endpoint}`
}

// Return a human label for a field key
function fieldLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, s => s.toUpperCase()).trim()
}

const STATUS_CLASSES: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Live: 'bg-emerald-100 text-emerald-700',
  Open: 'bg-sky-100 text-sky-700',
  'In Progress': 'bg-sky-100 text-sky-700',
  Mitigating: 'bg-sky-100 text-sky-700',
  Pending: 'bg-amber-100 text-amber-700',
  'At Risk': 'bg-amber-100 text-amber-700',
  Overdue: 'bg-rose-100 text-rose-700',
  Failed: 'bg-rose-100 text-rose-700',
  Error: 'bg-rose-100 text-rose-700',
  Closed: 'bg-slate-100 text-slate-600',
  Archived: 'bg-slate-100 text-slate-600',
}

// Renders all fields in a row as labelled chips — no raw JSON dump
function RowCard({ row }: { row: Record<string, any> }) {
  const entries = Object.entries(row).filter(([k]) => k !== 'id')
  const statusVal = row.status as string | undefined
  const statusCls = statusVal ? (STATUS_CLASSES[statusVal] || 'bg-slate-100 text-slate-600') : ''

  // Detect primary label candidates
  const primaryKey = ['name', 'title', 'employeeName', 'vendorName', 'customerName',
    'headline', 'gameName', 'courseTitle', 'jobTitle', 'candidateName',
    'productName', 'commodity', 'symbol', 'streamName'].find(k => row[k])
  const primary = primaryKey ? String(row[primaryKey]) : row.id
  const secondaryKey = ['company', 'period', 'type', 'category', 'department',
    'specialty', 'framework', 'provider', 'source', 'direction'].find(k => row[k] && k !== primaryKey)
  const secondary = secondaryKey ? String(row[secondaryKey]) : null

  // Fields to render as chips (skip primary/secondary/id)
  const chipFields = entries.filter(([k]) =>
    k !== primaryKey && k !== secondaryKey && k !== 'status' &&
    !['description', 'feedback', 'content', 'changes', 'sections', 'resolution',
      'mitigation', 'detail', 'createdAt', 'updatedAt', 'lastUpdated', 'lastActivity',
      'processedDate', 'uploadedAt', 'timestamp', 'generatedAt', 'lastLogin', 'lastSync',
      'lastExecuted', 'postedDate', 'appliedDate', 'scheduledDate', 'completedDate', 'resolvedDate'].includes(k)
  )

  // Pick any numeric-looking value as a highlight
  const highlight = chipFields.find(([, v]) => typeof v === 'number')

  return (
    <div className="rounded-xl border border-[#e8e2d5] bg-[#fdfcfb] p-3 shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-[#1a1a1a]">{primary}</p>
          {secondary && <p className="text-[10px] text-[#5d5d5d]">{secondary}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {statusVal && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusCls}`}>{statusVal}</span>}
          {highlight && <span className="font-mono text-[11px] font-bold text-harvics-burgundy">{typeof highlight[1] === 'number' && (highlight[0].toLowerCase().includes('amount') || highlight[0].toLowerCase().includes('value') || highlight[0].toLowerCase().includes('salary') || highlight[0].toLowerCase().includes('cost') || highlight[0].toLowerCase().includes('price') || highlight[0].toLowerCase().includes('balance') || highlight[0].toLowerCase().includes('reward') || highlight[0].toLowerCase().includes('rate') || highlight[0].toLowerCase().includes('budget') || highlight[0].toLowerCase().includes('ltv')) ? `$${(highlight[1] as number).toLocaleString()}` : (highlight[1] as number).toLocaleString()}</span>}
        </div>
      </div>
      {chipFields.filter(([k]) => !highlight || k !== highlight[0]).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {chipFields.filter(([k]) => !highlight || k !== highlight[0]).slice(0, 6).map(([k, v]) => (
            <span key={k} className="rounded bg-[#f5efe2] px-1.5 py-0.5 text-[9px] text-[#5d5d5d]">
              <span className="font-bold text-[#3a3a3a]">{fieldLabel(k)}: </span>{String(v)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Batch3Console({ title, subtitle, endpoint }: { title: string; subtitle: string; endpoint: string }) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const url = resolveEndpointUrl(endpoint)
    const r = await api<any[]>(url)
    if (r.ok && r.data) setRows(r.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [endpoint])

  const activeCount = rows.filter(r => ['Active','Completed','Live','Open','In Progress','Mitigating'].includes(r.status)).length
  const atRiskCount = rows.filter(r => ['At Risk','Pending','Overdue','Error','Failed'].includes(r.status)).length

  return (
    <ConsoleShell
      title={title}
      subtitle={subtitle}
      kpis={[
        { label: 'Total', value: rows.length },
        { label: 'Active / Good', value: activeCount },
        { label: 'Needs Attention', value: atRiskCount },
        { label: 'Closed / Done', value: rows.length - activeCount - atRiskCount },
      ]}
      onRefresh={load}
      loading={loading}
    >
      {rows.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-[#e8e2d5] py-12 text-center">
          <p className="text-sm font-bold text-[#b0a090]">No records yet</p>
          <p className="text-xs text-[#c8c0b0]">{subtitle}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, i) => <RowCard key={row.id || i} row={row} />)}
        </div>
      )}
    </ConsoleShell>
  )
}

function BIReportsConsole() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const load = async () => {
    setLoading(true)
    const r = await api<any[]>('/api/modules/demo/batch6/bi-reports')
    if (r.ok && r.data) setRows(r.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const maxViews = Math.max(...rows.map(r => Number(r.views || 0)), 1)
  const totalViews = rows.reduce((s, r) => s + Number(r.views || 0), 0)

  return (
    <ConsoleShell
      title="BI & Reporting"
      subtitle="Executive dashboards, operational reporting, and usage signals."
      kpis={[
        { label: 'Reports', value: rows.length },
        { label: 'Total Views', value: totalViews },
        { label: 'Ready', value: rows.filter(r => r.status === 'Ready').length },
        { label: 'Running/Failed', value: rows.filter(r => r.status !== 'Ready').length },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r, i) => (
          <Card key={r.id || i} title={r.name}>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5d5d5d]">Type</span>
                <span className="font-bold">{r.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5d5d5d]">Period</span>
                <span className="font-mono">{r.period}</span>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[#5d5d5d]">Views</span>
                  <span className="font-mono font-bold">{r.views}</span>
                </div>
                <div className="h-2 rounded bg-[#f0ece3]">
                  <div className="h-2 rounded bg-harvics-burgundy" style={{ width: `${Math.max((Number(r.views || 0) / maxViews) * 100, 6)}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#5d5d5d]">Status</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' : r.status === 'Running' ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'}`}>{r.status}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  )
}

function OKRConsole() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const load = async () => {
    setLoading(true)
    const r = await api<any[]>('/api/modules/demo/batch6/okr')
    if (r.ok && r.data) setRows(r.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  return (
    <ConsoleShell
      title="OKR Tracking"
      subtitle="Objectives, key results progress, and execution health."
      kpis={[
        { label: 'Objectives', value: rows.length },
        { label: 'Average Progress', value: `${rows.length ? Math.round(rows.reduce((s, r) => s + Number(r.progress || 0), 0) / rows.length) : 0}%` },
        { label: 'On Track', value: rows.filter(r => r.status === 'On Track').length },
        { label: 'At Risk/Behind', value: rows.filter(r => r.status !== 'On Track' && r.status !== 'Completed').length },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r, i) => (
          <Card key={r.id || i} title={r.objective}>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5d5d5d]">Owner</span>
                <span className="font-bold">{r.owner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5d5d5d]">Period</span>
                <span className="font-mono">{r.period}</span>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[#5d5d5d]">Progress</span>
                  <span className="font-mono font-bold">{r.progress}%</span>
                </div>
                <div className="h-2 rounded bg-[#f0ece3]">
                  <div className={`h-2 rounded ${Number(r.progress) >= 70 ? 'bg-emerald-500' : Number(r.progress) >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.max(Number(r.progress || 0), 4)}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5d5d5d]">Key Results</span>
                <span className="font-mono">{r.completed}/{r.keyResults}</span>
              </div>
              <div className="flex justify-end">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' : r.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  )
}

function AIInsightsConsole() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const load = async () => {
    setLoading(true)
    const r = await api<any[]>('/api/modules/demo/batch6/ai-insights')
    if (r.ok && r.data) setRows(r.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  return (
    <ConsoleShell
      title="AI Insights"
      subtitle="Anomalies, recommendations, and forecast intelligence with confidence signals."
      kpis={[
        { label: 'Insights', value: rows.length },
        { label: 'Average Confidence', value: `${rows.length ? Math.round(rows.reduce((s, r) => s + Number(r.confidence || 0), 0) / rows.length) : 0}%` },
        { label: 'New', value: rows.filter(r => r.status === 'New').length },
        { label: 'Actioned', value: rows.filter(r => r.status === 'Actioned').length },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r, i) => (
          <div key={r.id || i} className="rounded-2xl border border-[#e8e2d5] bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-[#1a1a1a]">{r.headline}</p>
                <p className="text-[11px] text-[#5d5d5d]">{r.module} · {r.type}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.type === 'Anomaly' ? 'bg-rose-100 text-rose-700' : r.type === 'Recommendation' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>{r.type}</span>
            </div>
            <p className="text-xs text-[#5d5d5d]">{r.detail}</p>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-[#5d5d5d]">Confidence</span>
                <span className="font-mono font-bold">{r.confidence}%</span>
              </div>
              <div className="h-2 rounded bg-[#f0ece3]">
                <div className={`h-2 rounded ${Number(r.confidence) >= 80 ? 'bg-emerald-500' : Number(r.confidence) >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.max(Number(r.confidence || 0), 4)}%` }} />
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'New' ? 'bg-sky-100 text-sky-700' : r.status === 'Reviewed' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </ConsoleShell>
  )
}

function BoardPacksConsole() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const load = async () => {
    setLoading(true)
    const r = await api<any[]>('/api/modules/demo/batch6/board-packs')
    if (r.ok && r.data) setRows(r.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  return (
    <ConsoleShell
      title="Board Pack Generator"
      subtitle="Executive reporting packs, section coverage, and publication status."
      kpis={[
        { label: 'Board Packs', value: rows.length },
        { label: 'Final', value: rows.filter(r => r.status === 'Final').length },
        { label: 'Draft', value: rows.filter(r => r.status === 'Draft').length },
        { label: 'Distributed', value: rows.filter(r => r.status === 'Distributed').length },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r, i) => (
          <Card key={r.id || i} title={r.title}>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between"><span className="text-[#5d5d5d]">Period</span><span className="font-mono">{r.period}</span></div>
              <div className="flex items-center justify-between"><span className="text-[#5d5d5d]">Generated</span><span>{String(r.generatedAt).slice(0, 10)}</span></div>
              <div>
                <p className="mb-1 text-[#5d5d5d]">Sections</p>
                <div className="flex flex-wrap gap-1">
                  {(r.sections || []).map((s: string) => (
                    <span key={s} className="rounded bg-[#f5efe2] px-1.5 py-0.5 text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'Final' ? 'bg-emerald-100 text-emerald-700' : r.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>{r.status}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  )
}
