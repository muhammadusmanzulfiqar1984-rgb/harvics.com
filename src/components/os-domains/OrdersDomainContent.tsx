'use client'

import React, { useState, useEffect } from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import OrderListContent from '@/components/domains/orders/OrderListContent'
import InvoiceListContent from '@/components/domains/orders/InvoiceListContent'
import CreditLimitsContent from '@/components/domains/orders/CreditLimitsContent'
import SalesOrdersContent from '@/components/domains/orders/SalesOrdersContent'
import OrderAnalyticsContent from '@/components/domains/orders/OrderAnalyticsContent'
import { SalesAnalyticsCharts } from '@/components/os-domains/DomainAnalyticsCharts'

interface OrdersDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

// Live KPI bar — from /api/orders/summary only
function OrdersKPIBar() {
  const [summary, setSummary] = useState<{ totalOrders?: number; pending?: number; completed?: number; totalAmount?: number } | null>(null)
  const [status, setStatus] = useState<'loading' | 'live' | 'empty'>('loading')

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
    fetch('/api/orders/summary', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d.data) {
          setSummary(d.data)
          setStatus((d.data.totalOrders || 0) > 0 ? 'live' : 'empty')
        } else setStatus('empty')
      })
      .catch(() => setStatus('empty'))
  }, [])

  const kpis = [
    { label: 'Total orders', value: summary?.totalOrders ?? 0, fmt: (n: number) => String(n) },
    { label: 'Pending', value: summary?.pending ?? 0, fmt: (n: number) => String(n) },
    { label: 'Completed', value: summary?.completed ?? 0, fmt: (n: number) => String(n) },
    {
      label: 'Order value',
      value: summary?.totalAmount ?? 0,
      fmt: (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`),
    },
  ]

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="mb-2 flex items-center gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${status === 'live' ? 'text-emerald-700' : 'text-[#6B5E52]'}`}>
          {status === 'loading' ? 'Loading…' : status === 'live' ? 'Live · Orders API' : 'No orders yet'}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl px-4 py-3 border border-[#E8E0D4] bg-white">
            <div className="text-[10px] text-[#8E8E93] uppercase tracking-wider mb-1">{k.label}</div>
            <div className="text-2xl font-semibold tabular-nums text-[#3D1212]">{k.fmt(k.value)}</div>
          </div>
        ))}
      </div>
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
          id: 'sales-orders',
          label: 'Sales Orders (CPQ)',
          icon: '',
          component: <SalesOrdersContent locale={locale} />,
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
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Order Fulfillment Pipeline</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ step: 'Order Received', count: 12, color: 'bg-[#F5F5F7] text-[#1A1A1A]' }, { step: 'Inventory Check', count: 8, color: 'bg-[#F5F5F7] text-[#1A1A1A]' }, { step: 'Payment Verified', count: 15, color: 'bg-[#F5F5F7] text-[#1A1A1A]' }, { step: 'Shipped', count: 23, color: 'bg-[#F5F5F7] text-[#1A1A1A]' }].map(s => (
                  <div key={s.step} className="border border-[#E5E5EA]/30 p-4" style={{ borderRadius: 0 }}>
                    <div className="text-sm text-[#8E8E93]">{s.step}</div>
                    <div className="text-2xl font-semibold text-[#1A1A1A]">{s.count}</div>
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
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">SKU Price Band Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">SKU</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Product</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Min Price</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Max Price</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Current</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Band</th></tr></thead>
                  <tbody>
                    {[{ sku: 'HRV-BEV-001', product: 'Harvics Cola 500ml', min: 1.50, max: 2.50, current: 2.10, band: 'Premium' }, { sku: 'HRV-SNK-001', product: 'Harvics Chips 150g', min: 2.00, max: 3.50, current: 2.80, band: 'Standard' }, { sku: 'HRV-WTR-001', product: 'Harvics Pure Water 1L', min: 0.80, max: 1.50, current: 1.10, band: 'Economy' }].map((s, i) => (
                      <tr key={s.sku} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}><td className="px-4 py-3 font-mono text-harvics-burgundy">{s.sku}</td><td className="px-4 py-3">{s.product}</td><td className="px-4 py-3 text-right">${s.min.toFixed(2)}</td><td className="px-4 py-3 text-right">${s.max.toFixed(2)}</td><td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">${s.current.toFixed(2)}</td><td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{s.band}</span></td></tr>
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

  tier2Modules.unshift({
    id: 'sales-analytics',
    label: 'Sales Analytics',
    icon: '',
    description: 'Sales analytics — revenue trends, channel mix, vertical performance, order volume',
    component: <SalesAnalyticsCharts />,
    tier3Screens: [{ id: 'sales-charts', label: 'Sales Charts', icon: '', component: <SalesAnalyticsCharts /> }]
  })

  return (
    <OSDomainTierStructure
      domainId="orders-sales"
      domainName="Orders / Sales OS"
      tier2Modules={tier2Modules}
      defaultModule="sales-analytics"
    />
  )
}

