import { redirect } from 'next/navigation'
import { SUPPORTED_LOCALES } from '@/config/locales'

/** Admin portal CRM → single OS Smart CRM (no open EnterpriseCRM surface). */
export async function generateStaticParams() {
  const locales = [...SUPPORTED_LOCALES]
  const personas = ['distributor', 'retailer', 'sales', 'manager', 'investor', 'copilot']
  return locales.flatMap((locale) => personas.map((persona) => ({ locale, persona })))
}

export default async function AdminPortalCRMPage({
  params,
}: {
  params: Promise<{ locale: string; persona: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/os/crm`)
}
