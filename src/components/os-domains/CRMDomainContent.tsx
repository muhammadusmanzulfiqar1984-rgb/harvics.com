'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import CustomerListContent from '@/components/domains/crm/CustomerListContent'

import { CRMAnalyticsCharts } from '@/components/os-domains/DomainAnalyticsCharts'

interface CRMDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

// Live KPI bar — Blueprint mandated 3-5 real-time cards above every domain
function CRMKPIBar() {
  const [kpis, setKpis] = useState([
    { label: 'Active Accounts',    value: 847,     delta: '+12',   up: true,  fmt: (n: number) => n.toString(),                     accentCls: 'text-emerald-600' },
    { label: 'Pipeline Value',     value: 4820000, delta: '+$184K', up: true,  fmt: (n: number) => `$${(n / 1_000_000).toFixed(2)}M`, accentCls: 'text-harvics-gold' },
    { label: 'Open Deals',         value: 63,      delta: '+4',    up: true,  fmt: (n: number) => n.toString(),                     accentCls: 'text-harvics-burgundy' },
    { label: 'Overdue Follow-ups', value: 14,      delta: '-3',    up: false, fmt: (n: number) => n.toString(),                     accentCls: 'text-red-600' },
    { label: 'Win Rate',           value: 54,      delta: '-2%',   up: false, fmt: (n: number) => `${n}%`,                          accentCls: 'text-amber-500' },
  ])
  const [flash, setFlash] = useState<number | null>(null)
  useEffect(() => {
    const t = setInterval(() => {
      const idx = Math.floor(Math.random() * kpis.length)
      setKpis(prev => prev.map((k, i) => i !== idx ? k : {
        ...k,
        value: k.value + (Math.random() > 0.4 ? 1 : -1) * Math.round(Math.random() * (i === 1 ? 5000 : 1)),
      }))
      setFlash(idx)
      setTimeout(() => setFlash(null), 600)
    }, 2200)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="grid grid-cols-5 gap-3 px-4 pt-4 pb-2">
      {kpis.map((k, i) => (
        <div
          key={i}
          className={`rounded-xl px-4 py-3 border transition-colors duration-300 shadow-[0_1px_8px_rgba(26,5,5,0.06)] ${
            flash === i
              ? (k.up ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300')
              : 'bg-harvics-cream border-harvics-goldDivider'
          }`}
        >
          <div className="text-[10px] text-harvics-muted uppercase tracking-wider mb-1">{k.label}</div>
          <div className={`text-2xl font-black tabular-nums ${k.accentCls}`}>{k.fmt(k.value)}</div>
          <div className={`text-[11px] font-bold mt-0.5 flex items-center gap-1 ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>
            {k.up
              ? <svg viewBox="0 0 10 10" className="w-2 h-2 fill-current"><path d="M5 1 L9 9 L1 9 Z" /></svg>
              : <svg viewBox="0 0 10 10" className="w-2 h-2 fill-current"><path d="M5 9 L9 1 L1 1 Z" /></svg>
            }
            {k.delta} today
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CRMDomainContent({ persona, locale }: CRMDomainContentProps) {
  const t = useTranslations('crm.domain')
  
  // Tier 2 Modules for CRM Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'customer-360',
      label: t('customer360.title'),
      icon: '',
      description: t('customer360.description'),
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              {t('customer360.title')}
            </h3>
            <p className="text-black">{t('customer360.description')}</p>
          </div>
          <CustomerListContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'customer-list',
          label: 'Customer List',
          icon: '',
          component: (
            <div>
              <CRMKPIBar />
              <CustomerListContent persona={persona} locale={locale} />
            </div>
          ),
        },
        {
          id: 'customer-analytics',
          label: 'Customer Analytics',
          icon: '',
          component: <CRMAnalyticsCharts />
        }
      ]
    },
    {
      id: 'campaigns',
      label: t('campaigns.title'),
      icon: '',
      description: t('campaigns.description'),
      tier3Screens: [
        {
          id: 'campaign-list',
          label: 'Campaign List',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-harvics-dark mb-4">Campaigns</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-stone-50 border-b border-stone-200"><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Campaign</th><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Type</th><th className="px-4 py-3 text-right text-xs font-semibold text-harvics-muted uppercase">Reach</th><th className="px-4 py-3 text-center text-xs font-semibold text-harvics-muted uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ name: 'Ramadan Sale 2026', type: 'Email', reach: 12400, status: 'Active' }, { name: 'B2B Distributor Push', type: 'SMS', reach: 3200, status: 'Scheduled' }, { name: 'FMCG Restock Alert', type: 'Push', reach: 8700, status: 'Completed' }, { name: 'Q2 Loyalty Rewards', type: 'Email', reach: 6800, status: 'Active' }, { name: 'Textile Trade Promo', type: 'SMS', reach: 4500, status: 'Draft' }, { name: 'New Market Launch — East Africa', type: 'Email', reach: 9200, status: 'Completed' }].map((c, i) => (
                      <tr key={c.name} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-3 font-semibold text-harvics-dark">{c.name}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs font-bold ${c.type === 'Email' ? 'bg-blue-100 text-blue-700' : c.type === 'SMS' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`} style={{ borderRadius: 0 }}>{c.type}</span></td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{c.reach.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${c.status === 'Active' ? 'bg-emerald-600 text-white' : c.status === 'Completed' ? 'bg-harvics-burgundy text-white' : c.status === 'Scheduled' ? 'bg-blue-600 text-white' : 'bg-stone-50 text-harvics-muted'}`} style={{ borderRadius: 0 }}>{c.status}</span></td>
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
      id: 'leads',
      label: t('leads.title'),
      icon: '',
      description: t('leads.description'),
      tier3Screens: [
        {
          id: 'leads-pipeline',
          label: 'Leads Pipeline',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-harvics-dark mb-4">Leads Pipeline</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ stage: 'New', count: 28, color: 'bg-blue-100 text-blue-800' }, { stage: 'Contacted', count: 16, color: 'bg-amber-100 text-amber-800' }, { stage: 'Qualified', count: 9, color: 'bg-emerald-100 text-emerald-800' }, { stage: 'Closed Won', count: 5, color: 'bg-harvics-burgundy text-white' }].map(s => (
                  <div key={s.stage} className={`${s.color} p-4 text-center`} style={{ borderRadius: 0 }}>
                    <div className="text-2xl font-bold">{s.count}</div>
                    <div className="text-xs mt-1 opacity-80 font-medium">{s.stage}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-stone-50 border-b border-stone-200"><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Lead</th><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Company</th><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Stage</th><th className="px-4 py-3 text-right text-xs font-semibold text-harvics-muted uppercase">Value</th></tr></thead>
                  <tbody>
                    {[{ lead: 'Omar Farooq', company: 'Al Madina Trading', stage: 'Qualified', value: 85000 }, { lead: 'Priya Shah', company: 'Gulf Dist Co', stage: 'Contacted', value: 42000 }, { lead: 'James Okafor', company: 'Lagos FMCG Ltd', stage: 'New', value: 120000 }, { lead: 'Hassan El-Masry', company: 'Cairo Distribution', stage: 'Qualified', value: 68000 }, { lead: 'Amir bin Yusof', company: 'Kuala Lumpur Foods', stage: 'Contacted', value: 56000 }, { lead: 'Thabo Molefe', company: 'Johannesburg Retail', stage: 'New', value: 94000 }].map((l, i) => (
                      <tr key={l.lead} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-3 font-semibold text-harvics-dark">{l.lead}</td>
                        <td className="px-4 py-3 text-harvics-muted">{l.company}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs font-bold ${l.stage === 'Qualified' ? 'bg-emerald-100 text-emerald-700' : l.stage === 'Contacted' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`} style={{ borderRadius: 0 }}>{l.stage}</span></td>
                        <td className="px-4 py-3 text-right font-semibold text-harvics-burgundy">${l.value.toLocaleString()}</td>
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
      id: 'support',
      label: t('support.title'),
      icon: '',
      description: t('support.description'),
      tier3Screens: [
        {
          id: 'tickets',
          label: 'Support Tickets',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-harvics-dark mb-4">Support Tickets</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[{ label: 'Open', count: 14, dark: false, cls: 'bg-red-100 text-red-800' }, { label: 'In Progress', count: 7, dark: false, cls: 'bg-amber-100 text-amber-800' }, { label: 'Resolved', count: 92, dark: false, cls: 'bg-emerald-100 text-emerald-800' }].map(s => (
                  <div key={s.label} className={`p-4 text-center ${s.cls}`} style={{ borderRadius: 0 }}>
                    <div className="text-2xl font-bold">{s.count}</div>
                    <div className="text-xs mt-1 opacity-80 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-stone-50 border-b border-stone-200"><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Ticket</th><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Priority</th><th className="px-4 py-3 text-center text-xs font-semibold text-harvics-muted uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ id: '#TKT-1042', customer: 'Al Fardan Group', priority: 'High', status: 'Open' }, { id: '#TKT-1041', customer: 'Dubai Traders', priority: 'Medium', status: 'In Progress' }, { id: '#TKT-1040', customer: 'Ajman Retail', priority: 'Low', status: 'Resolved' }, { id: '#TKT-1039', customer: 'London Premium', priority: 'Critical', status: 'Open' }, { id: '#TKT-1038', customer: 'Nairobi Distributors', priority: 'High', status: 'In Progress' }, { id: '#TKT-1037', customer: 'Mumbai Distributors', priority: 'Medium', status: 'Resolved' }].map((t, i) => (
                      <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-3 font-mono text-xs text-harvics-muted">{t.id}</td>
                        <td className="px-4 py-3 font-semibold text-harvics-dark">{t.customer}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs font-bold ${t.priority === 'Critical' ? 'bg-red-600 text-white' : t.priority === 'High' ? 'bg-red-100 text-red-700' : t.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`} style={{ borderRadius: 0 }}>{t.priority}</span></td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${t.status === 'Open' ? 'bg-red-600 text-white' : t.status === 'In Progress' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`} style={{ borderRadius: 0 }}>{t.status}</span></td>
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
      id: 'loyalty',
      label: t('loyalty.title'),
      icon: '',
      description: t('loyalty.description'),
      tier3Screens: [
        {
          id: 'loyalty-members',
          label: 'Members',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-harvics-dark mb-4">Loyalty Program</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ label: 'Total Members', value: '4,821', cls: 'bg-harvics-burgundy text-white' }, { label: 'Points Issued', value: '1.2M', cls: 'bg-harvics-gold text-white' }, { label: 'Redemptions', value: '342', cls: 'bg-emerald-600 text-white' }, { label: 'Avg Points', value: '2,490', cls: 'bg-blue-600 text-white' }].map(s => (
                  <div key={s.label} className={`${s.cls} p-4`} style={{ borderRadius: 0 }}>
                    <div className="text-xl font-bold">{s.value}</div>
                    <div className="text-xs mt-1 opacity-80 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-stone-50 border-b border-stone-200"><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Member</th><th className="px-4 py-3 text-left text-xs font-semibold text-harvics-muted uppercase">Tier</th><th className="px-4 py-3 text-right text-xs font-semibold text-harvics-muted uppercase">Points</th><th className="px-4 py-3 text-center text-xs font-semibold text-harvics-muted uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ name: 'Khalid Al Mansoori', tier: 'Platinum', points: 18400, status: 'Active' }, { name: 'Riya Mehta', tier: 'Gold', points: 7200, status: 'Active' }, { name: 'Samuel Obi', tier: 'Silver', points: 2100, status: 'Inactive' }, { name: 'Fatima Al-Qadi', tier: 'Platinum', points: 22800, status: 'Active' }, { name: 'Chen Wei', tier: 'Gold', points: 9400, status: 'Active' }, { name: 'David Mensah', tier: 'Bronze', points: 850, status: 'Active' }].map((m, i) => (
                      <tr key={m.name} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-3 font-semibold text-harvics-dark">{m.name}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs font-bold ${m.tier === 'Platinum' ? 'bg-purple-100 text-purple-700' : m.tier === 'Gold' ? 'bg-amber-100 text-amber-700' : m.tier === 'Silver' ? 'bg-gray-200 text-gray-700' : 'bg-orange-100 text-orange-700'}`} style={{ borderRadius: 0 }}>{m.tier}</span></td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-harvics-burgundy">{m.points.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${m.status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600'}`} style={{ borderRadius: 0 }}>{m.status}</span></td>
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
      id: 'distributor-hierarchy',
      label: 'Distributor Hierarchy',
      icon: '',
      description: 'Multi-level distributor/retailer network with territory mapping',
      tier3Screens: [
        {
          id: 'hierarchy-tree',
          label: 'Hierarchy Tree',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-harvics-dark mb-4">Distributor Hierarchy</h3>
              <div className="space-y-3">
                {[{ level: 'HQ', name: 'Harvics Global HQ', children: 5 }, { level: 'Region', name: 'Middle East & Africa', children: 12 }, { level: 'Country', name: 'UAE Operations', children: 8 }, { level: 'City', name: 'Dubai Division', children: 15 }, { level: 'Territory', name: 'Deira Zone A', children: 45 }].map((n, i) => (
                  <div key={n.level} className="flex items-center gap-4 p-4 border border-stone-200/30" style={{ marginLeft: i * 24, borderRadius: 0 }}>
                    <div className="w-7 h-7 rounded-full bg-harvics-burgundy/10 border border-harvics-burgundy/20 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-harvics-burgundy"><circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-harvics-dark">{n.name}</div>
                      <div className="text-xs text-harvics-muted">{n.level} Level — {n.children} sub-nodes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        {
          id: 'territory-mapping',
          label: 'Territory Mapping',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-harvics-dark mb-4">Territory Mapping</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-stone-50 border-b border-stone-200"><th className="px-5 py-3 text-left text-xs font-semibold text-harvics-muted uppercase tracking-wider">Territory</th><th className="px-5 py-3 text-left text-xs font-semibold text-harvics-muted uppercase tracking-wider">Manager</th><th className="px-5 py-3 text-right text-xs font-semibold text-harvics-muted uppercase tracking-wider">Retailers</th><th className="px-5 py-3 text-right text-xs font-semibold text-harvics-muted uppercase tracking-wider">Revenue</th><th className="px-5 py-3 text-center text-xs font-semibold text-harvics-muted uppercase tracking-wider">Coverage</th></tr></thead>
                  <tbody>
                    {[{ territory: 'Deira Zone A', manager: 'Ahmed Khan', retailers: 45, revenue: 125000, coverage: 92 }, { territory: 'JBR Sector B', manager: 'Sarah Ali', retailers: 38, revenue: 98000, coverage: 88 }, { territory: 'Sharjah North', manager: 'Mike Ross', retailers: 52, revenue: 145000, coverage: 95 }].map((t, i) => (
                      <tr key={t.territory} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-4 py-3 font-semibold text-harvics-dark">{t.territory}</td>
                        <td className="px-4 py-3">{t.manager}</td>
                        <td className="px-4 py-3 text-right">{t.retailers}</td>
                        <td className="px-4 py-3 text-right font-semibold text-harvics-dark">${t.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${t.coverage >= 90 ? 'bg-stone-50 text-harvics-dark' : 'bg-stone-50 text-harvics-dark'}`} style={{ borderRadius: 0 }}>{t.coverage}%</span></td>
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

  return (
    <OSDomainTierStructure
      domainId="crm"
      domainName={t('title')}
      tier2Modules={tier2Modules}
      defaultModule="customer-360"
    />
  )
}

