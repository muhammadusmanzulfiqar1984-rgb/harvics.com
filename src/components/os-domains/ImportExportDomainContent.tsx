'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import KPICard from '@/components/shared/KPICard'

interface ImportExportDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const tradeData = {
  overview: { activeImports: 23, activeExports: 18, pendingClearance: 5, totalValue: 12500000, complianceRate: 98 },
  imports: [
    { id: 'IMP-001', supplier: 'ABC Manufacturing Co.', origin: 'China', hsCode: '2202.10', product: 'Carbonated Beverages', quantity: 10000, value: 250000, status: 'In Transit', customsStatus: 'Cleared', eta: '2025-01-15' },
    { id: 'IMP-002', supplier: 'XYZ Food Products', origin: 'Thailand', hsCode: '1905.90', product: 'Snack Products', quantity: 5000, value: 180000, status: 'Customs Clearance', customsStatus: 'Pending', eta: '2025-01-20' },
    { id: 'IMP-003', supplier: 'Global Ingredients Ltd', origin: 'India', hsCode: '1701.14', product: 'Sugar', quantity: 20000, value: 45000, status: 'Delivered', customsStatus: 'Cleared', eta: '2024-12-28' }
  ],
  exports: [
    { id: 'EXP-001', customer: 'European Distributor', destination: 'Germany', hsCode: '2202.10', product: 'Premium Beverages', quantity: 8000, value: 320000, status: 'Shipped', customsStatus: 'Cleared', etd: '2025-01-10' },
    { id: 'EXP-002', customer: 'Middle East Retail Chain', destination: 'UAE', hsCode: '1905.90', product: 'Snack Products', quantity: 12000, value: 280000, status: 'In Transit', customsStatus: 'Cleared', etd: '2025-01-05' },
    { id: 'EXP-003', customer: 'Asian Market Distributor', destination: 'Singapore', hsCode: '2202.10', product: 'Beverages', quantity: 6000, value: 195000, status: 'Pending Shipment', customsStatus: 'Pending', etd: '2025-01-18' }
  ],
  hsCodes: [
    { code: '2202.10', description: 'Waters, mineral and aerated', importDuty: 5, exportDuty: 0, vat: 10 },
    { code: '1905.90', description: 'Bread, pastry, cakes, biscuits', importDuty: 8, exportDuty: 0, vat: 12 },
    { code: '1701.14', description: 'Cane sugar', importDuty: 3, exportDuty: 0, vat: 5 },
    { code: '2106.90', description: 'Food preparations n.e.s.', importDuty: 7, exportDuty: 0, vat: 10 }
  ],
  documents: [
    { id: 'DOC-001', type: 'Commercial Invoice', orderId: 'IMP-001', status: 'Generated', date: '2024-12-15' },
    { id: 'DOC-002', type: 'Bill of Lading', orderId: 'IMP-001', status: 'Received', date: '2024-12-20' },
    { id: 'DOC-003', type: 'Certificate of Origin', orderId: 'EXP-001', status: 'Generated', date: '2025-01-05' },
    { id: 'DOC-004', type: 'Customs Declaration', orderId: 'IMP-002', status: 'Pending', date: '—' },
    { id: 'DOC-005', type: 'Packing List', orderId: 'EXP-002', status: 'Generated', date: '2025-01-03' }
  ]
}

function TradeOverviewScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Active Imports" value={tradeData.overview.activeImports} icon="" />
        <KPICard label="Active Exports" value={tradeData.overview.activeExports} icon="" />
        <KPICard label="Pending Clearance" value={tradeData.overview.pendingClearance} icon="️" />
        <KPICard label="Compliance Rate" value={`${tradeData.overview.complianceRate}%`} icon="" />
      </div>
      <div className="bg-[#F5F5F7] border-l-4 border-[#E5E5EA] p-4" style={{ borderRadius: 0 }}>
        <div className="text-sm text-[#8E8E93]">Total Trade Value (Last 30 Days)</div>
        <div className="text-2xl font-semibold text-[#1A1A1A]">${tradeData.overview.totalValue.toLocaleString()}</div>
      </div>
    </div>
  )
}

function ImportOrdersScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Import Orders</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Supplier</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Origin</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">HS Code</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Qty</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Value</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Customs</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ETA</th>
            </tr></thead>
            <tbody>
              {tradeData.imports.map((o, i) => (
                <tr key={o.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{o.id}</td>
                  <td className="px-4 py-3">{o.supplier}</td>
                  <td className="px-4 py-3">{o.origin}</td>
                  <td className="px-4 py-3">{o.product}</td>
                  <td className="px-4 py-3 font-mono text-[#8E8E93]">{o.hsCode}</td>
                  <td className="px-4 py-3 text-right">{o.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">${o.value.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${o.status === 'Delivered' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : o.status === 'In Transit' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{o.status}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${o.customsStatus === 'Cleared' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{o.customsStatus}</span></td>
                  <td className="px-4 py-3 text-[#8E8E93]">{o.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ExportOrdersScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Export Orders</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Destination</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">HS Code</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Qty</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Value</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Customs</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ETD</th>
            </tr></thead>
            <tbody>
              {tradeData.exports.map((o, i) => (
                <tr key={o.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{o.id}</td>
                  <td className="px-4 py-3">{o.customer}</td>
                  <td className="px-4 py-3">{o.destination}</td>
                  <td className="px-4 py-3">{o.product}</td>
                  <td className="px-4 py-3 font-mono text-[#8E8E93]">{o.hsCode}</td>
                  <td className="px-4 py-3 text-right">{o.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">${o.value.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${o.status === 'Shipped' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : o.status === 'In Transit' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{o.status}</span></td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${o.customsStatus === 'Cleared' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{o.customsStatus}</span></td>
                  <td className="px-4 py-3 text-[#8E8E93]">{o.etd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CustomsTariffsScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">HS Code Database</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">HS Code</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Import Duty</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Export Duty</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">VAT</th>
            </tr></thead>
            <tbody>
              {tradeData.hsCodes.map((hs, i) => (
                <tr key={hs.code} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-bold font-mono text-[#6B1F2B]">{hs.code}</td>
                  <td className="px-4 py-3">{hs.description}</td>
                  <td className="px-4 py-3 text-right">{hs.importDuty}%</td>
                  <td className="px-4 py-3 text-right">{hs.exportDuty}%</td>
                  <td className="px-4 py-3 text-right">{hs.vat}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TradeDocumentsScreen() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E5EA]/30 p-6" style={{ borderRadius: 0 }}>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Trade Documentation</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Doc ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Order</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Date</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody>
              {tradeData.documents.map((doc, i) => (
                <tr key={doc.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{doc.id}</td>
                  <td className="px-4 py-3">{doc.type}</td>
                  <td className="px-4 py-3">{doc.orderId}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${doc.status === 'Generated' || doc.status === 'Received' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{doc.status}</span></td>
                  <td className="px-4 py-3 text-[#8E8E93]">{doc.date}</td>
                  <td className="px-4 py-3 text-center"><button className="text-[#C3A35E] hover:text-[#6B1F2B] font-bold text-xs">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function ImportExportDomainContent({ persona, locale }: ImportExportDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    { id: 'trade-overview', label: 'Trade Dashboard', icon: '', description: 'Import/export operations overview, trade value, and compliance', component: <TradeOverviewScreen />, tier3Screens: [{ id: 'overview', label: 'Overview', icon: '', component: <TradeOverviewScreen /> }] },
    { id: 'import-orders', label: 'Import Orders', icon: '', description: 'Track incoming shipments, customs clearance, and delivery', component: <ImportOrdersScreen />, tier3Screens: [{ id: 'imports', label: 'Import List', icon: '', component: <ImportOrdersScreen /> }] },
    { id: 'export-orders', label: 'Export Orders', icon: '', description: 'Manage outbound shipments, documentation, and compliance', component: <ExportOrdersScreen />, tier3Screens: [{ id: 'exports', label: 'Export List', icon: '', component: <ExportOrdersScreen /> }] },
    { id: 'customs-tariffs', label: 'Customs & Tariffs', icon: '️', description: 'HS codes, duty rates, VAT configuration, and tariff management', component: <CustomsTariffsScreen />, tier3Screens: [{ id: 'hs-codes', label: 'HS Codes', icon: '', component: <CustomsTariffsScreen /> }] },
    { id: 'trade-documents', label: 'Trade Documents', icon: '', description: 'Commercial invoices, bills of lading, certificates of origin', component: <TradeDocumentsScreen />, tier3Screens: [{ id: 'docs', label: 'Documents', icon: '', component: <TradeDocumentsScreen /> }] }
  ]

  return (
    <OSDomainTierStructure
      domainId="import-export"
      domainName="Import/Export OS"
      tier2Modules={tier2Modules}
      defaultModule="trade-overview"
    />
  )
}
