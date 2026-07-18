'use client'

import React, { useState, useEffect } from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import StockOverviewContent from '@/components/domains/inventory/StockOverviewContent'
import SmartReplenishmentDashboard from '@/components/domains/inventory/SmartReplenishmentDashboard'

interface InventoryDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function InventoryDomainContent({ persona, locale }: InventoryDomainContentProps) {
  type BatchRow = { batch: string; sku: string; wh: string; qty: number; mfg: string; exp: string; status: string; industryVertical: string }
  type LotRow = { lot: string; batch: string; supplier: string; received: number; remaining: number; loc: string }
  type ExpiryRow = { sku: string; product: string; wh: string; qty: number; expiry: string; days: number }
  type WhRow = { name: string; loc: string; cap: number; used: number; skus: number; status: string }
  type MovRow = { date: string; batch: string; event: string; loc: string; qty: number; user: string }

  const [batches, setBatches] = useState<BatchRow[]>([])
  const [lots, setLots] = useState<LotRow[]>([])
  const [expiringBatches, setExpiringBatches] = useState<ExpiryRow[]>([])
  const [warehouses, setWarehouses] = useState<WhRow[]>([])
  const [movements, setMovements] = useState<MovRow[]>([])

  useEffect(() => {
    fetch('/api/inventory/batch').then(r => r.json()).then(({ success, data }) => {
      if (!success || !data) return
      const now = Date.now()
      setBatches(data.map((b: any) => ({ batch: b.batchNo, sku: b.sku, wh: b.warehouse, qty: b.remainingQty, mfg: b.mfgDate || '—', exp: b.expiryDate || '—', status: b.status, industryVertical: b.industryVertical || '' })))
      setLots(data.map((b: any) => ({ lot: 'LOT-' + b.id.slice(0, 5).toUpperCase(), batch: b.batchNo, supplier: b.supplierId || '—', received: b.qty, remaining: b.remainingQty, loc: b.warehouse + (b.bin ? ' / ' + b.bin : '') })))
      const expiring = data
        .filter((b: any) => b.expiryDate && b.status !== 'Expired')
        .map((b: any) => ({ sku: b.sku, product: b.description, wh: b.warehouse, qty: b.remainingQty, expiry: b.expiryDate, days: Math.ceil((new Date(b.expiryDate).getTime() - now) / 86400000) }))
        .sort((a: ExpiryRow, b: ExpiryRow) => a.days - b.days)
      setExpiringBatches(expiring)
    }).catch(() => {})
    fetch('/api/inventory/location').then(r => r.json()).then(({ success, data }) => {
      if (!success || !data) return
      setWarehouses(data.map((d: any) => ({ name: d.locationCode, loc: d.name, cap: d.capacityM2, used: d.utilPct, skus: d.activeSKUs, status: d.status })))
    }).catch(() => {})
    fetch('/api/inventory/movement').then(r => r.json()).then(({ success, data }) => {
      if (!success || !data) return
      setMovements(data.map((d: any) => ({ date: (d.createdAt || '').slice(0, 16).replace('T', ' '), batch: d.batchNo || '—', event: d.movementType, loc: d.fromLocation || d.toLocation || '—', qty: d.qty, user: d.user || '—' })))
    }).catch(() => {})
  }, [])

