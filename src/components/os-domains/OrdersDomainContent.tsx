'use client'

import React, { useState, useEffect } from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import OrderListContent from '@/components/domains/orders/OrderListContent'
import InvoiceListContent from '@/components/domains/orders/InvoiceListContent'
import CreditLimitsContent from '@/components/domains/orders/CreditLimitsContent'
import OrderAnalyticsContent from '@/components/domains/orders/OrderAnalyticsContent'

interface OrdersDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

// Live KPI bar
function OrdersKPIBar() {
  const [kpis, setKpis] = useState([
    { label: 'Orders Today',    value: 23,    delta: '+3',    up: true,  fmt: (n:number) => n.toString(),                accent: '#6B1F2B' },
    { label: 'Revenue MTD',     value: 1840000, delta: '+$42K', up: true, fmt: (n:number) => `$${(n/1000000).toFixed(2)}M`, accent: '#C3A35E' },
    { label: 'Pending Approval',value: 7,     delta: '+2',    up: false, fmt: (n:number) => n.toString(),                accent: '#f59e0b' },
    { label: 'On-Time Delivery',value: 94,    delta: '+1%',   up: true,  fmt: (n:number) => `${n}%`,                     accent: '#16a34a' },
    { label: 'Avg Order Value', value: 18400, delta: '+$340', up: true,  fmt: (n:number) => `$${Math.round(n/100)*100}`, accent: '#6B1F2B' },
  ])
  const [flash, setFlash] = useState<number|null>(null)
  useEffect(() => {
    const t = setInterval(() => {
      const idx = Math.floor(Math.random() * kpis.length)
      setKpis(prev => prev.map((k, i) => i !== idx ? k : {
        ...k,
        value: k.value + (Math.random() > 0.4 ? 1 : -1) * Math.round(Math.random() * (i === 1 ? 2000 : 1))
      }))
      setFlash(idx)
      setTimeout(() => setFlash(null), 600)
    }, 2000)
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

export default function OrdersDomainContent({ persona, locale }: OrdersDomainContentProps) {
  // Tier 2 Modules for Orders Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'order-management',
      label: 'Order Management',
      icon: '',
      description: 'Create, track, and manage orders throughout their lifecycle',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              Order Management
            </h3>
            <p className="text-black">Create, track, and manage orders throughout their lifecycle</p>
          </div>
          <OrderListContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'order-list',
          label: 'Order List',
          icon: '',
          component: <div><OrdersKPIBar /><OrderListContent persona={persona} locale={locale} /></div>,
          tier4Actions: [
            {
              id: 'create-order',
              label: 'Create Order',
              icon: '',
              action: () => {
                window.dispatchEvent(new CustomEvent('harvics:action', { detail: { action: 'create-order' } }))
              }
            },
            {
              id: 'bulk-approve',
              label: 'Bulk Approve',
              icon: '',
              action: () => {
                window.dispatchEvent(new CustomEvent('harvics:action', { detail: { action: 'bulk-approve' } }))
              }
            },
            {
              id: 'export-orders',
              label: 'Export Orders',
              icon: '',
              action: () => {
                window.dispatchEvent(new CustomEvent('harvics:action', { detail: { action: 'export-orders' } }))
              }
            },
            {
              id: 'cancel-orders',
              label: 'Cancel Orders',
              icon: '',
              action: () => {
                window.dispatchEvent(new CustomEvent('harvics:action', { detail: { action: 'cancel-orders' } }))
              }
            }
          ]
        },
        {
          id: 'order-analytics',
          label: 'Order Analytics',
          icon: '',
          component: <OrderAnalyticsContent persona={persona} locale={locale} />,
          tier4Actions: [
            {
              id: 'refresh-analytics',
              label: 'Refresh Analytics',
              icon: '',
              action: () => {
                window.dispatchEvent(new CustomEvent('harvics:action', { detail: { action: 'refresh-analytics' } }))
              }
            },
            {
              id: 'schedule-report',
              label: 'Schedule Report',
              icon: '',
              action: () => {
                window.dispatchEvent(new CustomEvent('harvics:action', { detail: { action: 'schedule-report' } }))
              }
            }
          ]
        }
      ]
    },
    {
      id: 'invoicing',
      label: 'Invoicing & Billing',
      icon: '',
      description: 'Generate invoices, manage billing cycles, and track payments',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              Invoicing & Billing
            </h3>
            <p className="text-black">Generate invoices, manage billing cycles, and track payments</p>
          </div>
          <InvoiceListContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'invoice-list',
          label: 'Invoice List',
          icon: '',
          component: <InvoiceListContent persona={persona} locale={locale} />
        },
        {
          id: 'billing-cycles',
          label: 'Billing Cycles',
          icon: '',
          component: <div className="p-6"><h3 className="text-sm font-semibold mb-4">Billing Cycles</h3><p>Manage recurring billing and payment schedules</p></div>
        }
      ]
    },
    {
      id: 'credit-control',
      label: 'Credit Control',
      icon: '',
      description: 'Manage credit limits, collections, and payment terms',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              Credit Control
            </h3>
            <p className="text-black">Manage credit limits, collections, and payment terms</p>
          </div>
          <CreditLimitsContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'credit-limits',
          label: 'Credit Limits',
          icon: '',
          component: <CreditLimitsContent persona={persona} locale={locale} />
        },
        {
          id: 'collections',
          label: 'Collections',
          icon: '',
          component: <div className="p-6"><h3 className="text-sm font-semibold mb-4">Collections Dashboard</h3><p>Track collections and payment terms</p></div>
        }
      ]
    },
    {
      id: 'order-workflow-engine',
      label: 'Workflow Engine',
      icon: '️',
      description: 'End-to-end order fulfillment workflow with 8-step automation',
      tier3Screens: [
        {
          id: 'fulfillment-pipeline',
          label: 'Fulfillment Pipeline',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">Order Fulfillment Pipeline</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ step: 'Order Received', count: 12, color: 'bg-[#F5F5F7] text-[#1D1D1F]' }, { step: 'Inventory Check', count: 8, color: 'bg-[#F5F5F7] text-[#1D1D1F]' }, { step: 'Payment Verified', count: 15, color: 'bg-[#F5F5F7] text-[#1D1D1F]' }, { step: 'Shipped', count: 23, color: 'bg-[#F5F5F7] text-[#1D1D1F]' }].map(s => (
                  <div key={s.step} className="border border-[#E5E5EA]/30 p-4" style={{ borderRadius: 0 }}>
                    <div className="text-sm text-[#8E8E93]">{s.step}</div>
                    <div className="text-2xl font-semibold text-[#1D1D1F]">{s.count}</div>
                    <span className={`px-2 py-1 text-xs font-bold ${s.color}`} style={{ borderRadius: 0 }}>Active</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#F5F5F7] border-l-4 border-[#E5E5EA] p-4" style={{ borderRadius: 0 }}>
                <p className="text-sm text-[#8E8E93]">8-Step Workflow: Order Received → Inventory Check → Payment Verification → Legal Compliance → Shipping Prep → Customs Clearance → Delivery → Payment Processing</p>
              </div>
            </div>
          )
        },
        {
          id: 'sku-price-bands',
          label: 'SKU Price Bands',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">SKU Price Band Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">SKU</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Product</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Min Price</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Max Price</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Current</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Band</th></tr></thead>
                  <tbody>
                    {[{ sku: 'HRV-BEV-001', product: 'Harvics Cola 500ml', min: 1.50, max: 2.50, current: 2.10, band: 'Premium' }, { sku: 'HRV-SNK-001', product: 'Harvics Chips 150g', min: 2.00, max: 3.50, current: 2.80, band: 'Standard' }, { sku: 'HRV-WTR-001', product: 'Harvics Pure Water 1L', min: 0.80, max: 1.50, current: 1.10, band: 'Economy' }].map((s, i) => (
                      <tr key={s.sku} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}><td className="px-4 py-3 font-mono text-[#6B1F2B]">{s.sku}</td><td className="px-4 py-3">{s.product}</td><td className="px-4 py-3 text-right">${s.min.toFixed(2)}</td><td className="px-4 py-3 text-right">${s.max.toFixed(2)}</td><td className="px-4 py-3 text-right font-semibold text-[#1D1D1F]">${s.current.toFixed(2)}</td><td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1D1D1F]" style={{ borderRadius: 0 }}>{s.band}</span></td></tr>
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
      domainId="orders-sales"
      domainName="Orders / Sales OS"
      tier2Modules={tier2Modules}
      defaultModule="order-management"
    />
  )
}

