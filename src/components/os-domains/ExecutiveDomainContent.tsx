'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import PLOverviewContent from '@/components/domains/executive/PLOverviewContent'
import AlertDashboardContent from '@/components/domains/executive/AlertDashboardContent'
import RiskAlertsContent from '@/components/domains/executive/RiskAlertsContent'
import { ExecutiveAnalyticsCharts } from '@/components/os-domains/DomainAnalyticsCharts'

interface ExecutiveDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function ExecutiveDomainContent({ persona, locale }: ExecutiveDomainContentProps) {
  // Tier 2 Modules for Executive Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'p-l-control',
      label: 'P&L Control Tower',
      icon: '',
      description: 'Company-wide profit & loss tracking and margin control',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              P&L Control Tower
            </h3>
            <p className="text-black">Company-wide profit & loss tracking and margin control</p>
          </div>
        </div>
      ),
      tier3Screens: [
        {
          id: 'pl-overview',
          label: 'P&L Overview',
          icon: '',
          component: <PLOverviewContent persona={persona} locale={locale} />
        },
        {
          id: 'kpis',
          label: 'KPIs',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Executive KPIs</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Revenue YTD', value: '$12.4M', trend: '+18%' }, { label: 'Gross Margin', value: '28.4%', trend: '+1.2%' }, { label: 'EBITDA', value: '$3.2M', trend: '+22%' }, { label: 'Active Markets', value: '42', trend: '+4' }, { label: 'Order Fill Rate', value: '96.8%', trend: '+0.4%' }, { label: 'Customer NPS', value: '74', trend: '+6' }, { label: 'On-Time Delivery', value: '94.2%', trend: '+2.1%' }, { label: 'Inventory Turns', value: '8.4x', trend: '+0.8x' }].map(k => (
                  <div key={k.label} className="border border-[#E5E5EA]/30 p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xs text-[#8E8E93] uppercase mb-1">{k.label}</div>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{k.value}</div>
                    <div className="text-xs font-semibold text-[#1A1A1A] mt-1">{k.trend} vs last year</div>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        {
          id: 'market-share',
          label: 'Market Share',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Market Share Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Category</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Harvics Share</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Market Size</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">YoY Change</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Trend</th></tr></thead>
                  <tbody>
                    {[{ cat: 'FMCG — UAE', share: '12.4%', size: '$2.1B', yoy: '+1.8%', trend: '↑' }, { cat: 'Textiles — GCC', share: '8.2%', size: '$840M', yoy: '+2.4%', trend: '↑' }, { cat: 'Commodities — PK', share: '15.6%', size: '$1.4B', yoy: '+0.4%', trend: '→' }, { cat: 'Industrial — UAE', share: '6.8%', size: '$420M', yoy: '+3.2%', trend: '↑' }].map((r, i) => (
                      <tr key={r.cat} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.cat}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">{r.share}</td>
                        <td className="px-4 py-3 text-right">{r.size}</td>
                        <td className="px-4 py-3 text-right font-semibold">{r.yoy}</td>
                        <td className="px-4 py-3 text-center text-lg">{r.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'executive-alerts',
      label: 'AI Alerts & Exceptions',
      icon: '',
      description: 'Executive-level AI alerts for critical exceptions and anomalies',
      tier3Screens: [
        {
          id: 'alert-dashboard',
          label: 'Alert Dashboard',
          icon: '',
          component: <AlertDashboardContent persona={persona} locale={locale} />
        },
        {
          id: 'exception-tracking',
          label: 'Exception Tracking',
          icon: '️',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Business Exceptions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Exception</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Domain</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Raised</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Priority</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Owner</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ exc: 'Credit limit breach — Al Fardan', domain: 'Finance', raised: '2h ago', priority: 'High', owner: 'Khalid A.', status: 'Open' }, { exc: 'Stock-out risk — WH-DXB-01', domain: 'Inventory', raised: '4h ago', priority: 'High', owner: 'Ahmed K.', status: 'In Review' }, { exc: 'Delayed shipment TF-002', domain: 'Logistics', raised: '1d ago', priority: 'Medium', owner: 'James O.', status: 'In Review' }, { exc: 'Invoice overdue >60d', domain: 'Finance', raised: '2d ago', priority: 'Medium', owner: 'Sara M.', status: 'Escalated' }].map((e, i) => (
                      <tr key={e.exc} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{e.exc}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{e.domain}</td>
                        <td className="px-4 py-3 text-xs text-[#8E8E93]">{e.raised}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${e.priority === 'High' ? 'bg-[#6B1F2B] text-white' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{e.priority}</span></td>
                        <td className="px-4 py-3">{e.owner}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${e.status === 'Open' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{e.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'alert-history',
          label: 'Alert History',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Alert History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Alert</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Domain</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Severity</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Resolved</th></tr></thead>
                  <tbody>
                    {[{ date: '2026-03-22', alert: 'Cash flow dip below threshold', domain: 'Finance', sev: 'Critical', resolved: 'Yes' }, { date: '2026-03-21', alert: 'Distributor overstock detected', domain: 'CRM', sev: 'Medium', resolved: 'Yes' }, { date: '2026-03-20', alert: 'Route SLA breach — 3 vehicles', domain: 'Logistics', sev: 'High', resolved: 'Yes' }, { date: '2026-03-18', alert: 'VAT filing deadline approaching', domain: 'Finance', sev: 'Medium', resolved: 'Yes' }].map((h, i) => (
                      <tr key={h.date + h.alert} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 text-xs text-[#8E8E93]">{h.date}</td>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{h.alert}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{h.domain}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${h.sev === 'Critical' ? 'bg-[#6B1F2B] text-white' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{h.sev}</span></td>
                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#1A1A1A] text-white" style={{ borderRadius: 0 }}>✓</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'risk-detection',
      label: 'Risk & Fraud Detection',
      icon: '️',
      description: 'Compliance monitoring, fraud detection, and risk assessment',
      tier3Screens: [
        {
          id: 'risk-alerts',
          label: 'Risk Alerts',
          icon: '️',
          component: <RiskAlertsContent persona={persona} locale={locale} />
        },
        {
          id: 'compliance',
          label: 'Compliance',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Compliance Monitoring</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ label: 'Overall Score', value: '94%' }, { label: 'Open Issues', value: '3' }, { label: 'Certifications Active', value: '12' }, { label: 'Next Audit', value: 'Apr 2026' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Regulation</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Jurisdiction</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Score</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Last Review</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ reg: 'VAT / GST', juris: 'UAE, PK, UK', score: 100, last: '2026-01-15', status: 'Compliant' }, { reg: 'HACCP Food Safety', juris: 'UAE', score: 96, last: '2026-02-10', status: 'Compliant' }, { reg: 'OEKO-TEX Textiles', juris: 'Global', score: 88, last: '2025-12-01', status: 'Review Due' }, { reg: 'AML / KYC', juris: 'UAE, UK', score: 95, last: '2026-01-28', status: 'Compliant' }].map((c, i) => (
                      <tr key={c.reg} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{c.reg}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{c.juris}</td>
                        <td className="px-4 py-3 text-right font-semibold">{c.score}%</td>
                        <td className="px-4 py-3 text-xs">{c.last}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${c.status === 'Compliant' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'risk-reports',
          label: 'Risk Reports',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Risk Assessment Reports</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Risk Area</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Category</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Likelihood</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Impact</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Score</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Level</th></tr></thead>
                  <tbody>
                    {[{ area: 'FX Currency Volatility', cat: 'Financial', likelihood: 'High', impact: 'High', score: 16, level: 'Critical' }, { area: 'Single-supplier dependency', cat: 'Supply Chain', likelihood: 'Medium', impact: 'High', score: 12, level: 'High' }, { area: 'Port strike disruption', cat: 'Logistics', likelihood: 'Low', impact: 'High', score: 8, level: 'Medium' }, { area: 'Data breach', cat: 'IT Security', likelihood: 'Low', impact: 'Medium', score: 6, level: 'Medium' }].map((r, i) => (
                      <tr key={r.area} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.area}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{r.cat}</td>
                        <td className="px-4 py-3 text-center">{r.likelihood}</td>
                        <td className="px-4 py-3 text-center">{r.impact}</td>
                        <td className="px-4 py-3 text-right font-semibold">{r.score}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${r.level === 'Critical' ? 'bg-[#6B1F2B] text-white' : r.level === 'High' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{r.level}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'global-ops-center',
      label: 'Global Ops Center',
      icon: '',
      description: 'Real-time global operations command center — all countries, all domains, one view',
      tier3Screens: [
        {
          id: 'live-ops',
          label: 'Live Operations',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Global Operations Command Center</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[{ label: 'Active Countries', value: 42, icon: '' }, { label: 'Live Orders', value: 1247, icon: '' }, { label: 'In-Transit', value: 89, icon: '' }, { label: 'Compliance Score', value: '98%', icon: '' }, { label: 'Revenue Today', value: '$2.4M', icon: '' }].map(k => (
                  <div key={k.label} className="border border-[#E5E5EA]/30 p-4" style={{ borderRadius: 0 }}>
                    <div className="text-2xl mb-1">{k.icon}</div>
                    <div className="text-xs text-[#8E8E93] uppercase">{k.label}</div>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#F5F5F7] border-l-4 border-[#E5E5EA] p-4" style={{ borderRadius: 0 }}>
                <div className="text-sm font-semibold text-[#1A1A1A]">Cross-Domain Status</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {['Orders', 'Inventory', 'Logistics', 'Finance', 'HR', 'Legal', 'Import/Export', 'CRM'].map(d => (
                    <div key={d} className="flex items-center gap-2 text-sm"><span className="w-2 h-2 bg-[#F5F5F7]0" style={{ borderRadius: 0 }}></span><span className="text-[#8E8E93]">{d}: Operational</span></div>
                  ))}
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'country-comparison',
          label: 'Country Comparison',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Country-by-Country Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Country</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Revenue</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Orders</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Growth</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th></tr></thead>
                  <tbody>
                    {[{ country: '🇦🇪 UAE', revenue: '$4.2M', orders: 1247, growth: '+12%', status: 'Strong' }, { country: '🇵🇰 Pakistan', revenue: '$2.8M', orders: 892, growth: '+18%', status: 'Growing' }, { country: '🇬🇧 UK', revenue: '$1.9M', orders: 534, growth: '+8%', status: 'Stable' }, { country: '🇩🇪 Germany', revenue: '$1.5M', orders: 421, growth: '+22%', status: 'Expanding' }].map((c, i) => (
                      <tr key={c.country} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{c.country}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">{c.revenue}</td>
                        <td className="px-4 py-3 text-right">{c.orders.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right"><span className="text-[#1A1A1A] font-bold">{c.growth}</span></td>
                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    }
  ]

  tier2Modules.unshift({
    id: 'executive-analytics',
    label: 'Analytics Dashboard',
    icon: '',
    description: 'Executive analytics — P&L trends, revenue by region, EBITDA, quarterly performance',
    component: <ExecutiveAnalyticsCharts />,
    tier3Screens: [{ id: 'exec-charts', label: 'Executive Charts', icon: '', component: <ExecutiveAnalyticsCharts /> }]
  })

  return (
    <OSDomainTierStructure
      domainId="executive"
      domainName="Executive Control Tower"
      tier2Modules={tier2Modules}
      defaultModule="executive-analytics"
    />
  )
}

