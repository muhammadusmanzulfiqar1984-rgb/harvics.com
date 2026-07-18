'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import KPICard from '@/components/shared/KPICard'

interface WorkflowsDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const workflowData = {
  overview: { activeWorkflows: 12, completedToday: 156, pendingActions: 8, successRate: 98.5, avgProcessingTime: '2.3 hours' },
  orderFulfillment: {
    steps: [
      { step: 1, name: 'Order Received', status: 'Completed', time: '10:00 AM' },
      { step: 2, name: 'Inventory Check', status: 'Completed', time: '10:02 AM' },
      { step: 3, name: 'Payment Verification', status: 'Completed', time: '10:05 AM' },
      { step: 4, name: 'Legal Compliance', status: 'In Progress', time: '10:08 AM' },
      { step: 5, name: 'Shipping Prep', status: 'Pending', time: '—' },
      { step: 6, name: 'Customs Clearance', status: 'Pending', time: '—' },
      { step: 7, name: 'Delivery', status: 'Pending', time: '—' },
      { step: 8, name: 'Payment Processing', status: 'Pending', time: '—' }
    ],
    activeOrders: [
      { id: 'ORD-001', customer: 'ABC Distributors', amount: 25000, currentStep: 'Legal Compliance', progress: 50 },
      { id: 'ORD-002', customer: 'XYZ Retail', amount: 18000, currentStep: 'Payment Verification', progress: 37.5 },
      { id: 'ORD-003', customer: 'Global Chain', amount: 45000, currentStep: 'Shipping Preparation', progress: 62.5 }
    ]
  },
  importExportFlow: {
    importSteps: [
      { name: 'Import Order Created', status: 'Completed' },
      { name: 'Customs Documentation', status: 'Completed' },
      { name: 'HS Code Verification', status: 'Completed' },
      { name: 'Legal Compliance', status: 'In Progress' },
      { name: 'Customs Clearance', status: 'Pending' },
      { name: 'Warehouse Receipt', status: 'Pending' }
    ],
    exportSteps: [
      { name: 'Export Order Created', status: 'Completed' },
      { name: 'Export License Check', status: 'Completed' },
      { name: 'Customs Declaration', status: 'In Progress' },
      { name: 'Shipping Arrangement', status: 'Pending' },
      { name: 'Delivery Confirmation', status: 'Pending' }
    ]
  },
  complianceChecks: [
    { id: 'CHK-001', orderId: 'ORD-001', type: 'IPR Check', status: 'Passed', checkedAt: '2024-12-15 10:08 AM' },
    { id: 'CHK-002', orderId: 'ORD-001', type: 'Counterfeit Check', status: 'Passed', checkedAt: '2024-12-15 10:09 AM' },
    { id: 'CHK-003', orderId: 'ORD-001', type: 'Regulatory Compliance', status: 'In Progress', checkedAt: '2024-12-15 10:10 AM' },
    { id: 'CHK-004', orderId: 'IMP-001', type: 'Import Compliance', status: 'In Progress', checkedAt: '2024-12-15 09:30 AM' }
  ],
  complianceRules: [
    { id: 'RULE-001', name: 'Pre-Order IPR Check', type: 'Legal', status: 'Active', appliesTo: 'All Orders' },
    { id: 'RULE-002', name: 'Pre-Shipment Compliance', type: 'Regulatory', status: 'Active', appliesTo: 'Export Orders' },
    { id: 'RULE-003', name: 'Counterfeit Detection', type: 'Legal', status: 'Active', appliesTo: 'Import Orders' }
  ]
}

function WorkflowOverviewScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Active Workflows" value={workflowData.overview.activeWorkflows} icon="️" />
        <KPICard label="Completed Today" value={workflowData.overview.completedToday} icon="" />
        <KPICard label="Pending Actions" value={workflowData.overview.pendingActions} icon="⏳" />
        <KPICard label="Success Rate" value={`${workflowData.overview.successRate}%`} icon="" />
        <KPICard label="Avg Processing" value={workflowData.overview.avgProcessingTime} icon="⏱️" />
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Workflow Engine Status</h4>
        <div className="space-y-4">
          {[
            { name: 'Order Fulfillment Workflow', desc: 'End-to-end order processing automation' },
            { name: 'Import/Export Workflow', desc: 'Automated trade flow management' },
            { name: 'Legal Compliance Workflow', desc: 'Automated compliance checks' }
          ].map(wf => (
            <div key={wf.name} className="flex items-center justify-between p-4 bg-[#F5F5F7] border border-[#E5E5EA]/20" style={{ borderRadius: 0 }}>
              <div>
                <div className="font-semibold text-[#1A1A1A]">{wf.name}</div>
                <div className="text-sm text-[#8E8E93]">{wf.desc}</div>
              </div>
              <span className="px-3 py-1 text-sm font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OrderFulfillmentScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Order Fulfillment Workflow (8 Steps)</h4>
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          {workflowData.orderFulfillment.steps.map((s, idx) => (
            <div key={idx} className="flex items-center flex-shrink-0">
              <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs ${s.status === 'Completed' ? 'bg-[#F5F5F7]0 text-white' : s.status === 'In Progress' ? 'bg-harvics-burgundy text-white' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>
                {s.status === 'Completed' ? '' : s.step}
              </div>
              <div className="mx-1 text-xs text-[#8E8E93] max-w-[60px] text-center leading-tight">{s.name}</div>
              {idx < workflowData.orderFulfillment.steps.length - 1 && (
                <div className={`w-6 h-0.5 ${s.status === 'Completed' ? 'bg-[#F5F5F7]0' : 'bg-[#F5F5F7]'}`}></div>
              )}
            </div>
          ))}
        </div>
        <h5 className="font-semibold text-[#1A1A1A] mb-3">Active Orders in Workflow</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Order ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Amount</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Current Step</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Progress</th>
            </tr></thead>
            <tbody>
              {workflowData.orderFulfillment.activeOrders.map((o, i) => (
                <tr key={o.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{o.id}</td>
                  <td className="px-4 py-3">{o.customer}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">${o.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{o.currentStep}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-[#F5F5F7] h-2" style={{ borderRadius: 0 }}><div className="bg-harvics-burgundy h-2" style={{ width: `${o.progress}%`, borderRadius: 0 }}></div></div>
                      <span className="text-xs text-[#8E8E93]">{o.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ImportExportFlowScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
          <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Import Workflow</h4>
          <div className="space-y-3">
            {workflowData.importExportFlow.importSteps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs flex-shrink-0 ${s.status === 'Completed' ? 'bg-[#F5F5F7]0 text-white' : s.status === 'In Progress' ? 'bg-harvics-burgundy text-white' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>
                  {s.status === 'Completed' ? '' : i + 1}
                </div>
                <div className="flex-1"><div className="font-semibold text-[#1A1A1A] text-sm">{s.name}</div><div className="text-xs text-[#8E8E93]">{s.status}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
          <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Export Workflow</h4>
          <div className="space-y-3">
            {workflowData.importExportFlow.exportSteps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs flex-shrink-0 ${s.status === 'Completed' ? 'bg-[#F5F5F7]0 text-white' : s.status === 'In Progress' ? 'bg-harvics-burgundy text-white' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>
                  {s.status === 'Completed' ? '' : i + 1}
                </div>
                <div className="flex-1"><div className="font-semibold text-[#1A1A1A] text-sm">{s.name}</div><div className="text-xs text-[#8E8E93]">{s.status}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ComplianceFlowScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Compliance Check Status</h4>
        <div className="space-y-4">
          {workflowData.complianceChecks.map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 border border-[#E5E5EA]/20" style={{ borderRadius: 0 }}>
              <div>
                <div className="font-semibold text-[#1A1A1A]">{c.type}</div>
                <div className="text-sm text-[#8E8E93]">Order: {c.orderId} | Checked: {c.checkedAt}</div>
              </div>
              <span className={`px-3 py-1 text-sm font-bold ${c.status === 'Passed' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Compliance Rules</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Rule ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Type</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Applies To</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
            </tr></thead>
            <tbody>
              {workflowData.complianceRules.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.id}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{r.type}</span></td>
                  <td className="px-4 py-3">{r.appliesTo}</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function WorkflowsDomainContent({ persona, locale }: WorkflowsDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    { id: 'wf-overview', label: 'Workflow Dashboard', icon: '', description: 'Active workflows, completion rates, and processing times', component: <WorkflowOverviewScreen />, tier3Screens: [{ id: 'overview', label: 'Dashboard', icon: '', component: <WorkflowOverviewScreen /> }] },
    { id: 'order-fulfillment', label: 'Order Fulfillment', icon: '', description: 'End-to-end order processing from receipt to payment', component: <OrderFulfillmentScreen />, tier3Screens: [{ id: 'fulfillment', label: 'Active Orders', icon: '', component: <OrderFulfillmentScreen /> }] },
    { id: 'import-export-flow', label: 'Import/Export Flow', icon: '', description: 'Automated import and export trade flow management', component: <ImportExportFlowScreen />, tier3Screens: [{ id: 'trade-flows', label: 'Trade Flows', icon: '', component: <ImportExportFlowScreen /> }] },
    { id: 'compliance-flow', label: 'Compliance Flow', icon: '', description: 'Legal compliance checks integrated into operational workflows', component: <ComplianceFlowScreen />, tier3Screens: [{ id: 'checks', label: 'Compliance Checks', icon: '', component: <ComplianceFlowScreen /> }] }
  ]

  return (
    <OSDomainTierStructure
      domainId="workflows"
      domainName="Workflows & Operations OS"
      tier2Modules={tier2Modules}
      defaultModule="wf-overview"
    />
  )
}
