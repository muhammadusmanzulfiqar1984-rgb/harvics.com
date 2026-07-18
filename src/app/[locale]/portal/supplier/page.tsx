import AuthGuard from '@/components/shared/AuthGuard'
import { SupplierDashboard as SupplierDashboardWidget } from '@/apps/crm/widgets/SupplierDashboard'
import EnterpriseCRM from '@/components/shared/EnterpriseCRM'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { UserRole } from '@/types/userScope'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { useLocale } from 'next-intl'

// Generate static params for ALL supported locales (38 languages)
export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function SupplierPortalPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const allowedRoles: UserRole[] = ['supplier', 'company_admin', 'admin', 'hq', 'super_admin']

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div>
        {/* Photo hero banner */}
        <div 
          className="h-48 md:h-56 w-full relative overflow-hidden"
          style={{ backgroundImage: "url('/assets/shared/heroes/supplier-portal-hero.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-harvics-burgundy/60" />
          <div className="relative max-w-7xl mx-auto px-6 h-full flex items-end pb-6">
            <div>
              <p className="text-harvics-gold text-xs tracking-[0.2em] uppercase mb-1">Enterprise Portal</p>
              <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">Supplier Portal</h1>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6 max-w-7xl mx-auto">
          <LocalizationBar compact showGeo={false} className="items-center gap-2" />

          {/* Supplier Dashboard Widget (KPIs & Actions) */}
          <div>
            <h1 className="text-2xl font-bold text-harvics-gold mb-6">Supplier Cockpit</h1>
            <SupplierDashboardWidget />
          </div>

          {/* Supplier CRM System (Transactional) */}
          <section className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-harvics-gold mb-2">
                🚚 Supplier CRM System
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-sm">
                Complete supplier management: Purchase orders, shipments, invoices, quality control, and contract management
              </p>
            </div>
            <div className="bg-white shadow-lg border-2 border-harvics-gold/30 overflow-hidden">
              <EnterpriseCRM persona="supplier" locale={locale} />
            </div>
          </section>
        </div>
      </div>
    </AuthGuard>
  )
}
