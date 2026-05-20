'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import LegalIPRDomainContent from '@/components/os-domains/LegalIPRDomainContent'
import LiveModuleData from '@/components/shared/LiveModuleData'

export default function LegalOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Legal & IPR OS"
    >
      <LegalIPRDomainContent persona={persona} locale={locale} />
      <LiveModuleData
        endpoint="/api/v2/documents"
        title="Live Documents & Contracts"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'type', label: 'Type' },
          { key: 'category', label: 'Category' },
          { key: 'status', label: 'Status' },
          { key: 'expiryDate', label: 'Expires' },
        ]}
        emptyMessage="No documents yet. POST to /api/v2/documents to upload one."
      />
      <LiveModuleData
        endpoint="/api/v2/audit-events"
        title="Audit Trail (Last 500 Events)"
        columns={[
          { key: 'action', label: 'Action' },
          { key: 'actorRole', label: 'Actor Role' },
          { key: 'module', label: 'Module' },
          { key: 'entity', label: 'Entity' },
          { key: 'result', label: 'Result' },
          { key: 'createdAt', label: 'When', format: (v: any) => v ? new Date(v).toLocaleString() : '—' },
        ]}
        emptyMessage="No audit events recorded yet."
      />
    </DashboardLayout>
  )
}
