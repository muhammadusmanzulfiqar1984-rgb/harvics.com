'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import AnalyticsModuleFortyFive from '@/components/os-domains/AnalyticsModuleFortyFive'

/** Module #45 — Project Management */
export default function ProjectManagementOSPage() {
  return (
    <HarvicsOSShell
      title="Project Management"
      subtitle="Module #45 — SAP+ workspace"
      activeDomain="projects"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Projects' },
      ]}
    >
      <AnalyticsModuleFortyFive />
    </HarvicsOSShell>
  )
}
