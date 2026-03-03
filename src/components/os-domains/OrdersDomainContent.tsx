'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import OrderListContent from '@/components/domains/orders/OrderListContent'
import InvoiceListContent from '@/components/domains/orders/InvoiceListContent'
import CreditLimitsContent from '@/components/domains/orders/CreditLimitsContent'
import OrderAnalyticsContent from '@/components/domains/orders/OrderAnalyticsContent'

interface OrdersDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function OrdersDomainContent({ persona, locale }: OrdersDomainContentProps) {
  // Tier 2 Modules for Orders Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'order-management',
      label: 'Order Management',
      icon: '📋',
      description: 'Create, track, and manage orders throughout their lifecycle',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              📋 Order Management
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
          icon: '📄',
          component: <OrderListContent persona={persona} locale={locale} />,
          tier4Actions: [
            {
              id: 'create-order',
              label: 'Create Order',
              icon: '➕',
              action: () => {
                console.log('Creating new order...')
                alert('Create Order action triggered')
              }
            },
            {
              id: 'bulk-approve',
              label: 'Bulk Approve',
              icon: '✅',
              action: () => {
                console.log('Bulk approving orders...')
                alert('Bulk Approve action triggered')
              }
            },
            {
              id: 'export-orders',
              label: 'Export Orders',
              icon: '📤',
              action: () => {
                console.log('Exporting orders...')
                alert('Export Orders action triggered')
              }
            },
            {
              id: 'cancel-orders',
              label: 'Cancel Orders',
              icon: '❌',
              action: () => {
                console.log('Cancelling orders...')
                alert('Cancel Orders action triggered')
              }
            }
          ]
        },
        {
          id: 'order-analytics',
          label: 'Order Analytics',
          icon: '📊',
          component: <OrderAnalyticsContent persona={persona} locale={locale} />,
          tier4Actions: [
            {
              id: 'refresh-analytics',
              label: 'Refresh Analytics',
              icon: '🔄',
              action: () => {
                console.log('Refreshing analytics...')
                alert('Refresh Analytics action triggered')
              }
            },
            {
              id: 'schedule-report',
              label: 'Schedule Report',
              icon: '📅',
              action: () => {
                console.log('Scheduling report...')
                alert('Schedule Report action triggered')
              }
            }
          ]
        }
      ]
    },
    {
      id: 'invoicing',
      label: 'Invoicing & Billing',
      icon: '🧾',
      description: 'Generate invoices, manage billing cycles, and track payments',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              🧾 Invoicing & Billing
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
          icon: '📄',
          component: <InvoiceListContent persona={persona} locale={locale} />
        },
        {
          id: 'billing-cycles',
          label: 'Billing Cycles',
          icon: '📅',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Billing Cycles</h3><p>Manage recurring billing and payment schedules</p></div>
        }
      ]
    },
    {
      id: 'credit-control',
      label: 'Credit Control',
      icon: '💰',
      description: 'Manage credit limits, collections, and payment terms',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              💰 Credit Control
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
          icon: '💳',
          component: <CreditLimitsContent persona={persona} locale={locale} />
        },
        {
          id: 'collections',
          label: 'Collections',
          icon: '📊',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Collections Dashboard</h3><p>Track collections and payment terms</p></div>
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