  // Tier 2 Modules for Inventory Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'smart-inventory',
      label: 'Smart Inventory',
      icon: '',
      description: 'AI-powered inventory management and replenishment',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              Smart Inventory
            </h3>
            <p className="text-black">AI-powered inventory management and replenishment</p>
          </div>
          <StockOverviewContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'stock-overview',
          label: 'Stock Overview',
          icon: '',
          component: <StockOverviewContent persona={persona} locale={locale} />
        },
        {
          id: 'replenishment',
          label: 'Replenishment',
          icon: '',
          component: <SmartReplenishmentDashboard />
        }
      ]
    },
    {
      id: 'warehouse',
      label: 'Warehouse Management',
      icon: '',
      description: 'Multi-location warehouse operations and stock transfers',
      tier3Screens: [
        {
          id: 'warehouse-list',
          label: 'Warehouse List',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Warehouse Locations</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ label: 'Total Warehouses', value: '8' }, { label: 'Total Capacity', value: '142,000 m²' }, { label: 'Utilization', value: '73%' }, { label: 'Active SKUs', value: '4,821' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Warehouse</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Location</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Capacity (m²)</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Used %</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">SKUs</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {warehouses.map((w, i) => (
                      <tr key={w.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono font-semibold text-[#1A1A1A]">{w.name}</td>
                        <td className="px-4 py-3 text-[#8E8E93]">{w.loc}</td>
                        <td className="px-4 py-3 text-right">{w.cap.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-[#F5F5F7] h-1.5" style={{ borderRadius: 0 }}><div className="bg-harvics-burgundy h-1.5" style={{ width: `${w.used}%`, borderRadius: 0 }}></div></div>
                            <span>{w.used}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">{w.skus.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${w.status === 'Active' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{w.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'stock-transfers',
          label: 'Stock Transfers',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Inter-Warehouse Stock Transfers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Transfer ID</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">From</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">To</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">SKU</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Qty</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ id: 'TRF-0841', from: 'WH-DXB-01', to: 'WH-AUH-01', sku: 'HRV-BEV-001', qty: 2400, status: 'In Transit' }, { id: 'TRF-0840', from: 'WH-KHI-01', to: 'WH-LHR-01', sku: 'HRV-SNK-001', qty: 1800, status: 'Completed' }, { id: 'TRF-0839', from: 'WH-SHJ-01', to: 'WH-DXB-01', sku: 'HRV-WTR-001', qty: 5000, status: 'Pending' }, { id: 'TRF-0838', from: 'WH-AUH-01', to: 'WH-SHJ-01', sku: 'HRV-JCE-001', qty: 960, status: 'Completed' }].map((t, i) => (
                      <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">{t.id}</td>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{t.from}</td>
                        <td className="px-4 py-3">{t.to}</td>
                        <td className="px-4 py-3 font-mono text-xs">{t.sku}</td>
                        <td className="px-4 py-3 text-right font-semibold">{t.qty.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${t.status === 'Completed' ? 'bg-[#1A1A1A] text-white' : t.status === 'In Transit' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'warehouse-analytics',
          label: 'Warehouse Analytics',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Warehouse Performance Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Avg Picking Speed', value: '4.2 min', trend: '+8%' }, { label: 'Order Accuracy', value: '99.1%', trend: '+0.3%' }, { label: 'Inbound per Day', value: '320 pallets', trend: '+12%' }, { label: 'Outbound per Day', value: '284 pallets', trend: '+9%' }].map(k => (
                  <div key={k.label} className="border border-[#E5E5EA]/30 p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xs text-[#8E8E93] uppercase mb-1">{k.label}</div>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{k.value}</div>
                    <div className="text-xs text-[#1A1A1A] font-semibold mt-1">{k.trend} vs last month</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Warehouse</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Throughput/Day</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Accuracy</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Utilization</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Cost/Unit</th></tr></thead>
                  <tbody>
                    {[{ wh: 'WH-DXB-01', throughput: 420, accuracy: 99.4, util: 81, cost: 0.18 }, { wh: 'WH-AUH-01', throughput: 310, accuracy: 98.9, util: 67, cost: 0.21 }, { wh: 'WH-KHI-01', throughput: 285, accuracy: 99.1, util: 58, cost: 0.14 }].map((w, i) => (
                      <tr key={w.wh} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono font-semibold text-[#1A1A1A]">{w.wh}</td>
                        <td className="px-4 py-3 text-right">{w.throughput} units</td>
                        <td className="px-4 py-3 text-right font-semibold">{w.accuracy}%</td>
                        <td className="px-4 py-3 text-right">{w.util}%</td>
                        <td className="px-4 py-3 text-right">${w.cost}</td>
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
      id: 'expiry-monitor',
      label: 'Expiry Monitor',
      icon: '⏰',
      description: 'Track expiry dates and manage FEFO/FIFO rules',
      tier3Screens: [
        {
          id: 'expiry-alerts',
          label: 'Expiry Alerts',
          icon: '️',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Expiry Alerts</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[{ label: 'Expiring in 7 days', count: 12, dark: true }, { label: 'Expiring in 30 days', count: 38, dark: false }, { label: 'Already Expired', count: 3, dark: false }].map(s => (
                  <div key={s.label} className={`p-4 text-center ${s.dark ? 'bg-harvics-burgundy text-white' : 'bg-[#F5F5F7]'}`} style={{ borderRadius: 0 }}>
                    <div className="text-2xl font-semibold">{s.count}</div>
                    <div className={`text-xs mt-1 ${s.dark ? 'text-white/70' : 'text-[#8E8E93]'}`}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">SKU</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Product</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Warehouse</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Qty</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Expiry Date</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Days Left</th></tr></thead>
                  <tbody>
                    {expiringBatches.map((a, i) => (
                      <tr key={a.sku} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">{a.sku}</td>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{a.product}</td>
                        <td className="px-4 py-3">{a.wh}</td>
                        <td className="px-4 py-3 text-right">{a.qty.toLocaleString()}</td>
                        <td className="px-4 py-3">{a.expiry}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${a.days <= 7 ? 'bg-harvics-burgundy text-white' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{a.days}d</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'fefo-fifo',
          label: 'FEFO/FIFO Rules',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">FEFO / FIFO Picking Rules</h3>
              <div className="space-y-4">
                {[{ wh: 'WH-DXB-01', method: 'FEFO', categories: 'Dairy, Beverages, Fresh Food', active: true }, { wh: 'WH-AUH-01', method: 'FEFO', categories: 'All Perishables', active: true }, { wh: 'WH-KHI-01', method: 'FIFO', categories: 'Dry Goods, Snacks', active: true }, { wh: 'WH-SHJ-01', method: 'FEFO', categories: 'All Categories', active: false }].map((r, i) => (
                  <div key={r.wh} className="flex items-center justify-between p-4 border border-[#E5E5EA]/30 bg-[#F5F5F7]" style={{ borderRadius: 0 }}>
                    <div>
                      <div className="font-semibold text-[#1A1A1A]">{r.wh}</div>
                      <div className="text-xs text-[#8E8E93] mt-0.5">Applies to: {r.categories}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 text-xs font-bold bg-[#1A1A1A] text-white" style={{ borderRadius: 0 }}>{r.method}</span>
                      <span className={`px-2 py-1 text-xs font-bold ${r.active ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{r.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        {
          id: 'expiry-reports',
          label: 'Expiry Reports',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Expiry Loss Reports</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[{ label: 'Loss This Month', value: '$4,820' }, { label: 'Loss YTD', value: '$31,400' }, { label: 'Batches Destroyed', value: '18' }, { label: 'Recovery Rate', value: '62%' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Month</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Units Expired</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Value Lost</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Top Category</th></tr></thead>
                  <tbody>
                    {[{ month: 'Mar 2026', units: 1240, value: '$4,820', cat: 'Dairy' }, { month: 'Feb 2026', units: 980, value: '$3,920', cat: 'Fresh Juice' }, { month: 'Jan 2026', units: 1580, value: '$6,200', cat: 'Dairy' }, { month: 'Dec 2025', units: 2100, value: '$8,400', cat: 'Seasonal' }].map((r, i) => (
                      <tr key={r.month} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.month}</td>
                        <td className="px-4 py-3 text-right">{r.units.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-harvics-burgundy">{r.value}</td>
                        <td className="px-4 py-3 text-right">{r.cat}</td>
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
      id: 'batch-tracking',
      label: 'Batch / Lot Tracking',
      icon: '',
      description: 'Full traceability and lot number management',
      tier3Screens: [
        {
          id: 'batch-list',
          label: 'Batch List',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Batch / Lot Numbers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ label: 'Active Batches', value: '284' }, { label: 'Total Units', value: '128,400' }, { label: 'Expiring Soon', value: '12' }, { label: 'Quarantined', value: '3' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Batch No.</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">SKU</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Warehouse</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Qty</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">MFG Date</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Expiry</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {batches.map((b, i) => (
                      <tr key={b.batch} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">{b.batch}</td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1A1A1A]">{b.sku}</td>
                        <td className="px-4 py-3">{b.wh}</td>
                        <td className="px-4 py-3 text-right font-semibold">{b.qty.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs">{b.mfg}</td>
                        <td className="px-4 py-3 text-xs">{b.exp}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${b.status === 'Active' ? 'bg-[#1A1A1A] text-white' : b.status === 'Expiring' ? 'bg-harvics-burgundy text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'lot-tracking',
          label: 'Lot Tracking',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Lot Number Tracking</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Lot No.</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Batch</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Supplier</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Received</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Remaining</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Location</th></tr></thead>
                  <tbody>
                    {lots.map((l, i) => (
                      <tr key={l.lot} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1A1A1A]">{l.lot}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">{l.batch}</td>
                        <td className="px-4 py-3">{l.supplier}</td>
                        <td className="px-4 py-3 text-right">{l.received.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">{l.remaining.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-[#8E8E93]">{l.loc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'batch-history',
          label: 'Batch History',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Batch Movement History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Batch</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Event</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Location</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Qty</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">User</th></tr></thead>
                  <tbody>
                    {movements.map((h, i) => (
                      <tr key={h.date} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 text-xs text-[#8E8E93]">{h.date}</td>
                        <td className="px-4 py-3 font-mono text-xs">{h.batch}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{h.event}</span></td>
                        <td className="px-4 py-3">{h.loc}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${h.qty < 0 ? 'text-harvics-burgundy' : h.qty > 0 ? 'text-[#1A1A1A]' : 'text-[#8E8E93]'}`}>{h.qty !== 0 ? (h.qty > 0 ? '+' : '') + h.qty.toLocaleString() : '—'}</td>
                        <td className="px-4 py-3 text-xs text-[#8E8E93]">{h.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'traceability',
          label: 'Traceability',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Full Product Traceability Chain</h3>
              <div className="bg-[#F5F5F7] p-4 text-sm text-[#8E8E93]" style={{ borderRadius: 0 }}>Search a batch or SKU above to trace its complete supply chain journey</div>
              <div className="space-y-0">
                {[{ step: 1, label: 'Raw Material Sourced', detail: 'Supplier: Al Rawabi Dairy — UAE', date: '2026-01-05', done: true }, { step: 2, label: 'Manufacturing', detail: 'Factory: Dubai Industrial City — Batch BT-2026-0841', date: '2026-01-10', done: true }, { step: 3, label: 'Quality Control', detail: 'QC passed — Certificate No. QC-24821', date: '2026-01-12', done: true }, { step: 4, label: 'Received at Warehouse', detail: 'WH-DXB-01 — Rack B4 — 12,000 units', date: '2026-01-14', done: true }, { step: 5, label: 'Picked & Packed', detail: 'Order ORD-8821 — 240 units to Customer', date: '2026-03-23', done: true }, { step: 6, label: 'Delivered', detail: 'POD signed by: Al Fardan Group', date: '2026-03-23', done: false }].map((s, i, arr) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold ${s.done ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F7] text-[#8E8E93] border border-[#E5E5EA]'}`} style={{ borderRadius: 0 }}>{s.step}</div>
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-[#E5E5EA] my-1"></div>}
                    </div>
                    <div className="pb-6">
                      <div className="font-semibold text-[#1A1A1A]">{s.label}</div>
                      <div className="text-xs text-[#8E8E93]">{s.detail}</div>
                      <div className="text-xs text-[#8E8E93] mt-0.5">{s.date}</div>
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
      id: 'sku-catalog',
      label: 'SKU Catalog',
      icon: '',
      description: 'Full product catalog with SKU details, categories, and country-specific pricing',
      tier3Screens: [
        {
          id: 'product-catalog',
          label: 'Product Catalog',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">SKU Product Catalog</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">SKU</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Product</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Category</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Stock</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Price</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th></tr></thead>
                  <tbody>
                    {[{ sku: 'HRV-BEV-001', name: 'Harvics Cola 500ml', cat: 'Beverages', stock: 12500, price: 2.10, status: 'Active' }, { sku: 'HRV-SNK-001', name: 'Harvics Chips 150g', cat: 'Snacks', stock: 8400, price: 2.80, status: 'Active' }, { sku: 'HRV-WTR-001', name: 'Harvics Pure Water 1L', cat: 'Water', stock: 25000, price: 1.10, status: 'Active' }, { sku: 'HRV-JCE-001', name: 'Harvics Mango Juice 330ml', cat: 'Beverages', stock: 6200, price: 1.80, status: 'Active' }].map((p, i) => (
                      <tr key={p.sku} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono font-semibold text-[#1A1A1A]">{p.sku}</td>
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{p.cat}</span></td>
                        <td className="px-4 py-3 text-right">{p.stock.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">${p.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{p.status}</span></td>
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
      domainId="inventory"
      domainName="Inventory OS"
      tier2Modules={tier2Modules}
      defaultModule="smart-inventory"
    />
  )
}

