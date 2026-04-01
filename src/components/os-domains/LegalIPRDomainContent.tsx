'use client'

import React, { useState } from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import KPICard from '@/components/shared/KPICard'

interface LegalIPRDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

// Demo data — will be replaced with real API calls when backend endpoints are ready
const legalData = {
  overview: {
    iprRisk: 'Medium', counterfeitRisk: 'High', complianceScore: 85,
    activeTrademarks: 124, activePatents: 23, pendingRenewals: 8, activeLitigations: 3
  },
  ipr: {
    trademarks: [
      { id: 'TM-001', name: 'Harvics Logo', status: 'Active', registrationDate: '2020-01-15', expiryDate: '2030-01-15', class: 'Class 30, 32' },
      { id: 'TM-002', name: 'Harvics Premium', status: 'Active', registrationDate: '2021-03-20', expiryDate: '2031-03-20', class: 'Class 29, 30' },
      { id: 'TM-003', name: 'Harvics Global', status: 'Pending', registrationDate: '2024-06-10', expiryDate: '—', class: 'Class 35' }
    ],
    patents: [
      { id: 'PAT-001', title: 'Beverage Preservation Method', status: 'Active', filingDate: '2019-05-12', expiryDate: '2039-05-12', number: 'US12345678' },
      { id: 'PAT-002', title: 'Packaging Innovation', status: 'Active', filingDate: '2020-08-30', expiryDate: '2040-08-30', number: 'US87654321' }
    ]
  },
  counterfeit: {
    totalReports: 47, resolved: 38, pending: 9,
    cases: [
      { id: 'CF-001', product: 'Harvics Carbonated Beverage', location: 'Market District A', reportedDate: '2024-12-10', status: 'Under Investigation', severity: 'High' },
      { id: 'CF-002', product: 'Harvics Premium Snacks', location: 'Retail Chain B', reportedDate: '2024-12-08', status: 'Legal Action Initiated', severity: 'Critical' },
      { id: 'CF-003', product: 'Harvics Logo Usage', location: 'Online Marketplace', reportedDate: '2024-12-05', status: 'Resolved', severity: 'Medium' }
    ]
  },
  compliance: {
    countries: [
      { country: 'UAE', complianceScore: 85, lastAudit: '2024-11-15', nextAudit: '2025-05-15', issues: 2 },
      { country: 'United States', complianceScore: 92, lastAudit: '2024-10-20', nextAudit: '2025-04-20', issues: 0 },
      { country: 'United Kingdom', complianceScore: 88, lastAudit: '2024-11-01', nextAudit: '2025-05-01', issues: 1 }
    ],
    regulations: [
      { name: 'Food Safety Standards', status: 'Compliant', lastCheck: '2024-12-01' },
      { name: 'Labeling Requirements', status: 'Compliant', lastCheck: '2024-11-28' },
      { name: 'Import/Export Regulations', status: 'Review Required', lastCheck: '2024-11-15' }
    ]
  },
  contracts: {
    active: 156, expiring: 12, pending: 5,
    contracts: [
      { id: 'CNT-001', type: 'Distribution Agreement', party: 'ABC Distributors', startDate: '2023-01-01', endDate: '2025-12-31', status: 'Active', value: '$2.5M' },
      { id: 'CNT-002', type: 'Supplier Agreement', party: 'XYZ Manufacturing', startDate: '2022-06-15', endDate: '2025-06-15', status: 'Active', value: '$5.8M' },
      { id: 'CNT-003', type: 'License Agreement', party: 'Global Retail Chain', startDate: '2024-03-01', endDate: '2027-03-01', status: 'Active', value: '$1.2M' }
    ]
  },
  litigation: {
    active: 3, resolved: 12,
    cases: [
      { id: 'LIT-001', title: 'Trademark Infringement Case', filedDate: '2024-09-15', status: 'In Progress', type: 'IPR', nextHearing: '2025-01-20' },
      { id: 'LIT-002', title: 'Contract Dispute', filedDate: '2024-10-05', status: 'Settlement Negotiation', type: 'Contract', nextHearing: '2025-02-10' },
      { id: 'LIT-003', title: 'Regulatory Compliance Issue', filedDate: '2024-11-20', status: 'Under Review', type: 'Regulatory', nextHearing: '2025-01-15' }
    ]
  }
}

function IPROverviewScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="IPR Risk Level" value={legalData.overview.iprRisk} icon="️" />
        <KPICard label="Counterfeit Risk" value={legalData.overview.counterfeitRisk} icon="" />
        <KPICard label="Compliance Score" value={`${legalData.overview.complianceScore}%`} icon="" />
        <KPICard label="Active Litigations" value={legalData.overview.activeLitigations} icon="️" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Active Trademarks" value={legalData.overview.activeTrademarks} icon="™️" />
        <KPICard label="Active Patents" value={legalData.overview.activePatents} icon="" />
        <KPICard label="Pending Renewals" value={legalData.overview.pendingRenewals} icon="" />
        <KPICard label="Active Contracts" value={legalData.contracts.active} icon="" />
      </div>
    </div>
  )
}

function IPRPortfolioScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Trademarks</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Registration</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Expiry</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Class</th>
            </tr></thead>
            <tbody>
              {legalData.ipr.trademarks.map((tm, i) => (
                <tr key={tm.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{tm.id}</td>
                  <td className="px-4 py-3">{tm.name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${tm.status === 'Active' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{tm.status}</span></td>
                  <td className="px-4 py-3 text-[#8E8E93]">{tm.registrationDate}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{tm.expiryDate}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{tm.class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Patents</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Title</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Patent #</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Filed</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Expiry</th>
            </tr></thead>
            <tbody>
              {legalData.ipr.patents.map((pat, i) => (
                <tr key={pat.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{pat.id}</td>
                  <td className="px-4 py-3">{pat.title}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1D1D1F]" style={{ borderRadius: 0 }}>{pat.status}</span></td>
                  <td className="px-4 py-3 font-mono text-[#8E8E93]">{pat.number}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{pat.filingDate}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{pat.expiryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CounterfeitScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Reports" value={legalData.counterfeit.totalReports} icon="" />
        <KPICard label="Resolved" value={legalData.counterfeit.resolved} icon="" />
        <KPICard label="Pending" value={legalData.counterfeit.pending} icon="⏳" />
        <KPICard label="Resolution Rate" value={`${Math.round((legalData.counterfeit.resolved / legalData.counterfeit.totalReports) * 100)}%`} icon="" />
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Active Counterfeit Cases</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Case ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Location</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Reported</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Severity</th>
            </tr></thead>
            <tbody>
              {legalData.counterfeit.cases.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{c.id}</td>
                  <td className="px-4 py-3">{c.product}</td>
                  <td className="px-4 py-3">{c.location}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{c.reportedDate}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${c.status === 'Resolved' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : c.status === 'Legal Action Initiated' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{c.status}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${c.severity === 'Critical' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : c.severity === 'High' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{c.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ComplianceScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Country Compliance Status</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Country</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Score</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Last Audit</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Next Audit</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Issues</th>
            </tr></thead>
            <tbody>
              {legalData.compliance.countries.map((c, i) => (
                <tr key={c.country} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{c.country}</td>
                  <td className="px-4 py-3"><span className="font-semibold text-[#1D1D1F]">{c.complianceScore}%</span></td>
                  <td className="px-4 py-3 text-[#8E8E93]">{c.lastAudit}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{c.nextAudit}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${c.issues === 0 ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{c.issues}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Regulatory Compliance Checklist</h4>
        <div className="space-y-3">
          {legalData.compliance.regulations.map((reg, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-[#E5E5EA]/20" style={{ borderRadius: 0 }}>
              <div><div className="font-semibold text-[#1D1D1F]">{reg.name}</div><div className="text-sm text-[#8E8E93]">Last Check: {reg.lastCheck}</div></div>
              <span className={`px-3 py-1 text-sm font-bold ${reg.status === 'Compliant' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{reg.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContractsScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Active Contracts" value={legalData.contracts.active} icon="" />
        <KPICard label="Expiring Soon" value={legalData.contracts.expiring} icon="️" />
        <KPICard label="Pending Review" value={legalData.contracts.pending} icon="⏳" />
        <KPICard label="Total Value" value="$9.5M" icon="" />
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Active Contracts</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Party</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Start</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">End</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Value</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
            </tr></thead>
            <tbody>
              {legalData.contracts.contracts.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{c.id}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">{c.party}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{c.startDate}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">{c.endDate}</td>
                  <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{c.value}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1D1D1F]" style={{ borderRadius: 0 }}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function LitigationScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Active Cases" value={legalData.litigation.active} icon="️" />
        <KPICard label="Resolved" value={legalData.litigation.resolved} icon="" />
        <KPICard label="IPR Cases" value={1} icon="™️" />
        <KPICard label="Contract Disputes" value={1} icon="" />
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1D1D1F] mb-4">Active Litigation Cases</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Case ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Title</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Type</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Filed</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Next Hearing</th>
            </tr></thead>
            <tbody>
              {legalData.litigation.cases.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{c.id}</td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1D1D1F]" style={{ borderRadius: 0 }}>{c.type}</span></td>
                  <td className="px-4 py-3 text-[#8E8E93]">{c.filedDate}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${c.status === 'In Progress' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : c.status === 'Settlement Negotiation' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{c.status}</span></td>
                  <td className="px-4 py-3 text-[#8E8E93]">{c.nextHearing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function LegalIPRDomainContent({ persona, locale }: LegalIPRDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'ipr-overview',
      label: 'Legal Dashboard',
      icon: '',
      description: 'Overview of legal, IPR, compliance, and litigation status',
      component: <IPROverviewScreen />,
      tier3Screens: [
        { id: 'overview', label: 'Dashboard Overview', icon: '', component: <IPROverviewScreen /> }
      ]
    },
    {
      id: 'ipr-portfolio',
      label: 'IPR Portfolio',
      icon: '',
      description: 'Trademarks, patents, copyrights, and design rights management',
      component: <IPRPortfolioScreen />,
      tier3Screens: [
        { id: 'trademarks', label: 'Trademarks', icon: '™️', component: <IPRPortfolioScreen /> }
      ]
    },
    {
      id: 'counterfeit',
      label: 'Counterfeit Detection',
      icon: '',
      description: 'Counterfeit product reporting, investigation, and resolution tracking',
      component: <CounterfeitScreen />,
      tier3Screens: [
        { id: 'cases', label: 'Active Cases', icon: '', component: <CounterfeitScreen /> }
      ]
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: '',
      description: 'Country compliance status, regulatory checks, and audit tracking',
      component: <ComplianceScreen />,
      tier3Screens: [
        { id: 'status', label: 'Compliance Status', icon: '', component: <ComplianceScreen /> }
      ]
    },
    {
      id: 'contracts',
      label: 'Contracts',
      icon: '',
      description: 'Contract management — distribution, supplier, and license agreements',
      component: <ContractsScreen />,
      tier3Screens: [
        { id: 'active', label: 'Active Contracts', icon: '', component: <ContractsScreen /> }
      ]
    },
    {
      id: 'litigation',
      label: 'Litigation',
      icon: '️',
      description: 'Active and resolved litigation cases, hearing schedules',
      component: <LitigationScreen />,
      tier3Screens: [
        { id: 'cases', label: 'Active Cases', icon: '️', component: <LitigationScreen /> }
      ]
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="legal-ipr"
      domainName="Legal & IPR OS"
      tier2Modules={tier2Modules}
      defaultModule="ipr-overview"
    />
  )
}
