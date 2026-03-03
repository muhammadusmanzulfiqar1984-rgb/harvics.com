import AuthGuard from '@/components/shared/AuthGuard'
import { SupplierDashboard as SupplierDashboardWidget } from '@/apps/crm/widgets/SupplierDashboard'
import EnterpriseCRM from '@/components/shared/EnterpriseCRM'
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
  const allowedRoles: UserRole[] = ['supplier']

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="space-y-8 p-6">
        {/* Supplier Dashboard Widget (KPIs & Actions) */}
        <div>
          <h1 className="text-2xl font-bold text-[#C3A35E] mb-6">Supplier Cockpit</h1>
          <SupplierDashboardWidget />
        </div>

        {/* Supplier CRM System (Transactional) */}
        <section className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#C3A35E] mb-2">
              🚚 Supplier CRM System
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm">
              Complete supplier management: Purchase orders, shipments, invoices, quality control, and contract management
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border-2 border-[#C3A35E]/30 overflow-hidden">
            <EnterpriseCRM persona="supplier" locale={locale} />
          </div>
        </section>
      </div>
    </AuthGuard>
  )
}
