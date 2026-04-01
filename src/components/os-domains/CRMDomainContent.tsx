'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import CustomerListContent from '@/components/domains/crm/CustomerListContent'

interface CRMDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

// Live KPI bar — Blueprint mandated 3-5 real-time cards above every domain
function CRMKPIBar() {
  const [kpis, setKpis] = useState([
    { label: 'Active Accounts', value: 847,  delta: '+12',  up: true,  fmt: (n:number) => n.toString(), accent: '#16a34a' },
    { label: 'Pipeline Value',  value: 4820000, delta: '+$184K', up: true, fmt: (n:number) => `$${(n/1000000).toFixed(2)}M`, accent: '#C3A35E' },
    { label: 'Open Deals',      value: 63,   delta: '+4',   up: true,  fmt: (n:number) => n.toString(), accent: '#6B1F2B' },
    { label: 'Overdue Follow-ups', value: 14, delta: '-3', up: false, fmt: (n:number) => n.toString(), accent: '#dc2626' },
    { label: 'Win Rate',        value: 54,   delta: '-2%', up: false, fmt: (n:number) => `${n}%`, accent: '#f59e0b' },
  ])
  const [flash, setFlash] = useState<number|null>(null)
  useEffect(() => {
    const t = setInterval(() => {
      const idx = Math.floor(Math.random() * kpis.length)
      setKpis(prev => prev.map((k, i) => i !== idx ? k : {
        ...k,
        value: k.value + (Math.random() > 0.4 ? 1 : -1) * Math.round(Math.random() * (i === 1 ? 5000 : 1))
      }))
      setFlash(idx)
      setTimeout(() => setFlash(null), 600)
    }, 2200)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="grid grid-cols-5 gap-3 px-4 pt-4 pb-2">
      {kpis.map((k, i) => (
        <div key={i} className={`rounded-xl px-4 py-3 border transition-colors duration-300 ${
          flash === i ? (k.up ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300') : 'bg-white border-[#E5E5EA]'
        }`} style={{ boxShadow: '0 1px 8px rgba(107,31,43,0.06)' }}>
          <div className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">{k.label}</div>
          <div className="text-2xl font-black tabular-nums" style={{ color: k.accent }}>{k.fmt(k.value)}</div>
          <div className={`text-[11px] font-bold mt-0.5 ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>{k.up ? '▲' : '▼'} {k.delta} today</div>
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
          component: <div className="p-6"><h3 className="text-sm font-semibold mb-4">Customer Analytics</h3><p>Customer insights and segmentation</p></div>
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
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Campaigns</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Campaign</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Type</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Reach</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ name: 'Ramadan Sale 2026', type: 'Email', reach: 12400, status: 'Active' }, { name: 'B2B Distributor Push', type: 'SMS', reach: 3200, status: 'Draft' }, { name: 'FMCG Restock Alert', type: 'Push', reach: 8700, status: 'Completed' }].map((c, i) => (
                      <tr key={c.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{c.name}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{c.type}</td>
                        <td className="px-4 py-3 text-right">{c.reach.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${c.status === 'Active' ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{c.status}</span></td>
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
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Leads Pipeline</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ stage: 'New', count: 28, color: 'bg-[#F5F5F7]' }, { stage: 'Contacted', count: 16, color: 'bg-[#F5F5F7]' }, { stage: 'Qualified', count: 9, color: 'bg-[#F5F5F7]' }, { stage: 'Closed', count: 5, color: 'bg-[#1D1D1F] text-white' }].map(s => (
                  <div key={s.stage} className={`${s.color} p-4 text-center`} style={{ borderRadius: 0 }}>
                    <div className="text-2xl font-semibold">{s.count}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.stage}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Lead</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Company</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Stage</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Value</th></tr></thead>
                  <tbody>
                    {[{ lead: 'Omar Farooq', company: 'Al Madina Trading', stage: 'Qualified', value: 85000 }, { lead: 'Priya Shah', company: 'Gulf Dist Co', stage: 'Contacted', value: 42000 }, { lead: 'James Okafor', company: 'Lagos FMCG Ltd', stage: 'New', value: 120000 }].map((l, i) => (
                      <tr key={l.lead} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{l.lead}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{l.company}</td>
                        <td className="px-4 py-3">{l.stage}</td>
                        <td className="px-4 py-3 text-right font-semibold">${l.value.toLocaleString()}</td>
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
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Support Tickets</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[{ label: 'Open', count: 14, dark: true }, { label: 'In Progress', count: 7, dark: false }, { label: 'Resolved', count: 92, dark: false }].map(s => (
                  <div key={s.label} className={`p-4 text-center ${s.dark ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7]'}`} style={{ borderRadius: 0 }}>
                    <div className="text-2xl font-semibold">{s.count}</div>
                    <div className={`text-xs mt-1 ${s.dark ? 'text-[#AEAEB2]' : 'text-[#8E8E93]'}`}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Ticket</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Priority</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ id: '#TKT-1042', customer: 'Al Fardan Group', priority: 'High', status: 'Open' }, { id: '#TKT-1041', customer: 'Dubai Traders', priority: 'Medium', status: 'In Progress' }, { id: '#TKT-1040', customer: 'Ajman Retail', priority: 'Low', status: 'Resolved' }].map((t, i) => (
                      <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">{t.id}</td>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{t.customer}</td>
                        <td className="px-4 py-3">{t.priority}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${t.status === 'Open' ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{t.status}</span></td>
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
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Loyalty Program</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ label: 'Total Members', value: '4,821' }, { label: 'Points Issued', value: '1.2M' }, { label: 'Redemptions', value: '342' }, { label: 'Avg Points', value: '2,490' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1D1D1F]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Member</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Tier</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Points</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ name: 'Khalid Al Mansoori', tier: 'Platinum', points: 18400, status: 'Active' }, { name: 'Riya Mehta', tier: 'Gold', points: 7200, status: 'Active' }, { name: 'Samuel Obi', tier: 'Silver', points: 2100, status: 'Inactive' }].map((m, i) => (
                      <tr key={m.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{m.name}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{m.tier}</td>
                        <td className="px-4 py-3 text-right font-semibold">{m.points.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${m.status === 'Active' ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{m.status}</span></td>
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
      icon: '️',
      description: 'Multi-level distributor/retailer network with territory mapping',
      tier3Screens: [
        {
          id: 'hierarchy-tree',
          label: 'Hierarchy Tree',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">️ Distributor Hierarchy</h3>
              <div className="space-y-3">
                {[{ level: 'HQ', name: 'Harvics Global HQ', children: 5, icon: '' }, { level: 'Region', name: 'Middle East & Africa', children: 12, icon: '' }, { level: 'Country', name: 'UAE Operations', children: 8, icon: '' }, { level: 'City', name: 'Dubai Division', children: 15, icon: '️' }, { level: 'Territory', name: 'Deira Zone A', children: 45, icon: '' }].map((n, i) => (
                  <div key={n.level} className="flex items-center gap-4 p-4 border border-[#E5E5EA]/30" style={{ marginLeft: i * 24, borderRadius: 0 }}>
                    <span className="text-2xl">{n.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-[#1D1D1F]">{n.name}</div>
                      <div className="text-xs text-[#8E8E93]">{n.level} Level — {n.children} sub-nodes</div>
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
          icon: '️',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">️ Territory Mapping</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Territory</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Manager</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Retailers</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Revenue</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Coverage</th></tr></thead>
                  <tbody>
                    {[{ territory: 'Deira Zone A', manager: 'Ahmed Khan', retailers: 45, revenue: 125000, coverage: 92 }, { territory: 'JBR Sector B', manager: 'Sarah Ali', retailers: 38, revenue: 98000, coverage: 88 }, { territory: 'Sharjah North', manager: 'Mike Ross', retailers: 52, revenue: 145000, coverage: 95 }].map((t, i) => (
                      <tr key={t.territory} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{t.territory}</td>
                        <td className="px-4 py-3">{t.manager}</td>
                        <td className="px-4 py-3 text-right">{t.retailers}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1D1D1F]">${t.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${t.coverage >= 90 ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{t.coverage}%</span></td>
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

