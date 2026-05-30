'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'

interface ProjectManagementDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function ProjectManagementDomainContent({ persona, locale }: ProjectManagementDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'portfolio',
      label: 'Project Portfolio',
      icon: '',
      description: 'Track portfolio value, health, and delivery progress across departments',
      tier3Screens: [
        {
          id: 'portfolio-overview',
          label: 'Portfolio Overview',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Portfolio Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Total Projects', value: '23' }, { label: 'In Progress', value: '11' }, { label: 'At Risk', value: '3' }, { label: 'Portfolio Budget', value: '$3.2M' }].map((k) => (
                  <div key={k.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{k.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'delivery-board',
      label: 'Milestones & Risks',
      icon: '',
      description: 'Manage milestones, owners, issue logs, and corrective actions',
      tier3Screens: [
        {
          id: 'milestone-tracker',
          label: 'Milestone Tracker',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Milestone Tracker</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Milestone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Due</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ p: 'Dubai Warehouse Expansion', m: 'Structural Work Complete', o: 'Ops PMO', due: '2026-05-20', h: 'On Track' }, { p: 'UK Distribution Automation', m: 'Scanner Rollout', o: 'Logistics PMO', due: '2026-05-12', h: 'At Risk' }, { p: 'Localization Rollout', m: 'Arabic QA Signoff', o: 'Technology PMO', due: '2026-05-05', h: 'On Track' }].map((r, i) => (
                      <tr key={r.p + r.m} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.p}</td>
                        <td className="px-4 py-3">{r.m}</td>
                        <td className="px-4 py-3">{r.o}</td>
                        <td className="px-4 py-3">{r.due}</td>
                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs bg-[#1A1A1A] text-white" style={{ borderRadius: 0 }}>{r.h}</span></td>
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
      domainId="project-management"
      domainName="Project Management OS"
      tier2Modules={tier2Modules}
    />
  )
}
