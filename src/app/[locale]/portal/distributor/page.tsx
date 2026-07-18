import AuthGuard from '@/components/shared/AuthGuard'
import DistributorDashboard from '@/components/portals/DistributorDashboard'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { UserRole } from '@/types/userScope'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function DistributorPortalPage() {
  const allowedRoles: UserRole[] = ['distributor', 'sales_officer', 'company_admin', 'admin', 'hq', 'super_admin']

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div>
        {/* Photo hero banner */}
        <div 
          className="h-48 md:h-56 w-full relative overflow-hidden"
          style={{ backgroundImage: "url('/assets/shared/heroes/distributor-portal-hero.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-harvics-burgundy/60" />
          <div className="relative max-w-7xl mx-auto px-6 h-full flex items-end pb-6">
            <div>
              <p className="text-harvics-gold text-xs tracking-[0.2em] uppercase mb-1">Enterprise Portal</p>
              <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">Distributor Portal</h1>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-7xl mx-auto px-6 pt-6">
          <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} />
          <DistributorDashboard />
        </div>
      </div>
    </AuthGuard>
  )
}
