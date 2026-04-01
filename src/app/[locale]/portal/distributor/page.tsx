import AuthGuard from '@/components/shared/AuthGuard'
import DistributorDashboard from '@/components/portals/DistributorDashboard'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { UserRole } from '@/types/userScope'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function DistributorPortalPage() {
  const allowedRoles: UserRole[] = ['distributor', 'sales_officer', 'company_admin', 'admin', 'hq', 'super_admin']

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <DistributorDashboard />
    </AuthGuard>
  )
}
