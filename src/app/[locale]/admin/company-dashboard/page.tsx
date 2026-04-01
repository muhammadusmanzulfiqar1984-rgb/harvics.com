import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CompanyDashboard from '@/components/shared/CompanyDashboard'
import { SUPPORTED_LOCALES } from '@/config/locales'

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }))
}

export default async function AdminCompanyDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Auth guard — require valid token cookie
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) {
    redirect(`/${locale}/login`)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#6B1F2B' }}>
      <CompanyDashboard />
    </div>
  )
}

