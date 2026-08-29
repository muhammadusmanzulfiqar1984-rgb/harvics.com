'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import RecipeModuleTwentyOne from '@/components/os-domains/RecipeModuleTwentyOne'

/** Module #21 — Recipe Management */
export default function RecipePage() {
  return (
    <HarvicsOSShell
      title="Recipe Management"
      subtitle="Module #21 — SAP+ recipes · yield · costing"
      activeDomain="manufacturing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Recipes' },
      ]}
    >
      <RecipeModuleTwentyOne />
    </HarvicsOSShell>
  )
}
