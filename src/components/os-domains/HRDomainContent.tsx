'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import EmployeeListContent from '@/components/domains/hr/EmployeeListContent'
import PayrollProcessingContent from '@/components/domains/hr/PayrollProcessingContent'
import PerformanceReviewsContent from '@/components/domains/hr/PerformanceReviewsContent'

interface HRDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function HRDomainContent({ persona, locale }: HRDomainContentProps) {
  // Tier 2 Modules for HR Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'employee-master',
      label: 'Employee Master',
      icon: '',
      description: 'Employee records, organizational structure, and employee database',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              Employee Master
            </h3>
            <p className="text-black">Employee records, organizational structure, and employee database</p>
          </div>
        </div>
      ),
      tier3Screens: [
        {
          id: 'employee-list',
          label: 'Employee List',
          icon: '',
          component: <EmployeeListContent persona={persona} locale={locale} />
        },
        {
          id: 'employee-details',
          label: 'Employee Details',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Employee Profile</h3>
              <div className="flex gap-6 p-6 bg-[#F5F5F7]" style={{ borderRadius: 0 }}>
                <div className="w-16 h-16 bg-[#1D1D1F] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style={{ borderRadius: 0 }}>AK</div>
                <div>
                  <div className="text-xl font-semibold text-[#1D1D1F]">Ahmed Al Khalidi</div>
                  <div className="text-sm text-[#8E8E93]">Senior Sales Manager — Dubai North Territory</div>
                  <div className="flex gap-4 mt-2 text-xs text-[#8E8E93]"><span>EMP-0421</span><span>Joined: Mar 2021</span><span>UAE</span></div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[{ label: 'Department', value: 'Sales & Distribution' }, { label: 'Manager', value: 'Khalid Al Mansoori' }, { label: 'Contract', value: 'Full-time' }, { label: 'Salary Band', value: 'Band 4 — Senior' }, { label: 'Performance', value: '4.2 / 5.0' }, { label: 'Leave Balance', value: '18 days' }].map(f => (
                  <div key={f.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xs text-[#8E8E93] uppercase mb-1">{f.label}</div>
                    <div className="font-semibold text-[#1D1D1F]">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        {
          id: 'org-chart',
          label: 'Organization Chart',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Organization Hierarchy</h3>
              <div className="space-y-0">
                {[{ role: 'CEO / Owner', name: 'Shah Tabraiz', dept: 'Executive', level: 0 }, { role: 'VP Sales', name: 'Khalid Al Mansoori', dept: 'Sales', level: 1 }, { role: 'VP Operations', name: 'Riya Shah', dept: 'Ops', level: 1 }, { role: 'Regional Manager — UAE', name: 'Ahmed Al Khalidi', dept: 'Sales', level: 2 }, { role: 'Regional Manager — PK', name: 'Tariq Mahmood', dept: 'Sales', level: 2 }, { role: 'Logistics Head', name: 'James Okafor', dept: 'Logistics', level: 2 }].map((n, i) => (
                  <div key={n.name} className="flex items-center gap-4 p-3 border-b border-[#E5E5EA]/30" style={{ paddingLeft: `${n.level * 32 + 16}px` }}>
                    <div className="w-8 h-8 bg-[#1D1D1F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ borderRadius: 0 }}>{n.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                    <div>
                      <div className="font-semibold text-sm text-[#1D1D1F]">{n.name}</div>
                      <div className="text-xs text-[#8E8E93]">{n.role} · {n.dept}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'payroll',
      label: 'Payroll & Incentives',
      icon: '',
      description: 'Salary processing, bonuses, commissions, and incentive calculations',
      tier3Screens: [
        {
          id: 'payroll-processing',
          label: 'Payroll Processing',
          icon: '',
          component: <PayrollProcessingContent persona={persona} locale={locale} />
        },
        {
          id: 'salary-reports',
          label: 'Salary Reports',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Salary Reports</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[{ label: 'Total Payroll / Month', value: 'AED 842,000' }, { label: 'Avg Salary', value: 'AED 12,400' }, { label: 'Headcount', value: '68' }, { label: 'Payroll Growth', value: '+4.2% YoY' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-lg font-semibold text-[#1D1D1F]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Department</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Headcount</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Total Salary</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Avg Salary</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Bonuses</th></tr></thead>
                  <tbody>
                    {[{ dept: 'Sales & Distribution', hc: 24, total: 'AED 312,000', avg: 'AED 13,000', bonus: 'AED 48,000' }, { dept: 'Operations & Logistics', hc: 18, total: 'AED 216,000', avg: 'AED 12,000', bonus: 'AED 18,000' }, { dept: 'Finance & Admin', hc: 10, total: 'AED 150,000', avg: 'AED 15,000', bonus: 'AED 20,000' }, { dept: 'Technology', hc: 8, total: 'AED 120,000', avg: 'AED 15,000', bonus: 'AED 24,000' }, { dept: 'HR & Compliance', hc: 8, total: 'AED 104,000', avg: 'AED 13,000', bonus: 'AED 8,000' }].map((r, i) => (
                      <tr key={r.dept} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{r.dept}</td>
                        <td className="px-4 py-3 text-right">{r.hc}</td>
                        <td className="px-4 py-3 text-right font-semibold">{r.total}</td>
                        <td className="px-4 py-3 text-right">{r.avg}</td>
                        <td className="px-4 py-3 text-right text-[#1D1D1F]">{r.bonus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'payroll-history',
          label: 'Payroll History',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Payroll Run History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Pay Period</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Employees Paid</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Gross Amount</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Net Paid</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ period: 'Mar 2026', emp: 68, gross: 'AED 842,000', net: 'AED 724,000', status: 'Processed' }, { period: 'Feb 2026', emp: 66, gross: 'AED 818,000', net: 'AED 702,000', status: 'Processed' }, { period: 'Jan 2026', emp: 65, gross: 'AED 802,000', net: 'AED 690,000', status: 'Processed' }, { period: 'Dec 2025', emp: 65, gross: 'AED 920,000', net: 'AED 790,000', status: 'Processed' }].map((p, i) => (
                      <tr key={p.period} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{p.period}</td>
                        <td className="px-4 py-3 text-right">{p.emp}</td>
                        <td className="px-4 py-3 text-right">{p.gross}</td>
                        <td className="px-4 py-3 text-right font-semibold">{p.net}</td>
                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#1D1D1F] text-white" style={{ borderRadius: 0 }}>{p.status}</span></td>
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
      id: 'performance',
      label: 'Performance Tracking',
      icon: '',
      description: 'KPI tracking, performance reviews, and employee assessments',
      tier3Screens: [
        {
          id: 'performance-reviews',
          label: 'Performance Reviews',
          icon: '',
          component: <PerformanceReviewsContent persona={persona} locale={locale} />
        },
        {
          id: 'kpi-dashboard',
          label: 'KPI Dashboard',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Employee KPI Dashboard</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ label: 'Avg Performance Score', value: '4.1 / 5' }, { label: 'On-Target Employees', value: '82%' }, { label: 'Reviews Pending', value: '14' }, { label: 'High Performers', value: '22' }].map(k => (
                  <div key={k.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1D1D1F]">{k.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Employee</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Department</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Score</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Target Hit</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Trend</th></tr></thead>
                  <tbody>
                    {[{ name: 'Ahmed Al Khalidi', dept: 'Sales', score: 4.7, target: '98%', trend: '↑' }, { name: 'Riya Shah', dept: 'Operations', score: 4.5, target: '95%', trend: '↑' }, { name: 'James Okafor', dept: 'Logistics', score: 4.2, target: '91%', trend: '→' }, { name: 'Sara Malik', dept: 'Finance', score: 3.8, target: '82%', trend: '↓' }].map((e, i) => (
                      <tr key={e.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{e.name}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{e.dept}</td>
                        <td className="px-4 py-3 text-right font-semibold">{e.score}</td>
                        <td className="px-4 py-3 text-right">{e.target}</td>
                        <td className="px-4 py-3 text-center text-lg">{e.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'assessments',
          label: 'Assessments',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Employee Assessments</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Assessment</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Type</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Participants</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Avg Score</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ name: 'Q1 2026 Annual Review', type: 'Annual', participants: 68, avg: 4.1, status: 'Completed' }, { name: 'Sales Competency Test', type: 'Skills', participants: 24, avg: 3.9, status: 'Completed' }, { name: 'Leadership 360°', type: '360°', participants: 12, avg: 4.3, status: 'In Progress' }, { name: 'Safety & Compliance', type: 'Mandatory', participants: 68, avg: 4.8, status: 'Scheduled' }].map((a, i) => (
                      <tr key={a.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{a.name}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{a.type}</td>
                        <td className="px-4 py-3 text-right">{a.participants}</td>
                        <td className="px-4 py-3 text-right font-semibold">{a.avg}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${a.status === 'Completed' ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{a.status}</span></td>
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
      id: 'territory-workforce',
      label: 'Territory Workforce',
      icon: '',
      description: 'Workforce distribution across territories, field staff tracking, and regional staffing',
      tier3Screens: [
        {
          id: 'field-staff',
          label: 'Field Staff',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Field Staff by Territory</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Territory</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Sales Reps</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Drivers</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Merchandisers</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Total</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Coverage</th></tr></thead>
                  <tbody>
                    {[{ territory: 'Dubai North', sales: 8, drivers: 12, merch: 5, coverage: 94 }, { territory: 'Abu Dhabi Central', sales: 6, drivers: 10, merch: 4, coverage: 89 }, { territory: 'Sharjah East', sales: 5, drivers: 8, merch: 3, coverage: 82 }].map((t, i) => (
                      <tr key={t.territory} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{t.territory}</td>
                        <td className="px-4 py-3 text-right">{t.sales}</td>
                        <td className="px-4 py-3 text-right">{t.drivers}</td>
                        <td className="px-4 py-3 text-right">{t.merch}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1D1D1F]">{t.sales + t.drivers + t.merch}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${t.coverage >= 90 ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{t.coverage}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'regional-staffing',
          label: 'Regional Staffing',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Regional Staffing Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Region</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Current</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Target</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Gap</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Open Roles</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ region: 'UAE — North', current: 25, target: 28, gap: -3, open: 'Sales Rep x2, Driver x1', status: 'Hiring' }, { region: 'UAE — South', current: 18, target: 18, gap: 0, open: '—', status: 'Optimal' }, { region: 'Pakistan', current: 14, target: 20, gap: -6, open: 'SM x2, Merch x4', status: 'Critical' }, { region: 'UK & Europe', current: 6, target: 6, gap: 0, open: '—', status: 'Optimal' }].map((r, i) => (
                      <tr key={r.region} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{r.region}</td>
                        <td className="px-4 py-3 text-right">{r.current}</td>
                        <td className="px-4 py-3 text-right">{r.target}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${r.gap < 0 ? 'text-[#6B1F2B]' : 'text-[#1D1D1F]'}`}>{r.gap < 0 ? r.gap : r.gap === 0 ? '—' : '+' + r.gap}</td>
                        <td className="px-4 py-3 text-xs text-[#8E8E93]">{r.open}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${r.status === 'Critical' ? 'bg-[#6B1F2B] text-white' : r.status === 'Hiring' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#1D1D1F] text-white'}`} style={{ borderRadius: 0 }}>{r.status}</span></td>
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
      domainId="hr"
      domainName="HR OS"
      tier2Modules={tier2Modules}
      defaultModule="employee-master"
    />
  )
}

