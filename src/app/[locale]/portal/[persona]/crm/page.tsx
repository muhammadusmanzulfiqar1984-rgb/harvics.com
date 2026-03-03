import { redirect } from 'next/navigation'
import { SUPPORTED_LOCALES } from '@/config/locales'

// Generate static params for all locales and personas
export async function generateStaticParams() {
  const locales = [...SUPPORTED_LOCALES]
  const personas = ['distributor', 'retailer', 'sales', 'manager', 'investor', 'copilot']
  
  return locales.flatMap(locale =>
    personas.map(persona => ({ locale, persona }))
  )
}

export default async function PortalCRMPage({
  params
}: {
  params: Promise<{ locale: string; persona: string }>
}) {
  const { locale, persona } = await params

  // Redirect to CRM OS domain instead of showing EnterpriseCRM
  // EnterpriseCRM is now used only in portal dashboard as overview
  redirect(`/${locale}/os/crm`)
}

