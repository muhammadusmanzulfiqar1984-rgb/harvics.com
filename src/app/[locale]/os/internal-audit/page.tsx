'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import InternalAuditModuleThirtyEight from '@/components/os-domains/InternalAuditModuleThirtyEight'

/** Module #38 — Internal Audit */
export default function InternalAuditOSPage() {
  return (
    <HarvicsOSShell
      title="Internal Audit"
      subtitle="Module #38 — SAP+ audit events · emitAudit sink"
      activeDomain="legal"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Internal Audit' },
      ]}
    >
      <InternalAuditModuleThirtyEight />
    </HarvicsOSShell>
  )
}
