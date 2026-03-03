import CompanyDashboard from '@/components/shared/CompanyDashboard'
import AuthGuard from '@/components/shared/AuthGuard'

import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

// Generate static params for ALL supported locales (38 languages)
export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function CompanyDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <AuthGuard allowedRoles={['hq', 'country_manager', 'company_admin', 'super_admin']}>
      <CompanyDashboard />
    </AuthGuard>
  )
}
