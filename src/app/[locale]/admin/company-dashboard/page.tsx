import CompanyDashboard from '@/components/shared/CompanyDashboard'
import { SUPPORTED_LOCALES } from '@/config/locales'

// Generate static params for all locales
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function AdminCompanyDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Direct access - no authentication required
  // This is for development/admin access to view and make changes
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#6B1F2B' }}>
      {/* Admin Access Banner */}
      <div style={{ 
        backgroundColor: '#10b981', 
        color: 'white', 
        padding: '15px', 
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        borderBottom: '3px solid #059669',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        🔓 ADMIN ACCESS - Company Portal (No Authentication Required) | Locale: {locale}
      </div>
      <CompanyDashboard />
    </div>
  )
}

