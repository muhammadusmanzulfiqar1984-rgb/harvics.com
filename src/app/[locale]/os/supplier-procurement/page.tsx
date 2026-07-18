'use client'

import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import KPICard from '@/components/shared/KPICard'

interface Summary {
  totalPOs: number
  pendingPOs: number
  approvedPOs: number
  totalValue: number
  totalGRNs: number
  pendingGRNs: number
  totalVendors: number
  activeVendors: number
  openRFQs: number
  totalRFQs: number
}

interface Vendor {
  id: string
  name: string
  country: string
  category: string
  paymentTerms: string
  status: string
  riskScore: string
  rating: number
}

interface RFQ {
  id: string
  rfqNo: string
  title: string
  category: string
  targetPrice: number
  currency: string
  deadline: string
  status: string
  suppliersInvited: number
  quotesReceived: number
}

interface PO {
  id: string
  poNumber: string
  supplier: string
  total: number
  currency: string
  status: string
  expectedDate: string
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  Inactive: 'bg-gray-100 text-gray-600',
  Open: 'bg-blue-100 text-blue-800',
  Closed: 'bg-gray-100 text-gray-600',
  Approved: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Received: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
}

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
    {status}
  </span>
)

export default function SupplierProcurementOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  const portal = pathname?.includes('/portal/distributor') ? 'distributor'
    : pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  const [summary, setSummary] = useState<Summary | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [rfqs, setRFQs] = useState<RFQ[]>([])
  const [pos, setPOs] = useState<PO[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'rfq' | 'po'>('overview')
  const [loading, setLoading] = useState(true)

  // 3-way match state
  const [matchPONumber, setMatchPONumber] = useState('')
  const [matchResult, setMatchResult] = useState<any>(null)
  const [matchLoading, setMatchLoading] = useState(false)

  useEffect(() => {
    const base = '/api/procurement-crud'
    Promise.all([
      fetch(`${base}/summary`).then(r => r.json()),
      fetch(`${base}/vendor`).then(r => r.json()),
      fetch(`${base}/rfq`).then(r => r.json()),
      fetch(`${base}/po`).then(r => r.json()),
    ]).then(([s, v, r, p]) => {
      if (s.success) setSummary(s.data)
      if (v.success) setVendors(v.data)
      if (r.success) setRFQs(r.data)
      if (p.success) setPOs(p.data)
    }).finally(() => setLoading(false))
  }, [])

  const run3WayMatch = async () => {
    if (!matchPONumber.trim()) return
    setMatchLoading(true)
    setMatchResult(null)
    try {
      const res = await fetch(`/api/procurement-crud/3way-match/${matchPONumber.trim()}`)
      const data = await res.json()
      setMatchResult(data)
    } finally {
      setMatchLoading(false)
    }
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'vendors', label: `Vendors (${vendors.length})` },
    { key: 'rfq', label: `RFQs (${rfqs.length})` },
    { key: 'po', label: `Purchase Orders (${pos.length})` },
  ]

  return (
    <DashboardLayout portal={portal} pageTitle="Supplier & Procurement OS">
      <div className="space-y-6">

        {/* KPI Cards — live data */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPICard label="Active Vendors" value={loading ? '—' : String(summary?.activeVendors ?? 0)} icon="🏭" />
          <KPICard label="Open RFQs" value={loading ? '—' : String(summary?.openRFQs ?? 0)} icon="📄" />
          <KPICard label="Pending POs" value={loading ? '—' : String(summary?.pendingPOs ?? 0)} icon="📋" />
          <KPICard label="Approved POs" value={loading ? '—' : String(summary?.approvedPOs ?? 0)} icon="✅" />
          <KPICard label="Total PO Value" value={loading ? '—' : `$${((summary?.totalValue ?? 0) / 1000).toFixed(0)}K`} icon="💰" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-harvics-gold/30">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-harvics-burgundy text-harvics-burgundy'
                  : 'text-harvics-burgundy/60 hover:text-harvics-burgundy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Workflow */}
            <div>
              <h3 className="text-lg font-semibold text-harvics-burgundy mb-4">Procurement Workflow</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { step: '1', label: 'RFQ', desc: 'Request for Quotation sent to vendors' },
                  { step: '2', label: 'Purchase Order', desc: 'PO raised after quote comparison' },
                  { step: '3', label: 'GRN', desc: 'Goods Receipt Note on delivery' },
                  { step: '4', label: '3-Way Match', desc: 'PO + GRN + Invoice verified before payment' },
                ].map(w => (
                  <div key={w.step} className="flex items-start gap-3 p-4 bg-white border border-harvics-gold/30 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 rounded-full bg-harvics-burgundy text-white flex items-center justify-center text-sm font-bold shrink-0">{w.step}</div>
                    <div>
                      <h4 className="font-semibold text-harvics-burgundy text-sm">{w.label}</h4>
                      <p className="text-xs text-harvics-burgundy/60 mt-0.5">{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Way Match Lookup */}
            <div>
              <h3 className="text-lg font-semibold text-harvics-burgundy mb-4">3-Way Match Check</h3>
              <div className="bg-white border border-harvics-gold/30 p-4">
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Enter PO Number (e.g. PO-2026-001)"
                    value={matchPONumber}
                    onChange={e => setMatchPONumber(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && run3WayMatch()}
                    className="flex-1 border border-harvics-gold/40 px-3 py-2 text-sm text-harvics-burgundy focus:outline-none focus:border-harvics-burgundy"
                  />
                  <button
                    onClick={run3WayMatch}
                    disabled={matchLoading}
                    className="px-4 py-2 bg-harvics-burgundy text-white text-sm font-medium hover:bg-[#8B2F3B] disabled:opacity-50 transition-colors"
                  >
                    {matchLoading ? 'Checking…' : 'Run Match'}
                  </button>
                </div>

                {matchResult && (
                  <div className="border border-harvics-gold/20 p-4 bg-[#FAFAF8]">
                    {matchResult.success ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-harvics-burgundy">{matchResult.data.poNumber}</span>
                          <StatusBadge status={matchResult.data.matchStatus} />
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="p-3 border border-harvics-gold/20">
                            <div className="text-xs text-harvics-burgundy/60 mb-1">Purchase Order</div>
                            <div className="font-semibold text-harvics-burgundy">{matchResult.data.po.supplier}</div>
                            <div className="text-xs">${matchResult.data.po.value?.toLocaleString()} {matchResult.data.po.currency}</div>
                            <StatusBadge status={matchResult.data.po.status} />
                          </div>
                          <div className="p-3 border border-harvics-gold/20">
                            <div className="text-xs text-harvics-burgundy/60 mb-1">GRN</div>
                            {matchResult.data.grn
                              ? <><div className="font-semibold text-harvics-burgundy">{matchResult.data.grn.grnNo}</div>
                                  <div className="text-xs">{matchResult.data.grn.receivedDate}</div>
                                  <StatusBadge status={matchResult.data.grn.status} /></>
                              : <div className="text-xs text-harvics-burgundy/50">Not received yet</div>
                            }
                          </div>
                          <div className="p-3 border border-harvics-gold/20">
                            <div className="text-xs text-harvics-burgundy/60 mb-1">Invoice</div>
                            <div className="text-xs text-harvics-burgundy/50">Pending AP module</div>
                          </div>
                        </div>
                        {matchResult.data.discrepancy && (
                          <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 p-2">
                            ⚠ {matchResult.data.discrepancy}
                          </div>
                        )}
                        {matchResult.data.readyForPayment && (
                          <div className="text-xs text-green-700 bg-green-50 border border-green-200 p-2">
                            ✓ All legs matched — ready for payment authorisation
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-red-600">{matchResult.error}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
          <div>
            <h3 className="text-lg font-semibold text-harvics-burgundy mb-4">Vendor Master</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-harvics-gold/30">
                <thead className="bg-harvics-burgundy text-white">
                  <tr>
                    {['Vendor Name', 'Country', 'Category', 'Payment Terms', 'Risk', 'Rating', 'Status'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, i) => (
                    <tr key={v.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                      <td className="px-3 py-2 font-medium text-harvics-burgundy">{v.name}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/70">{v.country}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/70">{v.category}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/70">{v.paymentTerms}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${v.riskScore === 'Low' ? 'bg-green-100 text-green-800' : v.riskScore === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {v.riskScore}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-harvics-burgundy">{v.rating > 0 ? `${v.rating} ★` : '—'}</td>
                      <td className="px-3 py-2"><StatusBadge status={v.status} /></td>
                    </tr>
                  ))}
                  {vendors.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-6 text-center text-harvics-burgundy/40">No vendors found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RFQ TAB */}
        {activeTab === 'rfq' && (
          <div>
            <h3 className="text-lg font-semibold text-harvics-burgundy mb-4">Request for Quotation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-harvics-gold/30">
                <thead className="bg-harvics-burgundy text-white">
                  <tr>
                    {['RFQ No', 'Title', 'Category', 'Target Price', 'Deadline', 'Suppliers', 'Quotes', 'Status'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                      <td className="px-3 py-2 font-mono text-xs text-harvics-burgundy">{r.rfqNo}</td>
                      <td className="px-3 py-2 font-medium text-harvics-burgundy">{r.title}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/70">{r.category}</td>
                      <td className="px-3 py-2 text-harvics-burgundy">${r.targetPrice?.toLocaleString()} {r.currency}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/70">{r.deadline}</td>
                      <td className="px-3 py-2 text-center text-harvics-burgundy">{r.suppliersInvited}</td>
                      <td className="px-3 py-2 text-center text-harvics-burgundy">{r.quotesReceived}</td>
                      <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                  {rfqs.length === 0 && (
                    <tr><td colSpan={8} className="px-3 py-6 text-center text-harvics-burgundy/40">No RFQs found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PURCHASE ORDERS TAB */}
        {activeTab === 'po' && (
          <div>
            <h3 className="text-lg font-semibold text-harvics-burgundy mb-4">Purchase Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-harvics-gold/30">
                <thead className="bg-harvics-burgundy text-white">
                  <tr>
                    {['PO Number', 'Supplier', 'Total', 'Currency', 'Expected', 'Status', 'Match'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pos.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                      <td className="px-3 py-2 font-mono text-xs text-harvics-burgundy">{p.poNumber}</td>
                      <td className="px-3 py-2 font-medium text-harvics-burgundy">{p.supplier}</td>
                      <td className="px-3 py-2 text-harvics-burgundy">${p.total?.toLocaleString()}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/70">{p.currency}</td>
                      <td className="px-3 py-2 text-harvics-burgundy/70">{p.expectedDate || '—'}</td>
                      <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => { setMatchPONumber(p.poNumber); setActiveTab('overview') }}
                          className="text-xs text-harvics-burgundy underline hover:text-[#8B2F3B]"
                        >
                          Check
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pos.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-6 text-center text-harvics-burgundy/40">No purchase orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}

